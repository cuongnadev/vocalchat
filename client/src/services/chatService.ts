import { convertVoiceToText, getMessagesByConversationId } from "@/app/api/message";

class ChatService {
    async getMessagesByConversationId(conversationId: string) {
        if (!conversationId) throw new Error('Conversation ID is required');

        const messages = await getMessagesByConversationId(conversationId);

        if (!messages) {
            throw new Error('Message not found');
        }

        return messages;
    }

    async convertVoiceToText(audioBlob: Blob) {
        return await convertVoiceToText(audioBlob);
    }
}

export const chatService = new ChatService();