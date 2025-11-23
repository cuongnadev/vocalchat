import { env } from '@/config/env.config';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided', data: null });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email?: string };

    console.log(decoded);
    console.log(decoded.id);

    req.user = {
      userId: decoded.id,
      email: decoded.email || '',
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token', data: error });
  }
};
