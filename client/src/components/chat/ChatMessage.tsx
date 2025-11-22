import type { Message } from "@/types/message";
import { formatTime } from "@/utils/formatTime";
import { Download, FileText, Music, Video } from "lucide-react";

type ChatMessageProps = {
  message: Message;
  avatar?: string;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const ChatMessage = ({ message, avatar }: ChatMessageProps) => {
  const isMe = message.sender === "me";

  const renderMessageContent = () => {
    if (message.type === "text") {
      return <p className="text-sm">{message.text}</p>;
    }

    if (message.type === "image" && message.fileMetadata) {
      return (
        <div className="flex flex-col gap-2">
          <div className="relative group">
            <img
              src={message.fileMetadata.fileUrl}
              alt={message.fileMetadata.fileName}
              className="max-w-xs rounded-lg"
            />
            {/* Download overlay button */}
            <a
              href={message.fileMetadata.fileUrl}
              download={message.fileMetadata.fileName}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-8 h-8 text-white" />
            </a>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs opacity-70 truncate flex-1">
              {message.fileMetadata.fileName}
            </p>
            <a
              href={message.fileMetadata.fileUrl}
              download={message.fileMetadata.fileName}
              className="text-xs opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-3 h-3" />
            </a>
          </div>
        </div>
      );
    }

    if (
      (message.type === "file" ||
        message.type === "audio" ||
        message.type === "video") &&
      message.fileMetadata
    ) {
      // Choose icon based on type
      const FileIcon =
        message.type === "audio"
          ? Music
          : message.type === "video"
          ? Video
          : FileText;

      return (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.fileMetadata.fileName}
              </p>
              <p className="text-xs opacity-70">
                {formatFileSize(message.fileMetadata.fileSize)}
              </p>
            </div>
          </div>
          {/* Download button */}
          <a
            href={message.fileMetadata.fileUrl}
            download={message.fileMetadata.fileName}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Download</span>
          </a>
        </div>
      );
    }

    return <p className="text-sm">{message.text}</p>;
  };

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
            {renderMessageContent()}
          </div>
          <span
            className={`text-xs text-gray-400 mt-1 ${
              isMe ? "text-right" : "text-left"
            }`}
          >
            {formatTime(message.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
