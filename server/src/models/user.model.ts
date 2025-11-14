import { IUser } from '@/types/user';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, default: '' },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: String, default: '' },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', userSchema);
