import { env } from '@/config/env.config';
import { comparePassword, hashPassword } from '@/libs/hash';
import { sendMail } from '@/libs/mail';
import { generateOtp } from '@/libs/otp';
import { Otp } from '@/models/otp.model';
import { User } from '@/models/user.model';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ success: false, message: 'Missing email or password' });

      const exits = await User.findOne({ email });
      if (exits)
        return res.status(400).json({ success: false, message: 'Email number already exists' });

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const otp = await Otp.create({
        email,
        code,
        expiresAt,
      });

      await sendMail(
        email,
        'Your VocalChat OTP code',
        `Hello! Your OTP code is: ${code}. It will expire in 5 minutes.`,
      );
      console.log('📩 OTP for', email, '=>', otp);

      const hashedPassword = await hashPassword(password);

      const newUser = await User.create({
        email,
        password: hashedPassword,
        lastSeen: new Date().toISOString(),
      });

      return res.status(201).json({
        success: true,
        data: { user_id: newUser._id },
        message: 'Account created, check OTP',
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', data: err });
    }
  },

  async verify(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      if (!email || !code)
        return res.status(400).json({ success: false, message: 'Missing email or code' });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false, message: 'Account not found' });
      if (user.isVerified)
        return res
          .status(400)
          .json({ success: false, message: 'Account already verified', data: null });

      const otpRecord = await Otp.findOne({ email, code });
      if (!otpRecord)
        return res.status(400).json({ success: false, message: 'Invalid OTP', data: null });

      if (otpRecord.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ success: false, message: 'OTP expired', data: null });
      }

      user.isVerified = true;
      await user.save();

      await Otp.deleteMany({ email });

      return res
        .status(200)
        .json({ success: true, data: { user }, message: 'Verified successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', data: err });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const { email, name } = req.body;
      if (!email || !name)
        return res
          .status(400)
          .json({ success: false, message: 'Missing email or name', data: null });

      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ success: false, message: 'Account not found', data: null });
      if (!user.isVerified)
        return res.status(400).json({ success: false, message: 'Unverified account', data: null });

      user.name = name || user.name;
      user.save();

      const token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: '7d' });

      return res
        .status(200)
        .json({ success: true, data: { user, token }, message: 'Profile updated' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', data: err });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ success: false, message: 'Missing email or password', data: null });

      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ success: false, message: 'Account not found', data: null });

      const match = await comparePassword(password, user.password);
      if (!match)
        return res.status(400).json({ success: false, message: 'Incorrect password', data: null });

      if (!user.isVerified)
        return res.status(400).json({ success: false, message: 'Unverified account', data: null });

      if (!user.name.trim())
        return res
          .status(400)
          .json({ success: false, message: 'Profile not completed', data: null });

      const token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: '7d' });

      user.isOnline = true;
      user.lastSeen = new Date().toISOString();
      await user.save();

      return res
        .status(200)
        .json({ success: true, data: { user, token }, message: 'Login successful' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', data: err });
    }
  },
};
