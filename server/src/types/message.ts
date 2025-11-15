import { Document } from 'mongoose';

export type MessageStatus = 'sending' | 'sent' | 'read' | 'failed';
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  status: MessageStatus;
  type?: MessageType;
}
