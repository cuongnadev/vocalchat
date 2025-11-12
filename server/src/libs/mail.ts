import nodemailer from 'nodemailer';
import { env } from '@/config/env.config';

export async function sendMail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"VocalChat" <${env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}
