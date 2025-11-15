import type { Message } from "@/types/message";
import { formatTime } from "@/utils/formatTime";

type ChatMessageProps = {
  message: Message;
  avatar?: string;
};

export const ChatMessage = ({ message, avatar }: ChatMessageProps) => {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`flex gap-2 max-w-[70%] ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isMe && avatar && (
          <img
            src={avatar}
            alt="Avatar"
            className="rounded-full w-8 h-8 object-cover border-2 border-white/20"
          />
        )}
        <div className="flex flex-col">
          <div
            className={`px-4 py-2 rounded-2xl ${
              isMe
                ? "bg-linear-to-r from-[#00FFFF] to-[#8B5CF6] text-white rounded-br-sm shadow-lg"
                : "bg-white/10 backdrop-blur-md text-white rounded-bl-sm border border-white/20"
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
          <span
            className={`text-xs text-gray-400 mt-1 ${
              isMe ? "text-right" : "text-left"
            }`}
          >
            { formatTime(message.updatedAt) }
          </span>
        </div>
      </div>
    </div>
  );
};
