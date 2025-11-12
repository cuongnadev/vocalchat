import type { Conversation } from "@/types/message";
import { MoreVertical, Phone, Video } from "lucide-react";

type HeaderProps = {
  activeConversation: Conversation | undefined;
};

export const Header = ({ activeConversation }: HeaderProps) => {
  return (
    <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={activeConversation?.participant.avatar}
          alt={activeConversation?.participant.name}
          className="rounded-full w-10 h-10 object-cover border-2 border-white/20"
        />
        <div>
          <h3 className="font-semibold text-white">
            {activeConversation?.participant.name}
          </h3>
          <p
            className={`text-xs ${
              activeConversation?.participant.isOnline
                ? "text-[#00FFFF]"
                : "text-gray-400"
            }`}
          >
            {activeConversation?.participant.isOnline
              ? "Active now"
              : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Phone size={20} className="text-[#00FFFF]" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Video size={20} className="text-[#8B5CF6]" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical size={20} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
};
