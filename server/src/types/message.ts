import { Document } from 'mongoose';

export type MessageSender = 'me' | 'them';
export type MessageStatus = 'sending' | 'sent' | 'read' | 'failed';
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  text: string;
  sender: MessageSender;
  isRead: boolean;
  status: MessageStatus;
  type?: MessageType;
}
