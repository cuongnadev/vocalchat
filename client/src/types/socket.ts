import type { MessageResponse, MessageType } from "./message";

export interface SendTextMessagePayload {
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: Extract<MessageType, "text">;
}

export interface SendFileMessagePayload {
  conversationId: string;
  senderId: string;
  receiverId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  buffer: ArrayBuffer;
  type: Extract<MessageType, "image" | "file" | "audio" | "video">;
}

export interface ReceiveMessagePayload {
  message: MessageResponse;
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

export interface ConversationCreatedPayload {
  conversationId: string;
  participantId: string;
  friendId: string;
}

export interface ClientToServerEvents {
  "message:send:text": (payload: SendTextMessagePayload) => void;
  "message:send:file": (payload: SendFileMessagePayload) => void;
  "typing:update": (payload: TypingPayload) => void;
  "user:online": (userId: string) => void;
  "user:offline": (userId: string) => void;
}

export interface ServerToClientEvents {
  "message:receive": (payload: ReceiveMessagePayload) => void;
  "typing:update": (payload: TypingPayload) => void;
  "user:status": (payload: UserStatusPayload) => void;
  "conversation:created": (payload: ConversationCreatedPayload) => void;
}
