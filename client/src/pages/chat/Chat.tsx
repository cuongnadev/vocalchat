import { useState, useEffect } from "react";
import { ChatArea } from "@/components/chat/ChatArea";
import { Sidebar } from "@/components/chat/Sidebar";
import { FriendsView } from "@/components/view/friends/FriendsView";
import { SettingsView } from "@/components/view/setting/SettingsView";
import { CreateGroupModal } from "@/components/common/modal/CreateGroupModal";
import { CallProvider } from "@/components/call";
import { useAuth } from "@/hooks/useAuth";
import {
  sendFriendRequest,
  updateUserProfile,
  unfriend,
  getFriendsList,
  createGroupConversation,
  markConversationAsRead,
  markConversationAsUnread,
  deleteConversation,
  updateGroupInfo,
  getOrCreateConversation,
  removeGroupMember,
  addGroupMembers,
  dissolveGroup,
} from "@/app/api";
import type { User } from "@/types/user";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/toast/Toast";
import { socketService } from "@/services/socketService";

type ViewType = "chat" | "friends" | "settings";

const Chat = () => {
  const { user, refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [currentView, setCurrentView] = useState<ViewType>("chat");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    if (!user?._id) return;

    socketService.connect(user._id);

    return () => {
      socketService.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const handleConversationCreated = () => {
      showToast(
        "success",
        "New conversation created! You can now start chatting."
      );
      setRefreshTrigger((prev) => prev + 1);
    };

    socketService.onConversationCreated(handleConversationCreated);

    return () => {
      socketService.offConversationCreated(handleConversationCreated);
    };
  }, [user?._id, showToast]);

  // Listen for user status updates (including current user)
  useEffect(() => {
    if (!user?._id) return;

    const handleUserStatus = (payload: { userId: string; online: boolean }) => {
      // If the status update is for current user, refresh user data
      if (payload.userId === user._id) {
        refreshUser();
      }
    };

    socketService.onUserStatus(handleUserStatus);

    return () => {
      socketService.offUserStatus(handleUserStatus);
    };
  }, [user?._id, refreshUser]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getFriendsList();
        if (response.success) {
          setFriends(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      }
    };

    if (user?._id) {
      fetchFriends();
    }
  }, [user?._id]);

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

  const handleCreateGroup = async (
    groupName: string,
    selectedUserIds: string[]
  ) => {
    try {
      const response = await createGroupConversation({
        groupName,
        participantIds: selectedUserIds,
      });

      if (response.success) {
        showToast("success", "Group created successfully!");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to create group");
    }
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

  const handleMarkAsRead = async (conversationId: string) => {
    try {
      const response = await markConversationAsRead(conversationId);
      if (response.success) {
        showToast("success", "Marked as read");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to mark as read");
    }
  };

  const handleMarkAsUnread = async (conversationId: string) => {
    try {
      const response = await markConversationAsUnread(conversationId);
      if (response.success) {
        showToast("success", "Marked as unread");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to mark as unread");
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await deleteConversation(conversationId);
      if (response.success) {
        showToast("success", "Conversation deleted");
        setRefreshTrigger((prev) => prev + 1);
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
        }
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to delete conversation");
    }
  };

  const handleDissolveGroup = async (conversationId: string) => {
    try {
      const response = await dissolveGroup(conversationId);
      if (response.success) {
        showToast("success", "Group dissolved successfully!");
        setRefreshTrigger((prev) => prev + 1);
        setActiveConversationId(null);
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to dissolve group");
    }
  };

  const handleUpdateGroupInfo = async (
    conversationId: string,
    groupName: string,
    groupAvatar?: string
  ) => {
    try {
      const response = await updateGroupInfo(conversationId, {
        groupName,
        groupAvatar,
      });
      if (response.success) {
        showToast("success", "Group info updated");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to update group info");
    }
  };

  const handleStartConversation = async (friendId: string) => {
    try {
      const response = await getOrCreateConversation(friendId);
      if (response.success) {
        setActiveConversationId(response.data._id);
        setCurrentView("chat");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to start conversation");
    }
  };

  const handleRemoveMember = async (
    conversationId: string,
    memberId: string
  ) => {
    try {
      const response = await removeGroupMember(conversationId, memberId);
      if (response.success) {
        showToast("success", "Member removed successfully!");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to remove member");
    }
  };

  const handleAddMembers = async (
    conversationId: string,
    memberIds: string[]
  ) => {
    try {
      const response = await addGroupMembers(conversationId, memberIds);
      if (response.success) {
        showToast("success", "Members added successfully!");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to add members");
    }
  };

  const currentUser: User = {
    _id: user?._id,
    name: user.name,
    avatar: user.avatar || "https://avatar.iran.liara.run/public",
    email: user.email,
    isOnline: user.isOnline,
    isVerified: user.isVerified,
  };

  return (
    <CallProvider
      currentoderId={user._id}
      currentoderName={user.name}
      currentoderAvatar={user.avatar || "https://avatar.iran.liara.run/public"}
    >
      <div className="relative flex h-screen bg-linear-to-br from-[#0a001f] via-[#10002b] to-[#1b0038] overflow-hidden">
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
          refreshTrigger={refreshTrigger}
          onMarkAsRead={handleMarkAsRead}
          onMarkAsUnread={handleMarkAsUnread}
          onDeleteConversation={handleDeleteConversation}
          onStartConversation={handleStartConversation}
        />

        {currentView === "chat" && (
          <ChatArea
            className="flex-1 relative z-10"
            activeConversationId={activeConversationId}
            availableFriends={friends}
            onUpdateGroupInfo={handleUpdateGroupInfo}
            onRemoveMember={handleRemoveMember}
            onAddMembers={handleAddMembers}
            onDeleteConversation={handleDeleteConversation}
            onDissolveGroup={handleDissolveGroup}
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
        <CreateGroupModal
          isOpen={isCreateGroupModalOpen}
          onClose={() => setIsCreateGroupModalOpen(false)}
          availableUsers={friends}
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
    </CallProvider>
  );
};

export default Chat;
