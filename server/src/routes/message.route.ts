import { MessageController } from '@/controllers/message.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/conversations/:id', authMiddleware, MessageController.getMessageByConversationId);

export const messageRoutes = router;
