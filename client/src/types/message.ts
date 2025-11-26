import type { User } from "./user";

export type MessageSender = "me" | "them";
export type MessageStatus = "sending" | "sent" | "read" | "failed";
export type MessageType =
  | "text"
  | "image"
  | "file"
  | "audio"
  | "video"
  | "call";

export interface FileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  fileUrl: string;
}

export interface CallMetadata {
  callId: string;
  callType: "audio" | "video";
  callStatus: "ended" | "missed" | "rejected" | "busy";
  duration?: number;
  startedAt?: string;
  endedAt?: string;
}

export type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sender: MessageSender;
  isRead: boolean;
  status: MessageStatus;
  type: MessageType;
  fileMetadata?: FileMetadata;
  callMetadata?: CallMetadata;
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
