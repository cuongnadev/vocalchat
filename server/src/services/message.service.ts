import { Message } from '@/models/message.model';
import { Conversation } from '@/models/conversation.model';

export const MessageService = {
  async getMessageByConversationId(conversationId: string, userId: string) {
    if (!conversationId) throw new Error('Conversation ID is required');

    const conversation: any = await Conversation.findById(conversationId);

    let query: any = { conversationId };

    // If user has deleted this conversation, only show messages after deletion time
    if (conversation && conversation.deletedAt && Array.isArray(conversation.deletedAt)) {
      const deletedEntry = conversation.deletedAt.find((item: any) => item.userId === userId);

      if (deletedEntry && deletedEntry.timestamp) {
        query.createdAt = { $gt: deletedEntry.timestamp };
      }
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });

    return messages;
  },
};
