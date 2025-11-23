import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { Request, Response } from 'express';
import { MessageService } from '@/services/message.service';
import axios from 'axios';

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

  async convertVoiceToText(req: Request, res: Response) {
    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ success: false, message: 'No audio file provided', data: null });

    const form = new FormData();
    form.append('file', file.buffer, file.originalname);

    try {
      const whisperResponse = await axios.post('http://localhost:8000/transcribe', form, {
        headers: form.getHeaders(),
      });

      return res.json({
        success: true,
        data: whisperResponse.data.text,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed' });
    }
  },
};
