import mongoose from 'mongoose';
import { env } from '@/config/env.config';

export const connectDB = async (): Promise<void> => {
  try {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found in .env');
    }
    await mongoose.connect(env.DATABASE_URL);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', (error as Error).message);
    process.exit(1);
  }
};
