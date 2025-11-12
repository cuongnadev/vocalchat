import { useState } from "react";
import { ChatArea } from "@/components/chat/ChatArea";
import { Sidebar } from "@/components/chat/Sidebar";

const Chat = () => {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    // TODO: When integrating backend, mark messages as read
  };

  return (
    <div className="relative flex h-screen bg-linear-to-br from-[#0a001f] via-[#10002b] to-[#1b0038] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <Sidebar
        className="w-90 relative z-10"
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
      />
      <ChatArea
        className="flex-1 relative z-10"
        activeConversationId={activeConversationId}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
};

export default Chat;
