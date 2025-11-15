import React, { useEffect, useState } from "react";
import { MessageItem } from "./MessageItem";
import { getConversations } from "@/app/api";
import type { Conversation } from "@/types/message";
import { socketService } from "@/services/socketService";
import type {
  ConversationUpdatedPayload,
  UserStatusPayload,
} from "@/types/socket";

type MessageListProps = {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  refreshTrigger?: number;
};

export const MessageList = ({
  activeConversationId,
  onSelectConversation,
  refreshTrigger,
}: MessageListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>();

  useEffect(() => {
    try {
      const fetchConversation = async () => {
        const response = await getConversations();

        if (!response.success) {
          throw new Error(response.message || "Failed to get conversations");
        }

        setConversations(response.data);
      };

      fetchConversation();
    } catch (error) {
      console.log("Error fetching conversations:", error);
    }
  }, [refreshTrigger]);

  // Listen for conversation updates
  useEffect(() => {
    const handleConversationUpdated = (payload: ConversationUpdatedPayload) => {
      setConversations((prev) => {
        if (!prev) return prev;

        return prev.map((conv) => {
          if (conv._id === payload.conversationId) {
            return {
              ...conv,
              lastMessage: payload.lastMessage,
              unreadCount: payload.unreadCount,
            };
          }
          return conv;
        });
      });
    };

    const handleUserStatus = (payload: UserStatusPayload) => {
      setConversations((prev) => {
        if (!prev) return prev;

        return prev.map((conv) => ({
          ...conv,
          participants: conv.participants.map((participant) => {
            if (participant._id === payload.userId) {
              return {
                ...participant,
                isOnline: payload.online,
              };
            }
            return participant;
          }),
        }));
      });
    };

    socketService.onConversationUpdated(handleConversationUpdated);
    socketService.onUserStatus(handleUserStatus);

    return () => {
      socketService.offConversationUpdated(handleConversationUpdated);
      socketService.offUserStatus(handleUserStatus);
    };
  }, []);

  // Filter pinned (Started) and unpinned (Messages) conversations
  const starredConversations = conversations?.filter((c) => c.isPinned) || [];
  const otherConversations = conversations?.filter((c) => !c.isPinned) || [];

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Started Section - Pinned conversations */}
      {starredConversations.length > 0 && (
        <div className="flex flex-col">
          <h5 className="font-bold text-base px-2 mb-2 text-violet-200">
            Started
          </h5>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 max-h-[200px] overflow-y-auto scrollbar-hide">
            {starredConversations.map((conv, index) => (
              <React.Fragment key={conv._id}>
                <MessageItem
                  conversation={conv}
                  isActive={activeConversationId === conv._id}
                  onClick={onSelectConversation}
                />
                {index < starredConversations.length - 1 && (
                  <div className="border-t border-white/10 my-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Messages Section - Regular conversations */}
      {otherConversations.length > 0 && (
        <div className="flex flex-col">
          <h5 className="font-bold text-base px-2 mb-2 text-violet-200">
            Messages
          </h5>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 max-h-[400px] overflow-y-auto scrollbar-hide">
            {otherConversations.map((conv, index) => (
              <React.Fragment key={conv._id}>
                <MessageItem
                  conversation={conv}
                  isActive={activeConversationId === conv._id}
                  onClick={onSelectConversation}
                />
                {index < otherConversations.length - 1 && (
                  <div className="border-t border-white/10 my-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
