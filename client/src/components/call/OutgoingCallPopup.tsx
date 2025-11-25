import { Phone, PhoneOff, Video } from "lucide-react";
import type { CallType } from "@/types/socket";

interface OutgoingCallPopupProps {
  callerName: string;
  callerAvatar: string;
  callType: CallType;
  isGroup: boolean;
  groupName?: string;
  onCancel: () => void;
}

export const OutgoingCallPopup = ({
  callerName,
  callerAvatar,
  callType,
  isGroup,
  groupName,
  onCancel,
}: OutgoingCallPopupProps) => {
  const isVideoCall = callType === "video";
  const displayName = isGroup ? groupName || "Group Call" : callerName;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <div className="relative z-10 bg-linear-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-8 shadow-2xl border border-white/10 max-w-sm w-full mx-4">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div
            className={`px-4 py-1 rounded-full text-xs font-semibold ${
              isVideoCall
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            }`}
          >
            {isVideoCall ? "Video Call" : "Voice Call"}
          </div>
        </div>

        {/* Caller avatar with ring animation */}
        <div className="flex flex-col items-center mt-4">
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
                isVideoCall ? "bg-purple-500" : "bg-cyan-500"
              }`}
            />
            <div
              className={`absolute -inset-2 rounded-full animate-pulse opacity-30 ${
                isVideoCall ? "bg-purple-500" : "bg-cyan-500"
              }`}
            />
            <img
              src={callerAvatar || "https://avatar.iran.liara.run/public"}
              alt={callerName}
              className="relative w-24 h-24 rounded-full border-4 border-white/20 object-cover"
            />
            <div className="absolute -bottom-2 -right-2">
              <div
                className={`p-2 rounded-full ${
                  isVideoCall ? "bg-purple-500" : "bg-cyan-500"
                }`}
              >
                {isVideoCall ? (
                  <Video size={16} className="text-white" />
                ) : (
                  <Phone size={16} className="text-white" />
                )}
              </div>
            </div>
          </div>

          <h3 className="mt-4 text-xl font-bold text-white">{displayName}</h3>
          <p className="text-gray-400 text-sm mt-1">Calling...</p>

          <div className="mt-4 flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full animate-bounce ${
                isVideoCall ? "bg-purple-500" : "bg-cyan-500"
              }`}
              style={{ animationDelay: "0ms" }}
            />
            <span
              className={`w-2 h-2 rounded-full animate-bounce ${
                isVideoCall ? "bg-purple-500" : "bg-cyan-500"
              }`}
              style={{ animationDelay: "150ms" }}
            />
            <span
              className={`w-2 h-2 rounded-full animate-bounce ${
                isVideoCall ? "bg-purple-500" : "bg-cyan-500"
              }`}
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={onCancel}
            className="group flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center transition-all duration-300 hover:bg-red-500 hover:scale-110">
              <PhoneOff
                size={28}
                className="text-red-500 group-hover:text-white transition-colors"
              />
            </div>
            <span className="mt-2 text-sm text-gray-400">Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
