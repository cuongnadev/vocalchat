import { Document, model, Schema, Types } from 'mongoose';

export type CallType = 'audio' | 'video';
export type CallStatus =
  | 'pending'
  | 'ringing'
  | 'ongoing'
  | 'ended'
  | 'missed'
  | 'rejected'
  | 'busy';

export interface ICall extends Document {
  conversationId: Types.ObjectId;
  callerId: Types.ObjectId;
  participants: Types.ObjectId[];
  type: CallType;
  status: CallStatus;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  isGroup: boolean;
  rejectedBy?: Types.ObjectId[];
  missedBy?: Types.ObjectId[];
}

const callSchema = new Schema<ICall>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    type: { type: String, enum: ['audio', 'video'], required: true },
    status: {
      type: String,
      enum: ['pending', 'ringing', 'ongoing', 'ended', 'missed', 'rejected', 'busy'],
      default: 'pending',
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 },
    isGroup: { type: Boolean, default: false },
    rejectedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    missedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const Call = model<ICall>('Call', callSchema);
