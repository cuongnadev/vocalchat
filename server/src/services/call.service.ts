import { Call, ICall, CallStatus } from '@/models/call.model';
import { Conversation } from '@/models/conversation.model';
import { Message } from '@/models/message.model';
import { User } from '@/models/user.model';
import { getIO, getOnlineUsers } from './socket.service';
import type {
  IncomingCallPayload,
  CallStatusUpdatePayload,
  CallEndedPayload,
} from '@/types/socket';
import type { InitiateCallPayload, CallHistoryMessage } from '@/types/call';
import { Types } from 'mongoose';

const activeUserCalls = new Map<string, string>();

export function isUserInCall(oderId: string): boolean {
  return activeUserCalls.has(oderId);
}

export function getUserActiveCall(oderId: string): string | undefined {
  return activeUserCalls.get(oderId);
}

export function setUserInCall(oderId: string, callId: string): void {
  activeUserCalls.set(oderId, callId);
}

export function removeUserFromCall(oderId: string): void {
  activeUserCalls.delete(oderId);
}

export async function initiateCall(payload: InitiateCallPayload): Promise<ICall | null> {
  const io = getIO();
  const onlineUsers = getOnlineUsers();

  // Check if caller is already in a call
  if (isUserInCall(payload.callerId)) {
    const callerSocketId = onlineUsers.get(payload.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:error', { message: 'You are already in a call' });
    }
    return null;
  }

  // Check if any participant is already in a call
  const busyParticipants: string[] = [];
  for (const participantId of payload.participantIds) {
    if (isUserInCall(participantId)) {
      busyParticipants.push(participantId);
    }
  }

  // If all participants are busy, notify caller
  if (busyParticipants.length === payload.participantIds.length) {
    const callerSocketId = onlineUsers.get(payload.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:busy', {
        message: 'All participants are busy',
        busyParticipants,
      });
    }
    return null;
  }

  // Create call record
  const call = new Call({
    conversationId: new Types.ObjectId(payload.conversationId),
    callerId: new Types.ObjectId(payload.callerId),
    participants: payload.participantIds.map((id) => new Types.ObjectId(id)),
    type: payload.type,
    status: 'ringing',
    isGroup: payload.isGroup,
    missedBy: [],
    rejectedBy: [],
  });

  await call.save();

  // Set caller as in call
  setUserInCall(payload.callerId, (call._id as Types.ObjectId).toString());

  // Get caller info
  const caller = await User.findById(payload.callerId).select('_id name avatar');
  if (!caller) return null;

  // Get conversation info for group calls
  let conversationName: string | undefined;
  if (payload.isGroup) {
    const conversation = await Conversation.findById(payload.conversationId);
    conversationName = conversation?.groupName;
  }

  // Notify all available participants about incoming call
  const callObj = call.toObject();
  const incomingCallPayload: IncomingCallPayload = {
    call: {
      _id: (callObj._id as Types.ObjectId).toString(),
      conversationId: callObj.conversationId.toString(),
      callerId: callObj.callerId.toString(),
      participants: callObj.participants.map((p: Types.ObjectId) => p.toString()),
      type: callObj.type,
      status: callObj.status,
      isGroup: callObj.isGroup,
    },
    caller: {
      _id: (caller._id as Types.ObjectId).toString(),
      name: caller.name,
      avatar: caller.avatar || '',
    },
    conversationName,
  };

  for (const participantId of payload.participantIds) {
    // Skip busy participants
    if (busyParticipants.includes(participantId)) {
      continue;
    }

    const participantSocketId = onlineUsers.get(participantId);
    if (participantSocketId) {
      io.to(participantSocketId).emit('call:incoming', incomingCallPayload);
    } else {
      // User is offline, add to missed list
      call.missedBy = call.missedBy || [];
      if (!call.missedBy.some((id) => id.toString() === participantId)) {
        call.missedBy.push(new Types.ObjectId(participantId));
      }
    }
  }

  await call.save();

  // If there are busy participants, notify the caller
  if (busyParticipants.length > 0) {
    const callerSocketId = onlineUsers.get(payload.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:some:busy', {
        callId: (call._id as Types.ObjectId).toString(),
        busyParticipants,
      });
    }
  }

  return call;
}

