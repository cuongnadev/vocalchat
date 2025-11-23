import { Button } from "@/components/ui/button/Button";
import type { User } from "@/types/user";
import { UserPlus, UserMinus } from "lucide-react";
import { useCallback, useState } from "react";

type FriendCardProps = {
  user: User & {
    relationshipStatus?: "none" | "friends" | "pending";
    isSender?: boolean;
  };
  onAddFriend: (userId: string) => void;
  onUnfriend?: (userId: string) => void;
};

export const FriendCard = ({
  user,
  onAddFriend,
  onUnfriend,
}: FriendCardProps) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = useCallback(() => {
    onAddFriend(user._id);
    setIsAdded(true);
  }, [onAddFriend, user._id]);

  const handleUnfriend = useCallback(() => {
    if (onUnfriend) {
      onUnfriend(user._id);
    }
  }, [onUnfriend, user._id]);

  const getButtonProps = useCallback(() => {
    return user.relationshipStatus === "friends"
      ? {
          text: "Unfriend",
          icon: <UserMinus size={16} />,
          variant: "secondary" as const,
          disabled: false,
          onClick: handleUnfriend,
        }
      : user.relationshipStatus === "pending"
      ? {
          text: user.isSender ? "Request Sent" : "Pending Request",
          icon: <UserPlus size={16} />,
          variant: "ghost" as const,
          disabled: true,
          onClick: handleAdd,
        }
      : isAdded
      ? {
          text: "Request Sent",
          icon: <UserPlus size={16} />,
          variant: "ghost" as const,
          disabled: true,
          onClick: handleAdd,
        }
      : {
          text: "Add Friend",
          icon: <UserPlus size={16} />,
          variant: "primary" as const,
          disabled: false,
          onClick: handleAdd,
        };
  }, [
    user.relationshipStatus,
    user.isSender,
    isAdded,
    handleAdd,
    handleUnfriend,
  ]);

  const buttonProps = getButtonProps();

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="rounded-full w-16 h-16 object-cover border-2 border-white/20"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
          <p className="text-sm text-gray-400 truncate mb-3">{user.email}</p>

          <Button
            text={buttonProps.text}
            icon={buttonProps.icon}
            iconPosition="left"
            variant={buttonProps.variant}
            size="sm"
            radius="lg"
            onClick={buttonProps.onClick}
            disabled={buttonProps.disabled}
            className={
              buttonProps.disabled
                ? "cursor-not-allowed"
                : "shadow-lg hover:shadow-xl"
            }
          />
        </div>
      </div>
    </div>
  );
};
