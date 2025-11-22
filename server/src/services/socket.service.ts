import { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SendTextMessagePayload,
  SendFileMessagePayload,
  TypingPayload,
  UserStatusPayload,
  ReceiveMessagePayload,
  ConversationUpdatedPayload,
  MarkMessagesReadPayload,
} from '@/types/socket';
import type { IMessage, MessageType } from '@/types/message';
import { Message } from '@/models/message.model';
import { Conversation } from '@/models/conversation.model';
import { User } from '@/models/user.model';

const onlineUsers = new Map<string, string>();

export function getOnlineUsers() {
  return onlineUsers;
}

let ioInstance: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
}

type SendMessagePayload = SendTextMessagePayload | SendFileMessagePayload;

async function handleSendMessage(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  payload: SendMessagePayload,
) {
  console.log('payload [36]: ', payload);

  const messageData: Partial<IMessage> = {
    conversationId: payload.conversationId,
    senderId: payload.senderId,
    text: 'text' in payload ? payload.text : '',
    isRead: false,
    status: 'sent',
    type: payload.type as MessageType,
  };

  console.log('Message data: ', messageData);

  const message = new Message(messageData);
  await message.save();

  // Update conversation with lastMessage and restore for deleted users
  const conversation: any = await Conversation.findById(payload.conversationId);
  if (conversation) {
    conversation.lastMessage = message._id;

    if (conversation.deletedBy && conversation.deletedBy.length > 0) {
      console.log('Clearing deletedBy array:', conversation.deletedBy);
      conversation.deletedBy = [];
    }

    await conversation.save();
  }

  // Get conversation to count unread messages
  const populatedConversation = await Conversation.findById(payload.conversationId).populate(
    'participants',
  );

  if (!populatedConversation) {
    console.error('Conversation not found');
    return;
  }

  // Send message to receivers
  for (const receive of payload.receiverId) {
    const receiverSocketId = onlineUsers.get(receive._id);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message:receive', { message } as ReceiveMessagePayload);
    }
  }

  // Emit conversation updated event to all participants
  const participantIds = populatedConversation.participants.map((p: any) => p._id.toString());

  for (const participantId of participantIds) {
    const socketId = onlineUsers.get(participantId);

    if (socketId) {
      // Count unread messages for this participant
      const unreadCount = await Message.countDocuments({
        conversationId: payload.conversationId,
        senderId: { $ne: participantId },
        isRead: false,
      });

      io.to(socketId).emit('conversation:updated', {
        conversationId: payload.conversationId,
        lastMessage: message,
        unreadCount,
        participantIds,
      } as ConversationUpdatedPayload);
    }
  }
}

export function initSocket(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  ioInstance = io;

  io.on('connection', async (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log('Socket connected: ', socket.id);

    const userId = socket.handshake.auth?.userId as string;

    if (!userId) {
      socket.disconnect();
      return;
    }

    onlineUsers.set(userId, socket.id);

    // Update user status in database
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Broadcast this user's online status to all clients
    io.emit('user:status', { userId, online: true } as UserStatusPayload);

    // Send status of all currently online users to the newly connected user
    for (const [onlineUserId] of onlineUsers) {
      if (onlineUserId !== userId) {
        socket.emit('user:status', { userId: onlineUserId, online: true } as UserStatusPayload);
      }
    }

    socket.on('message:send:text', (payload: SendTextMessagePayload) =>
      handleSendMessage(io, payload),
    );

    socket.on('message:send:file', (payload: SendFileMessagePayload) =>
      handleSendMessage(io, payload),
    );

    socket.on('typing:update', (payload: TypingPayload) => {
      const receiverSocketId = onlineUsers.get(payload.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:update', payload);
      }
    });

    socket.on('messages:mark:read', async (payload: MarkMessagesReadPayload) => {
      try {
        // Mark all unread messages in this conversation as read
        await Message.updateMany(
          {
            conversationId: payload.conversationId,
            senderId: { $ne: payload.userId },
            isRead: false,
          },
          { isRead: true },
        );

        // Get conversation to update all participants
        const conversation = await Conversation.findById(payload.conversationId).populate(
          'participants',
        );

        if (conversation) {
          const participantIds = conversation.participants.map((p: any) => p._id.toString());

          // Notify all participants about the updated unread count
          for (const participantId of participantIds) {
            const socketId = onlineUsers.get(participantId);

            if (socketId) {
              // Count unread messages for this participant
              const unreadCount = await Message.countDocuments({
                conversationId: payload.conversationId,
                senderId: { $ne: participantId },
                isRead: false,
              });

              const lastMessage = await Message.findById(conversation.lastMessage);

              if (lastMessage) {
                io.to(socketId).emit('conversation:updated', {
                  conversationId: payload.conversationId,
                  lastMessage,
                  unreadCount,
                  participantIds,
                } as ConversationUpdatedPayload);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);

      // Update user status in database
      await User.findByIdAndUpdate(userId, { isOnline: false });

      io.emit('user:status', { userId, online: false } as UserStatusPayload);
    });
  });
}
