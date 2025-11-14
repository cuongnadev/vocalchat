export type User = {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  phone?: string;
  password?: string;
  isOnline: boolean;
  lastSeen?: string;
};
