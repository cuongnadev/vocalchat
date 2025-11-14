import { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SendTextMessagePayload,
  SendFileMessagePayload,
  TypingPayload,
  UserStatusPayload,
  ReceiveMessagePayload,
} from '@/types/socket';
import type { IMessage, MessageType } from '@/types/message';
import { Message } from '@/models/message.model';

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
  const receiverSocketId = onlineUsers.get(payload.receiverId);

  const messageData: Partial<IMessage> = {
    conversationId: payload.conversationId,
    senderId: payload.senderId,
    text: 'text' in payload ? payload.text : '',
    sender: 'them',
    isRead: false,
    status: 'sent',
    type: payload.type as MessageType,
  };

  console.log('Message data: ', messageData);

  const message = new Message(messageData);
  await message.save();

  if (receiverSocketId) {
    io.to(receiverSocketId).emit('message:receive', { message } as ReceiveMessagePayload);
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
    io.emit('user:status', { userId, online: true } as UserStatusPayload);

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

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:status', { userId, online: false } as UserStatusPayload);
    });
  });
}
