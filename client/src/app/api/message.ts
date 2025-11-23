import type { MessageResponse } from "@/types/message";
import { requestApi } from "./request";

export const getMessagesByConversationId = (conversationId: string) => {
    return requestApi<MessageResponse[]>(`/messages/conversations/${conversationId}`, {
        method: "GET",
    });
}

export const convertVoiceToText = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');

    return requestApi<string>('/messages/record/voice-to-text', {
        method: "POST",
        body: formData,
    });
}