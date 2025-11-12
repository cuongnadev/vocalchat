export type MessageSender = "me" | "them";
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type User = {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  phone?: string;
  isOnline: boolean;
  lastSeen?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
  isRead: boolean;
  status: MessageStatus;
  type?: "text" | "image" | "file" | "audio" | "video";
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
