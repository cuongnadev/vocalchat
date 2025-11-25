import type { Conversation } from "@/types/message";
import { MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "../ui/button/Button";
import { useCallContext } from "@/components/call";
import type { CallType } from "@/types/socket";

type HeaderProps = {
  activeConversation: Conversation | undefined;
  onToggleDetails?: () => void;
};

export const Header = ({
  activeConversation,
  onToggleDetails,
}: HeaderProps) => {
  const { initiateCall, callState } = useCallContext();

  if (!activeConversation) return null;

  const displayName = activeConversation.isGroup
    ? activeConversation.groupName
    : activeConversation.participants[0]?.name;

  const displayAvatar = activeConversation.isGroup
    ? activeConversation.groupAvatar || "https://avatar.iran.liara.run/public"
    : activeConversation.participants[0]?.avatar ||
      "https://avatar.iran.liara.run/public";

  const displayStatus = activeConversation.isGroup
    ? `${activeConversation.participants.length + 1} members`
    : activeConversation.participants[0]?.isOnline
    ? "Active now"
    : "Offline";

  const statusColor = activeConversation.isGroup
    ? "text-gray-400"
    : activeConversation.participants[0]?.isOnline
    ? "text-[#00FFFF]"
    : "text-gray-400";

  const handleCall = (callType: CallType) => {
    if (callState !== "idle") {
      return;
    }

    const participants = activeConversation.participants.map((p) => ({
      oderId: p._id,
      name: p.name,
      avatar: p.avatar || "https://avatar.iran.liara.run/public",
    }));

    initiateCall(
      activeConversation._id,
      callType,
      participants,
      activeConversation.isGroup,
      activeConversation.isGroup ? activeConversation.groupName : undefined
    );
  };

  const isCallDisabled = callState !== "idle";

  return (
    <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={displayAvatar}
          alt={displayName}
          className="rounded-full w-10 h-10 object-cover border-2 border-white/20"
        />
        <div>
          <h3 className="font-semibold text-white">{displayName}</h3>
          <p className={`text-xs ${statusColor}`}>{displayStatus}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          icon={
            <Phone size={20} color={isCallDisabled ? "#6b7280" : "#00FFFF"} />
          }
          variant="ghost"
          size="sm"
          radius="full"
          className={`py-3 ${
            isCallDisabled ? "opacity-50 cursor-not-allowed" : "text-[#00FFFF]"
          }`}
          onClick={() => handleCall("audio")}
          disabled={isCallDisabled}
        />
        <Button
          icon={
            <Video size={20} color={isCallDisabled ? "#6b7280" : "#8B5CF6"} />
          }
          variant="ghost"
          size="sm"
          radius="full"
          className={`py-3 ${
            isCallDisabled ? "opacity-50 cursor-not-allowed" : "text-[#8B5CF6]"
          }`}
          onClick={() => handleCall("video")}
          disabled={isCallDisabled}
        />
        <Button
          icon={<MoreVertical size={20} />}
          variant="ghost"
          size="sm"
          radius="full"
          className="text-gray-300 py-3"
          onClick={onToggleDetails}
        />
      </div>
    </div>
  );
};
