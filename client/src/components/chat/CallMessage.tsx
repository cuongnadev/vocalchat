import { Phone, PhoneIncoming, PhoneMissed, Video } from "lucide-react";
import type { CallMetadata, MessageSender } from "@/types/message";

interface CallMessageProps {
  callMetadata: CallMetadata;
  sender: MessageSender;
  createdAt: string;
}

export const CallMessage = ({
  callMetadata,
  sender,
  createdAt,
}: CallMessageProps) => {
  const isVideoCall = callMetadata.callType === "video";
  const isMissed = callMetadata.callStatus === "missed";
  const isRejected = callMetadata.callStatus === "rejected";
  const isBusy = callMetadata.callStatus === "busy";
  const isOutgoing = sender === "me";

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusText = (): string => {
    if (isMissed) {
      return isOutgoing ? "No answer" : "Missed call";
    }
    if (isRejected) {
      return isOutgoing ? "Call declined" : "Declined";
    }
    if (isBusy) {
      return "Busy";
    }
    const duration = formatDuration(callMetadata.duration);
    return duration ? `Call ended • ${duration}` : "Call ended";
  };

  const getIcon = () => {
    if (isMissed || isRejected) {
      return isVideoCall ? (
        <Video size={18} className="text-red-400" />
      ) : (
        <PhoneMissed size={18} className="text-red-400" />
      );
    }
    if (isOutgoing) {
      return isVideoCall ? (
        <Video size={18} className="text-purple-400" />
      ) : (
        <Phone size={18} className="text-cyan-400" />
      );
    }
    return isVideoCall ? (
      <Video size={18} className="text-purple-400" />
    ) : (
      <PhoneIncoming size={18} className="text-green-400" />
    );
  };

  const bgColor =
    isMissed || isRejected
      ? "bg-red-500/10 border-red-500/20"
      : isVideoCall
      ? "bg-purple-500/10 border-purple-500/20"
      : "bg-cyan-500/10 border-cyan-500/20";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColor} max-w-xs`}
    >
      <div
        className={`p-2 rounded-full ${
          isMissed || isRejected
            ? "bg-red-500/20"
            : isVideoCall
            ? "bg-purple-500/20"
            : "bg-cyan-500/20"
        }`}
      >
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">
          {isVideoCall ? "Video call" : "Voice call"}
        </p>
        <p
          className={`text-xs ${
            isMissed || isRejected ? "text-red-400" : "text-gray-400"
          }`}
        >
          {getStatusText()}
        </p>
      </div>
      <span className="text-xs text-gray-500">{formatTime(createdAt)}</span>
    </div>
  );
};
