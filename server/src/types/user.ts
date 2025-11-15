import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  avatar?: string;
  email: string;
  phone?: string;
  password: string;
  isVerified: boolean;
  isOnline: boolean;
  lastSeen: string;
}

export type UserRequest = {
  _id: string;
  name: string;
  avatar: string;
  email?: string;
  phone?: string;
  password?: string;
  isVerified: boolean;
  isOnline: boolean;
  lastSeen?: string;
};
