import mongoose, { Schema } from 'mongoose';

export interface IOtp extends Document {
  phone: string;
  code: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    phone: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
