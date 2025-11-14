import type { User } from "./user";

export type MessageSender = "me" | "them";
export type MessageStatus = "sending" | "sent" | "read" | "failed";
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sender: MessageSender;
  isRead: boolean;
  status: MessageStatus;
  type?: MessageType;
  createdAt: string;
  updatedAt?: string;
};

export type Conversation = {
  id: string;
  participantId: string;
  participant: User;
  lastMessage: Message | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};
