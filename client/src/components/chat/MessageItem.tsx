import type { Conversation } from "@/types/message";
import { formatTime } from "@/utils/formatTime";
import { MoreVertical, Check, X, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type MessageItemProps = {
  conversation: Conversation;
  isActive: boolean;
  onClick: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
};

export const MessageItem = ({
  conversation,
  isActive,
  onClick,
  onMarkAsRead,
  onMarkAsUnread,
  onDeleteConversation,
}: MessageItemProps) => {
  const hasUnread = conversation.unreadCount > 0;
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Determine display name and avatar based on group or 1:1
  const displayName = conversation.isGroup
    ? conversation.groupName
    : conversation.participants[0]?.name;

  const displayAvatar = conversation.isGroup
    ? conversation.groupAvatar || "https://avatar.iran.liara.run/public"
    : conversation.participants[0]?.avatar ||
      "https://avatar.iran.liara.run/public";

  const isOnline = conversation.isGroup
    ? false // Groups don't have online status
    : conversation.participants[0]?.isOnline;

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.(conversation._id);
    setShowOptions(false);
  };

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsUnread?.(conversation._id);
    setShowOptions(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation?.(conversation._id);
    setShowOptions(false);
  };

  return (
    <div
      onClick={() => onClick(conversation._id)}
      className={`group flex justify-between items-center px-3 py-3 hover:bg-white/10 rounded-xl transition-colors cursor-pointer relative ${
        isActive ? "bg-[#00FFFF]/20 border border-[#00FFFF]/30" : ""
      }`}
    >
      <div className="flex gap-3 items-center flex-1 min-w-0">
        <div className="relative">
          <img
            src={displayAvatar}
            alt={displayName}
            className="rounded-full w-12 h-12 object-cover border-2 border-white/20"
          />
          {!conversation.isGroup && isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0a001f]"></div>
          )}
          {/* Unread count badge */}
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
            className={`text-sm ${
              hasUnread ? "font-bold text-white" : "font-semibold text-gray-200"
            }`}
          >
            {displayName}
          </h5>
          <p
            className={`text-xs truncate max-w-[150px] ${
              hasUnread ? "text-gray-200 font-semibold" : "text-gray-400"
            }`}
          >
            {conversation.lastMessage?.text || "No messages yet"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {conversation.lastMessage?.updatedAt && (
          <p
            className={`text-xs font-medium ${
              hasUnread ? "text-[#00FFFF]" : "text-gray-500"
            }`}
          >
            {formatTime(conversation.lastMessage?.updatedAt)}
          </p>
        )}

        {/* Options */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={handleOptionsClick}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a0a3e] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
              {hasUnread ? (
                <button
                  onClick={handleMarkAsRead}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  <Check size={16} className="text-green-400" />
                  <span className="text-sm text-white">Mark as read</span>
                </button>
              ) : (
                <button
                  onClick={handleMarkAsUnread}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  <X size={16} className="text-blue-400" />
                  <span className="text-sm text-white">Mark as unread</span>
                </button>
              )}
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-t border-white/10"
              >
                <Trash2 size={16} className="text-red-400" />
                <span className="text-sm text-red-400">
                  Delete conversation
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