export async function acceptCall(callId: string, oderId: string): Promise<boolean> {
  const io = getIO();
  const onlineUsers = getOnlineUsers();

  const call = await Call.findById(callId);
  if (!call) return false;

  // Check if user is already in another call
  if (isUserInCall(oderId) && getUserActiveCall(oderId) !== callId) {
    const oderSocketId = onlineUsers.get(oderId);
    if (oderSocketId) {
      io.to(oderSocketId).emit('call:error', { message: 'You are already in another call' });
    }
    return false;
  }

  // Update call status if this is the first participant accepting
  if (call.status === 'ringing') {
    call.status = 'ongoing';
    call.startedAt = new Date();
    await call.save();
  }

  // Set user as in call
  setUserInCall(oderId, callId);

  // Notify all participants about the acceptance
  const statusUpdate: CallStatusUpdatePayload = {
    callId,
    status: 'ongoing',
    userId: oderId,
  };

  // Notify caller
  const callerSocketId = onlineUsers.get(call.callerId.toString());
  if (callerSocketId) {
    io.to(callerSocketId).emit('call:accepted', { callId, oderId });
    io.to(callerSocketId).emit('call:status:update', statusUpdate);
  }

  // Notify other participants
  for (const participantId of call.participants) {
    if (participantId.toString() !== oderId) {
      const socketId = onlineUsers.get(participantId.toString());
      if (socketId) {
        io.to(socketId).emit('call:participant:joined', { callId, oderId });
        io.to(socketId).emit('call:status:update', statusUpdate);
      }
    }
  }

  return true;
}

export async function rejectCall(callId: string, oderId: string): Promise<boolean> {
  const io = getIO();
  const onlineUsers = getOnlineUsers();

  const call = await Call.findById(callId);
  if (!call) return false;

  // Add user to rejected list
  call.rejectedBy = call.rejectedBy || [];
  if (!call.rejectedBy.some((id) => id.toString() === oderId)) {
    call.rejectedBy.push(new Types.ObjectId(oderId));
  }

  // For 1:1 calls, end the call if rejected
  if (!call.isGroup) {
    call.status = 'rejected';
    call.endedAt = new Date();
    await call.save();

    // Remove from active calls
    removeUserFromCall(call.callerId.toString());

    // Notify caller
    const callerSocketId = onlineUsers.get(call.callerId.toString());
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:rejected', { callId, oderId });
      io.to(callerSocketId).emit('call:ended', {
        callId,
        reason: 'rejected',
      } as CallEndedPayload);
    }

    // Save call history as message
    await saveCallHistoryMessage(call);
  } else {
    // For group calls, check if all participants rejected
    const allRejected = call.participants.every(
      (p) =>
        call.rejectedBy?.some((r) => r.toString() === p.toString()) ||
        call.missedBy?.some((m) => m.toString() === p.toString()),
    );

    if (allRejected) {
      call.status = 'rejected';
      call.endedAt = new Date();
      removeUserFromCall(call.callerId.toString());

      // Notify caller
      const callerSocketId = onlineUsers.get(call.callerId.toString());
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:ended', {
          callId,
          reason: 'rejected',
        } as CallEndedPayload);
      }

      // Save call history
      await saveCallHistoryMessage(call);
    } else {
      // Notify caller about rejection
      const callerSocketId = onlineUsers.get(call.callerId.toString());
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:participant:rejected', { callId, oderId });
      }
    }

    await call.save();
  }

  return true;
}

export async function endCall(callId: string, oderId: string): Promise<boolean> {
  const io = getIO();
  const onlineUsers = getOnlineUsers();

  const call = await Call.findById(callId);
  if (!call) return false;

  // Calculate duration
  const endedAt = new Date();
  let duration = 0;
  if (call.startedAt) {
    duration = Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000);
  }

  call.status = 'ended';
  call.endedAt = endedAt;
  call.duration = duration;
  await call.save();

  // Remove all participants from active calls
  removeUserFromCall(call.callerId.toString());
  for (const participantId of call.participants) {
    removeUserFromCall(participantId.toString());
  }

  // Notify all participants
  const endedPayload: CallEndedPayload = {
    callId,
    duration,
    reason: 'ended',
  };

  // Notify caller
  if (call.callerId.toString() !== oderId) {
    const callerSocketId = onlineUsers.get(call.callerId.toString());
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:ended', endedPayload);
    }
  }

  // Notify participants
  for (const participantId of call.participants) {
    if (participantId.toString() !== oderId) {
      const socketId = onlineUsers.get(participantId.toString());
      if (socketId) {
        io.to(socketId).emit('call:ended', endedPayload);
      }
    }
  }

  // Save call history as message
  await saveCallHistoryMessage(call);

  return true;
}

