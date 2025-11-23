export type User = {
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
