import { useState, useEffect } from "react";
import { ChatArea } from "@/components/chat/ChatArea";
import { Sidebar } from "@/components/chat/Sidebar";
import { FriendsView } from "@/components/view/friends/FriendsView";
import { SettingsView } from "@/components/view/setting/SettingsView";
import { CreateGroupModal } from "@/components/common/modal/CreateGroupModal";
import { useAuth } from "@/hooks/useAuth";
import { sendFriendRequest, updateUserProfile, unfriend } from "@/app/api";
import type { User } from "@/types/user";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/toast/Toast";
import { socketService } from "@/services/socketService";
import type { ConversationCreatedPayload } from "@/types/socket";

type ViewType = "chat" | "friends" | "settings";

const Chat = () => {
  const { user, loading, refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [currentView, setCurrentView] = useState<ViewType>("chat");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    const handleConversationCreated = (payload: ConversationCreatedPayload) => {
      console.log("New conversation created:", payload);
      showToast(
        "success",
        "New conversation created! You can now start chatting."
      );
      // TODO: Refresh conversation list from API instead of using mock data
      // Can call API to get new conversation list
    };

    socketService.onConversationCreated(handleConversationCreated);

    return () => {
      socketService.offConversationCreated(handleConversationCreated);
    };
  }, [user?._id, showToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0a001f] via-[#10002b] to-[#1b0038]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setCurrentView("chat");
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
    console.log("Creating group:", groupName, selectedUserIds);
    // TODO: Implement create group functionality with API
  };

  const handleAddFriend = async (userId: string) => {
    try {
      const response = await sendFriendRequest(userId);
      if (response.success) {
        showToast("success", "Friend request sent successfully!");
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to send friend request");
    }
  };

  const handleUnfriend = async (userId: string) => {
    try {
      const response = await unfriend(userId);
      if (response.success) {
        showToast("success", "Unfriended successfully!");
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to unfriend");
    }
  };

  const handleSaveSettings = async (
    updatedUser: Partial<User> & { oldPassword?: string; password?: string }
  ) => {
    try {
      const response = await updateUserProfile({
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        oldPassword: updatedUser.oldPassword,
        password: updatedUser.password,
      });

      if (response.success) {
        showToast("success", "Profile updated successfully!");
        await refreshUser();
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to update profile");
    }
  };

  const currentUser: User = {
    _id: user?._id,
    name: user.name,
    avatar: user.avatar || "https://avatar.iran.liara.run/public",
    email: user.email,
    isOnline: user.isOnline,
  };

  // // Get available users for group creation
  // const availableUsers = conversationsData.map((conv) => conv.participant);

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

      {currentView === "chat" && (
        <ChatArea
          className="flex-1 relative z-10"
          activeConversationId={activeConversationId}
        />
      )}

      {currentView === "friends" && (
        <FriendsView
          className="flex-1 relative z-10"
          onAddFriend={handleAddFriend}
          onUnfriend={handleUnfriend}
          showToast={showToast}
        />
      )}

      {currentView === "settings" && (
        <SettingsView
          className="flex-1 relative z-10"
          currentUser={currentUser}
          onSaveSettings={handleSaveSettings}
          showToast={showToast}
        />
      )}

      {/* Create Group Modal */}
      {/* <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        availableUsers={availableUsers}
        onCreateGroup={handleCreateGroup}
      /> */}

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

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Chat;
