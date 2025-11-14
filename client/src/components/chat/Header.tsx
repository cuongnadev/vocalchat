import type { Conversation } from "@/types/message";
import { MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "../ui/button/Button";


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
            className={`text-xs ${activeConversation?.participant.isOnline
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
        <Button
          icon={<Phone size={20} color="#00FFFF" />}
          variant="ghost"
          size="sm"
          radius="full"
          className="text-[#00FFFF] py-3"
        />
        <Button
          icon={<Video size={20} color="#8B5CF6" />}
          variant="ghost"
          size="sm"
          radius="full"
          className="text-[#8B5CF6] py-3"
        />
        <Button
          icon={<MoreVertical size={20} />}
          variant="ghost"
          size="sm"
          radius="full"
          className="text-gray-300 py-3"
        />
      </div>
    </div>
  );
};
