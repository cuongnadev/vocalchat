import { Phone, PhoneOff, Video } from "lucide-react";
import type { IncomingCallPayload } from "@/types/socket";

interface IncomingCallPopupProps {
  callData: IncomingCallPayload;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallPopup = ({
  callData,
  onAccept,
  onReject,
}: IncomingCallPopupProps) => {
  const { caller, call, conversationName } = callData;
  const isVideoCall = call.type === "video";

  const displayName = call.isGroup
    ? conversationName || "Group Call"
    : caller.name;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Popup */}
      <div className="relative z-10 bg-linear-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-8 shadow-2xl border border-white/10 max-w-sm w-full mx-4 animate-pulse-slow">
        {/* Call type indicator */}
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

        {/* Caller avatar */}
        <div className="flex flex-col items-center mt-4">
          <div className="relative">
            <img
              src={caller.avatar || "https://avatar.iran.liara.run/public"}
              alt={caller.name}
              className="w-24 h-24 rounded-full border-4 border-white/20 object-cover"
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

          {/* Caller name */}
          <h3 className="mt-4 text-xl font-bold text-white">{displayName}</h3>
          <p className="text-gray-400 text-sm mt-1">
            Incoming {isVideoCall ? "video" : "voice"} call...
          </p>

          {/* Pulsing ring animation */}
          <div className="mt-4 flex items-center gap-1">
            <span
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-8 mt-8">
          {/* Reject button */}
          <button
            onClick={onReject}
            className="group flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center transition-all duration-300 hover:bg-red-500 hover:scale-110">
              <PhoneOff
                size={28}
                className="text-red-500 group-hover:text-white transition-colors"
              />
            </div>
            <span className="mt-2 text-sm text-gray-400">Decline</span>
          </button>

          {/* Accept button */}
          <button
            onClick={onAccept}
            className="group flex flex-col items-center"
          >
            <div
              className={`w-16 h-16 rounded-full ${
                isVideoCall
                  ? "bg-purple-500/20 border-purple-500 hover:bg-purple-500"
                  : "bg-green-500/20 border-green-500 hover:bg-green-500"
              } border-2 flex items-center justify-center transition-all duration-300 hover:scale-110`}
            >
              {isVideoCall ? (
                <Video
                  size={28}
                  className="text-purple-500 group-hover:text-white transition-colors"
                />
              ) : (
                <Phone
                  size={28}
                  className="text-green-500 group-hover:text-white transition-colors"
                />
              )}
            </div>
            <span className="mt-2 text-sm text-gray-400">Accept</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(139, 92, 246, 0);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
      `}</style>
    </div>
  );
};
