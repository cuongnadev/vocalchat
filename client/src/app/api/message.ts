import type { MessageResponse } from "@/types/message";
import { requestApi } from "./request";

export const getMessagesByConversationId = (conversationId: string) => {
    return requestApi<MessageResponse[]>(`/messages/conversations/${conversationId}`, {
        method: "GET",
    });
}