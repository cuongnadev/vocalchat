import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  avatar?: string;
  email?: string;
  phone: string;
  password: string;
  isVerified: boolean;
  isOnline: boolean;
  lastSeen: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    email: { type: String, required: false, default: '' },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: String, default: '' },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', userSchema);
