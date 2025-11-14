import { useState } from "react";
import { ChatArea } from "@/components/chat/ChatArea";
import { Sidebar } from "@/components/chat/Sidebar";
import { FriendsView } from "@/components/view/friends/FriendsView";
import {
  currentUser,
  potentialFriends,
  conversationsData,
} from "@/constants/mock-data";
import type { User } from "@/types/user";
import { SettingsView } from "@/components/view/setting/SettingsView";
import { CreateGroupModal } from "@/components/common/modal/CreateGroupModal";

type ViewType = "chat" | "friends" | "settings";

const Chat = () => {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [currentView, setCurrentView] = useState<ViewType>("chat");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setCurrentView("chat");
    // TODO: When integrating backend, mark messages as read
  };

  const handleSettingsClick = () => {
    setCurrentView("settings");
  };

  const handleFriendsClick = () => {
    setCurrentView("friends");
  };

  const handleNewChatClick = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleCreateGroup = (groupName: string, selectedUserIds: string[]) => {
    // TODO: Implement create group functionality
    console.log("Creating group:", groupName, selectedUserIds);
  };

  const handleAddFriend = (userId: string) => {
    // TODO: Implement add friend functionality
    console.log("Adding friend:", userId);
  };

  const handleSaveSettings = (updatedUser: Partial<User>) => {
    // TODO: Implement save settings functionality
    console.log("Saving settings:", updatedUser);
  };

  // Get available users for group creation (all users from conversations)
  const availableUsers = conversationsData.map((conv) => conv.participant);

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
        currentUser={currentUser}
        onSettingsClick={handleSettingsClick}
        onFriendsClick={handleFriendsClick}
        onNewChatClick={handleNewChatClick}
      />

      {/* Conditional Rendering based on current view */}
      {currentView === "chat" && (
        <ChatArea
          className="flex-1 relative z-10"
          activeConversationId={activeConversationId}
        />
      )}

      {currentView === "friends" && (
        <FriendsView
          className="flex-1 relative z-10"
          potentialFriends={potentialFriends}
          onAddFriend={handleAddFriend}
        />
      )}

      {currentView === "settings" && (
        <SettingsView
          className="flex-1 relative z-10"
          currentUser={currentUser}
          onSaveSettings={handleSaveSettings}
        />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        availableUsers={availableUsers}
        onCreateGroup={handleCreateGroup}
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
