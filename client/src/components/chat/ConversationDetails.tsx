import { useState } from "react";
import { X, Users, Edit2, Camera, UserPlus, Trash2 } from "lucide-react";
import type { Conversation } from "@/types/message";
import type { User } from "@/types/user";
import { Button } from "../ui/button/Button";
import { AddMemberModal } from "../common/modal/AddMemberModal";

type ConversationDetailsProps = {
  conversation: Conversation;
  currentUser: User;
  onClose: () => void;
  onUpdateGroupInfo?: (groupName: string, groupAvatar?: string) => void;
  onAddMembers?: (memberIds: string[]) => void;
  onRemoveMember?: (memberId: string) => void;
  onDeleteConversation?: () => void;
  onDissolveGroup?: () => void;
  availableFriends?: User[];
};

export const ConversationDetails = ({
  conversation,
  currentUser,
  onClose,
  onUpdateGroupInfo,
  onAddMembers,
  onRemoveMember,
  onDeleteConversation,
  onDissolveGroup,
  availableFriends = [],
}: ConversationDetailsProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(conversation.groupName || "");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(conversation.groupAvatar || "");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const isGroup = conversation.isGroup;
  const isAdmin = conversation.admin === currentUser._id;
  const otherParticipant = isGroup
    ? null
    : conversation.participants.find((p) => p._id !== currentUser._id);

  const handleSaveGroupName = () => {
    if (groupName.trim() && onUpdateGroupInfo) {
      onUpdateGroupInfo(groupName.trim(), conversation.groupAvatar);
      setIsEditingName(false);
    }
  };

  const handleSaveAvatar = () => {
    if (avatarUrl.trim() && onUpdateGroupInfo) {
      onUpdateGroupInfo(conversation.groupName || "", avatarUrl.trim());
      setIsEditingAvatar(false);
    }
  };

  const handleDeleteConversation = () => {
    if (
      window.confirm(
        isGroup
          ? "Are you sure you want to delete this group? All messages will be permanently deleted."
          : "Are you sure you want to delete this conversation? All messages will be permanently deleted."
      )
    ) {
      onDeleteConversation?.();
    }
  };

  return (
    <div className="w-80 bg-linear-to-br from-purple-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-xl border-l border-white/10 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">
          {isGroup ? "Group Info" : "Chat Info"}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <img
              src={
                isGroup
                  ? conversation.groupAvatar ||
                    "https://avatar.iran.liara.run/public"
                  : otherParticipant?.avatar ||
                    "https://avatar.iran.liara.run/public"
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-white/20"
            />
            {isGroup && isAdmin && (
              <button
                onClick={() => setIsEditingAvatar(true)}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Group Name */}
          {isGroup ? (
            <div className="w-full">
              {isEditingName ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                    placeholder="Group name"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      text="Save"
                      onClick={handleSaveGroupName}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    />
                    <Button
                      text="Cancel"
                      onClick={() => {
                        setGroupName(conversation.groupName || "");
                        setIsEditingName(false);
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-xl font-semibold text-white">
                    {conversation.groupName}
                  </h4>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-white/60 text-center mt-1">
                {conversation.participants.length + 1} members
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-xl font-semibold text-white text-center">
                {otherParticipant?.name}
              </h4>
              <p className="text-sm text-white/60 text-center mt-1">
                {otherParticipant?.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          )}
        </div>

        {isEditingAvatar && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-linear-to-br from-purple-900/90 via-indigo-900/90 to-purple-900/90 rounded-2xl p-6 max-w-md w-full border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Change Group Avatar
              </h3>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500 mb-4"
                placeholder="Enter image URL"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  text="Save"
                  onClick={handleSaveAvatar}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                />
                <Button
                  text="Cancel"
                  onClick={() => {
                    setAvatarUrl(conversation.groupAvatar || "");
                    setIsEditingAvatar(false);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20"
                />
              </div>
            </div>
          </div>
        )}

        {isGroup && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/60" />
                <h5 className="font-semibold text-white">Members</h5>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-white/60" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {conversation.participants.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={
                        participant.avatar ||
                        "https://avatar.iran.liara.run/public"
                      }
                      alt={participant.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {participant.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {participant.name}
                      {participant._id === currentUser._id && " (You)"}
                      {participant._id === conversation.admin && " (Admin)"}
                    </p>
                    <p className="text-xs text-white/60">{participant.email}</p>
                  </div>
                  {isAdmin &&
                    participant._id !== conversation.admin &&
                    participant._id !== currentUser._id && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove ${participant.name} from group?`
                            )
                          ) {
                            onRemoveMember?.(participant._id);
                          }
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {isGroup && isAdmin && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to dissolve this group? This will permanently delete the group for ALL members and cannot be undone."
                  )
                ) {
                  onDissolveGroup?.();
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/30 hover:bg-red-500/40 transition-colors border border-red-500/50"
            >
              <Trash2 className="w-5 h-5 text-red-300" />
              <span className="font-medium text-red-300">
                Dissolve Group (Admin)
              </span>
            </button>
          )}
          <button
            onClick={handleDeleteConversation}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-400">
              Delete {isGroup ? "Group" : "Conversation"}
            </span>
          </button>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        conversation={conversation}
        availableFriends={availableFriends}
        onAddMembers={(memberIds) => {
          onAddMembers?.(memberIds);
          setIsAddMemberModalOpen(false);
        }}
      />
    </div>
  );
};
