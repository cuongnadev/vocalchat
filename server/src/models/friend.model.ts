import { IUser } from '@/types/user';
import { Document, model, Schema, Types } from 'mongoose';

export type FriendStatus = 'pending' | 'accepted' | 'rejected';

export interface IFriend extends Document {
  requester: IUser | Types.ObjectId;
  recipient: IUser | Types.ObjectId;
  status: FriendStatus;
}

const friendSchema = new Schema<IFriend>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], required: true },
  },
  { timestamps: true },
);

export const Friend = model('Friend', friendSchema);
