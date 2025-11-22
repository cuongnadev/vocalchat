import { IMessage } from '@/types/message';
import { IUser } from '@/types/user';
import { Document, model, Schema, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: IUser[] | Types.ObjectId[];
  lastMessage: IMessage | Types.ObjectId | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  admin?: Types.ObjectId | IUser;
  deletedBy?: Types.ObjectId[];
  deletedAt?: Array<{ userId: string; timestamp: Date }>;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    unreadCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    groupAvatar: { type: String },
    admin: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedAt: [
      {
        userId: { type: String, required: true },
        timestamp: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true },
);

export const Conversation = model('Conversation', conversationSchema);
