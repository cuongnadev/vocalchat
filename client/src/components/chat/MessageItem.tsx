import type { Conversation } from "@/types/message";
import { formatTime } from "@/utils/formatTime";

type MessageItemProps = {
  conversation: Conversation;
  isActive: boolean;
  onClick: (id: string) => void;
};

export const MessageItem = ({
  conversation,
  isActive,
  onClick,
}: MessageItemProps) => {
  const hasUnread = conversation.unreadCount > 0;
  
  return (
    <div
      onClick={() => onClick(conversation._id)}
      className={`flex justify-between items-center px-3 py-3 hover:bg-white/10 rounded-xl transition-colors cursor-pointer ${isActive ? "bg-[#00FFFF]/20 border border-[#00FFFF]/30" : ""
        }`}
    >
      <div className="flex gap-3 items-center flex-1 min-w-0">
        <div className="relative">
          <img
            src={conversation.participants[0].avatar}
            alt={conversation.participants[0].name}
            className="rounded-full w-12 h-12 object-cover border-2 border-white/20"
          />
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-r from-[#00FFFF] to-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">
                {conversation.unreadCount}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h5
            className={`text-sm ${hasUnread ? "font-bold text-white" : "font-semibold text-gray-200"
              }`}
          >
            {conversation.participants[0].name}
          </h5>
          <p
            className={`text-xs truncate max-w-[150px] ${hasUnread ? "text-gray-200 font-semibold" : "text-gray-400"
              }`}
          >
            {conversation.lastMessage?.text || "No messages yet"}
          </p>
        </div>
      </div>
      <p
        className={`text-xs font-medium ${hasUnread ? "text-[#00FFFF]" : "text-gray-500"
          }`}
      >
        {formatTime(conversation.lastMessage?.updatedAt || "")}
      </p>
    </div>
  );
};
