import { InputSearch } from "./InputSearch";
import { MessageList } from "./MessageList";
import { Plus } from "lucide-react";

type SidebarProps = {
  className?: string;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
};

export const Sidebar = ({
  className,
  activeConversationId,
  onSelectConversation,
}: SidebarProps) => {
  const handleNewChat = () => {
    // TODO: Implement new chat functionality
    console.log("Create new chat");
  };

  return (
    <aside
      className={`${className} px-5 py-4 bg-white/5 backdrop-blur-xl border-r border-white/10 h-screen overflow-y-auto scrollbar-hide flex flex-col`}
    >
      {/* Header with New Chat button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <img src="/logo.ico" alt="logo" className="w-6 h-6" />
          VocalChat
        </h2>
        <button
          onClick={handleNewChat}
          className="p-2 bg-linear-to-r from-[#00FFFF] to-[#8B5CF6] hover:from-[#00FFFF]/80 hover:to-[#8B5CF6]/80 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          title="New Chat"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <InputSearch />
      <MessageList
        activeConversationId={activeConversationId}
        onSelectConversation={onSelectConversation}
      />
    </aside>
  );
};
