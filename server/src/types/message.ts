import { Document } from 'mongoose';

export type MessageStatus = 'sending' | 'sent' | 'read' | 'failed';
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'call';

export interface FileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  fileUrl: string;
}

export interface CallMetadata {
  callId: string;
  callType: 'audio' | 'video';
  callStatus: 'ended' | 'missed' | 'rejected' | 'busy';
  duration?: number;
  startedAt?: Date;
  endedAt?: Date;
}

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  status: MessageStatus;
  type?: MessageType;
  fileMetadata?: FileMetadata;
  callMetadata?: CallMetadata;
}
