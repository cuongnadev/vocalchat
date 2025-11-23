import { model, Schema } from 'mongoose';
import { IMessage } from '@/types/message';

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
    status: { type: String, enum: ['sending', 'sent', 'read', 'failed'], required: true },
    type: { type: String, enum: ['text', 'image', 'file', 'audio', 'video'], required: true },
    fileMetadata: {
      fileName: { type: String },
      fileType: { type: String },
      fileSize: { type: Number },
      filePath: { type: String },
      fileUrl: { type: String },
    },
  },
  { timestamps: true },
);

export const Message = model('Message', messageSchema);
