import { model, Schema } from 'mongoose';
import { IMessage } from '@/types/message';

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    sender: { type: String, enum: ['me', 'them'], required: true },
    isRead: { type: Boolean, required: true, default: false },
    status: { type: String, enum: ['sending', 'sent', 'read', 'failed'], required: true },
    type: { type: String, enum: ['text', 'image', 'file', 'audio', 'video'], required: true },
  },
  { timestamps: true },
);

export const Message = model('Message', messageSchema);
