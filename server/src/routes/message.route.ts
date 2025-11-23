import { MessageController } from '@/controllers/message.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { upload } from '@/middlewares/upload.middleware';
import { Router } from 'express';

const router = Router();

router.get('/conversations/:id', authMiddleware, MessageController.getMessageByConversationId);
router.post(
  '/record/voice-to-text',
  authMiddleware,
  upload.single('audio'),
  MessageController.convertVoiceToText,
);

export const messageRoutes = router;