export async function cancelCall(callId: string): Promise<boolean> {
  const io = getIO();
  const onlineUsers = getOnlineUsers();

  const call = await Call.findById(callId);
  if (!call) return false;

  // If call was answered, update those who didn't answer as missed
  if (call.status === 'ringing') {
    call.status = 'missed';
    call.endedAt = new Date();

    // All participants who didn't answer are missed
    for (const participantId of call.participants) {
      if (!call.missedBy?.some((id) => id.toString() === participantId.toString())) {
        call.missedBy = call.missedBy || [];
        call.missedBy.push(participantId);
      }
    }
  }

  await call.save();

  // Remove caller from active calls
  removeUserFromCall(call.callerId.toString());

  // Notify all participants that call was cancelled
  for (const participantId of call.participants) {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      io.to(socketId).emit('call:cancelled', { callId });
    }
  }

  // Save call history
  await saveCallHistoryMessage(call);

  return true;
}

export async function handleWebRTCSignal(
  callId: string,
  senderId: string,
  targetId: string,
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit,
  type: 'offer' | 'answer' | 'ice-candidate',
): Promise<void> {
  const io = getIO();
  const onlineUsers = getOnlineUsers();

  const targetSocketId = onlineUsers.get(targetId);
  if (targetSocketId) {
    io.to(targetSocketId).emit('call:signal', {
      callId,
      senderId,
      targetId,
      signal,
      type,
    });
  }
}

async function saveCallHistoryMessage(call: ICall): Promise<void> {
  // Create a message to represent the call history
  const callId = (call._id as Types.ObjectId).toString();
  const message = new Message({
    conversationId: call.conversationId.toString(),
    senderId: call.callerId.toString(),
    text: `${call.type === 'video' ? 'Video' : 'Audio'} call - ${formatCallStatus(call.status)}${call.duration ? ` (${formatDuration(call.duration)})` : ''}`,
    isRead: false,
    status: 'sent',
    type: 'call',
    callMetadata: {
      callId,
      callType: call.type,
      callStatus: call.status,
      duration: call.duration,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
    },
  });

  await message.save();

  // Update conversation's last message
  await Conversation.findByIdAndUpdate(call.conversationId, {
    lastMessage: message._id,
  });

  // Emit conversation update to all participants
  const io = getIO();
  const onlineUsers = getOnlineUsers();

  const conversation = await Conversation.findById(call.conversationId).populate('participants');
  if (conversation) {
    const participantIds = (conversation.participants as any[]).map((p) => p._id.toString());

    for (const participantId of participantIds) {
      const socketId = onlineUsers.get(participantId);
      if (socketId) {
        io.to(socketId).emit('call:history', {
          message: message.toObject(),
          callId,
        });

        // Also emit conversation update
        io.to(socketId).emit('conversation:updated', {
          conversationId: call.conversationId.toString(),
          lastMessage: message.toObject(),
          unreadCount: 0,
          participantIds,
        });
      }
    }
  }
}

function formatCallStatus(status: CallStatus): string {
  switch (status) {
    case 'ended':
      return 'Ended';
    case 'missed':
      return 'Missed';
    case 'rejected':
      return 'Declined';
    case 'busy':
      return 'Busy';
    default:
      return status;
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function getCallHistory(conversationId: string): Promise<CallHistoryMessage[]> {
  const calls = await Call.find({ conversationId }).sort({ createdAt: -1 }).limit(50).lean();

  return calls.map((call) => ({
    _id: call._id.toString(),
    conversationId: call.conversationId.toString(),
    callerId: call.callerId.toString(),
    type: call.type,
    status: call.status,
    duration: call.duration,
    startedAt: call.startedAt?.toISOString(),
    endedAt: call.endedAt?.toISOString(),
    isGroup: call.isGroup,
    createdAt: (call as any).createdAt.toISOString(),
  }));
}
