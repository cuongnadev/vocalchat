import type { ICall, CallType, CallStatus } from '@/models/call.model';

export type { CallType, CallStatus };

// Payload for initiating a call
export interface InitiateCallPayload {
  conversationId: string;
  callerId: string;
  participantIds: string[];
  type: CallType;
  isGroup: boolean;
}

// Payload for call response (accept/reject)
export interface CallResponsePayload {
  callId: string;
  oderId: string;
  response: 'accept' | 'reject';
}

// Payload for ending a call
export interface EndCallPayload {
  callId: string;
  oderId: string;
}

// Payload for WebRTC signaling
export interface WebRTCSignalPayload {
  callId: string;
  senderId: string;
  targetId: string;
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
  type: 'offer' | 'answer' | 'ice-candidate';
}

// Payload for incoming call notification
export interface IncomingCallPayload {
  call: ICall;
  caller: {
    _id: string;
    name: string;
    avatar: string;
  };
  conversationName?: string;
}

// Payload for call status update
export interface CallStatusUpdatePayload {
  callId: string;
  status: CallStatus;
  userId?: string;
}

// Payload for call ended notification
export interface CallEndedPayload {
  callId: string;
  duration?: number;
  reason: 'ended' | 'missed' | 'rejected' | 'busy' | 'error';
}

// Payload for participant joined/left
export interface ParticipantUpdatePayload {
  callId: string;
  oderId: string;
  action: 'joined' | 'left';
}

// Check if user is in call
export interface UserInCallPayload {
  oderId: string;
  isInCall: boolean;
  callId?: string;
}

// Call history for message display
export interface CallHistoryMessage {
  _id: string;
  conversationId: string;
  callerId: string;
  type: CallType;
  status: CallStatus;
  duration?: number;
  startedAt?: string;
  endedAt?: string;
  isGroup: boolean;
  createdAt: string;
}
