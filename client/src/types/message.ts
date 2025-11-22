import type { User } from "./user";

export type MessageSender = "me" | "them";
export type MessageStatus = "sending" | "sent" | "read" | "failed";
export type MessageType = "text" | "image" | "file" | "audio" | "video";

export type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sender: MessageSender;
  isRead: boolean;
  status: MessageStatus;
  type: MessageType;
  createdAt: string;
  updatedAt: string;
};

export type MessageResponse = Omit<Message, "sender">;

export type Conversation = {
  _id: string;
  participants: User[];
  lastMessage: MessageResponse | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  admin?: string;
  createdAt: string;
  updatedAt: string;
};
