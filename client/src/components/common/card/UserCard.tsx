import { Settings, Users } from "lucide-react";
import { Button } from "../../ui/button/Button";

type UserCardProps = {
  user: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  onSettingsClick: () => void;
  onFriendsClick: () => void;
};

export const UserCard = ({
  user,
  onSettingsClick,
  onFriendsClick,
}: UserCardProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="rounded-full w-12 h-12 object-cover border-2 border-white/20"
            />
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00FFFF] rounded-full border-2 border-[#0a001f]"></div>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h5 className="text-sm font-bold text-white truncate">
              {user.name}
            </h5>
            <p className="text-xs text-[#00FFFF]">
              {user.isOnline ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={
              <Users
                size={18}
                className="text-[#8B5CF6] group-hover:text-[#8B5CF6]/80"
              />
            }
            variant="ghost"
            size="sm"
            radius="full"
            onClick={onFriendsClick}
            className="group py-3"
          />
          <Button
            icon={
              <Settings
                size={18}
                className="text-[#00FFFF] group-hover:text-[#00FFFF]/80"
              />
            }
            variant="ghost"
            size="sm"
            radius="full"
            onClick={onSettingsClick}
            className="group py-3"
          />
        </div>
      </div>
    </div>
  );
};
