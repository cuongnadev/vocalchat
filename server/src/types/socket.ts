import type { IMessage, MessageType } from './message';
import { UserRequest } from './user';

export interface SendTextMessagePayload {
  conversationId: string;
  senderId: string;
  receiverId: UserRequest[];
  text: string;
  type: Extract<MessageType, 'text'>;
}

export interface SendFileMessagePayload {
  conversationId: string;
  senderId: string;
  receiverId: UserRequest[];
  fileName: string;
  fileType: string;
  fileSize: number;
  buffer: ArrayBuffer;
  type: Extract<MessageType, 'image' | 'file' | 'audio' | 'video'>;
}

export interface ReceiveMessagePayload {
  message: IMessage;
}

export interface TypingPayload {
  conversationId: string;
  senderId: string;
  receiverId: string;
  isTyping: boolean;
}

export interface UserStatusPayload {
  userId: string;
  online: boolean;
}

export interface ConversationUpdatedPayload {
  conversationId: string;
  lastMessage: IMessage;
  unreadCount: number;
  participantIds: string[];
}

export interface MarkMessagesReadPayload {
  conversationId: string;
  userId: string;
}

export interface ConversationCreatedPayload {
  conversationId: string;
  participantId: string;
  friendId: string;
}

export interface ConversationDeletedPayload {
  conversationId: string;
  participantIds: string[];
}

export interface ClientToServerEvents {
  'message:send:text': (payload: SendTextMessagePayload) => void;
  'message:send:file': (payload: SendFileMessagePayload) => void;
  'typing:update': (payload: TypingPayload) => void;
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
  'messages:mark:read': (payload: MarkMessagesReadPayload) => void;
}

export interface ServerToClientEvents {
  'message:receive': (payload: ReceiveMessagePayload) => void;
  'typing:update': (payload: TypingPayload) => void;
  'user:status': (payload: UserStatusPayload) => void;
  'conversation:created': (payload: ConversationCreatedPayload) => void;
  'conversation:updated': (payload: ConversationUpdatedPayload) => void;
  'conversation:deleted': (payload: ConversationDeletedPayload) => void;
}
