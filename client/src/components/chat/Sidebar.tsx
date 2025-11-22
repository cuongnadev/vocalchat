import { InputSearch } from "./InputSearch";
import { MessageList } from "./MessageList";
import { UserCard } from "../common/card/UserCard";
import { Plus } from "lucide-react";
import { Button } from "../ui/button/Button";
import { useState } from "react";

type SidebarProps = {
  className?: string;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUser: {
    _id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  onSettingsClick: () => void;
  onFriendsClick: () => void;
  onNewChatClick: () => void;
  refreshTrigger?: number;
  onMarkAsRead?: (conversationId: string) => void;
  onMarkAsUnread?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onStartConversation?: (friendId: string) => void;
};

export const Sidebar = ({
  className,
  activeConversationId,
  onSelectConversation,
  currentUser,
  onSettingsClick,
  onFriendsClick,
  onNewChatClick,
  refreshTrigger,
  onMarkAsRead,
  onMarkAsUnread,
  onDeleteConversation,
  onStartConversation,
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const isElectron = window.env?.isElectron ?? false;

  const logoPath = isElectron ? "../web/logo.ico" : "/logo.ico";

  return (
    <aside
      className={`${className} bg-white/5 backdrop-blur-xl border-r border-white/10 h-screen flex flex-col`}
    >
      <div className="shrink-0 px-5 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <img src={logoPath} alt="logo" className="w-8 h-8" />
            VocalChat
          </h2>
          <Button
            icon={<Plus size={20} />}
            variant="primary"
            size="sm"
            radius="full"
            onClick={onNewChatClick}
            className="shadow-lg hover:shadow-xl hover:scale-105 py-3"
          />
        </div>
        <InputSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5">
        <MessageList
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
          refreshTrigger={refreshTrigger}
          searchQuery={searchQuery}
          onMarkAsRead={onMarkAsRead}
          onMarkAsUnread={onMarkAsUnread}
          onDeleteConversation={onDeleteConversation}
          onStartConversation={onStartConversation}
        />
      </div>

      <div className="mt-4 shrink-0 px-5 py-2 border-t border-white/10">
        <UserCard
          user={currentUser}
          onSettingsClick={onSettingsClick}
          onFriendsClick={onFriendsClick}
        />
      </div>
    </aside>
  );
};
