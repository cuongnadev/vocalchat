import { Message } from '@/models/message.model';

export const MessageService = {
  async getMessageByConversationId(conversationId: string) {
    if (!conversationId) throw new Error('Conversation ID is required');

    const messages = await Message.find({
      conversationId,
    });

    if (!messages) {
      throw new Error('Message not found');
    }

    return messages;
  },
};
