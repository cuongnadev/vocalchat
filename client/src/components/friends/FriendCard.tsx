import type { User } from "@/types/user";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button/Button";

type FriendCardProps = {
  user: User;
  onAddFriend: (userId: string) => void;
};

export const FriendCard = ({ user, onAddFriend }: FriendCardProps) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddFriend(user.id);
    setIsAdded(true);
  };

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
            text={isAdded ? "Friend Request Sent" : "Add Friend"}
            icon={<UserPlus size={16} />}
            iconPosition="left"
            variant={isAdded ? "ghost" : "primary"}
            size="sm"
            radius="lg"
            onClick={handleAdd}
            disabled={isAdded}
            className={
              isAdded ? "cursor-not-allowed" : "shadow-lg hover:shadow-xl"
            }
          />
        </div>
      </div>
    </div>
  );
};
