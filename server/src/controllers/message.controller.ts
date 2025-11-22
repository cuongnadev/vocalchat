import { MessageService } from '@/services/message.service';
import { Request, Response } from 'express';

export const MessageController = {
  async getMessageByConversationId(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required',
        data: null,
      });
    }

    try {
      const messages = await MessageService.getMessageByConversationId(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Get conversation successfully',
        data: messages,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },
};
