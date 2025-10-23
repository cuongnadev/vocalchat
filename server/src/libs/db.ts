import { env } from '@/config/env.config';
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.DATABASE_URL);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', (error as Error).message);
    process.exit(1);
  }
};
