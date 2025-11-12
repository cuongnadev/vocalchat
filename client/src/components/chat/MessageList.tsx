import React from "react";
import { MessageItem } from "./MessageItem";
import { conversationsData } from "@/constants/mock-data";

type MessageListProps = {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
};

export const MessageList = ({
  activeConversationId,
  onSelectConversation,
}: MessageListProps) => {
  // Filter pinned (Started) and unpinned (Messages) conversations
  const starredConversations = conversationsData.filter((c) => c.isPinned);
  const otherConversations = conversationsData.filter((c) => !c.isPinned);

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Started Section - Pinned conversations */}
      {starredConversations.length > 0 && (
        <div className="flex flex-col">
          <h5 className="font-bold text-base px-2 mb-2 text-violet-200">
            Started
          </h5>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 max-h-[200px] overflow-y-auto scrollbar-hide">
            {starredConversations.map((conv, index) => (
              <React.Fragment key={conv.id}>
                <MessageItem
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
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
              <React.Fragment key={conv.id}>
                <MessageItem
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
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
