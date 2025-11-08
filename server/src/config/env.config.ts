import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5240,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  EMAIL_USER: process.env.EMAIL_USER || 'your_email@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'asdfghjklzxcvbnm',
};
