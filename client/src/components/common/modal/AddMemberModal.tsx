import { useState, useEffect } from "react";
import { X, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import type { User } from "@/types/user";
import type { Conversation } from "@/types/message";

type AddMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  availableFriends: User[];
  onAddMembers: (memberIds: string[]) => void;
};

export const AddMemberModal = ({
  isOpen,
  onClose,
  conversation,
  availableFriends,
  onAddMembers,
}: AddMemberModalProps) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const existingMemberIds = conversation.participants.map((p) => p._id);
  const eligibleFriends = availableFriends.filter(
    (friend) => !existingMemberIds.includes(friend._id)
  );

  const filteredFriends = eligibleFriends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (friend.email &&
        friend.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserIds([]);
      setSearchQuery("");
    }
  }, [isOpen]);

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleAddMembers = () => {
    if (selectedUserIds.length > 0) {
      onAddMembers(selectedUserIds);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-linear-to-br from-purple-900/90 via-indigo-900/90 to-purple-900/90 rounded-2xl max-w-md w-full border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 rounded-lg">
              <UserPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Add Members</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto scrollbar-hide">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">
                {eligibleFriends.length === 0
                  ? "All your friends are already in this group"
                  : "No friends found"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => {
                const isSelected = selectedUserIds.includes(friend._id);
                return (
                  <div
                    key={friend._id}
                    onClick={() => toggleUser(friend._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-600/30 border-2 border-indigo-500"
                        : "bg-white/5 hover:bg-white/10 border-2 border-transparent"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={
                          friend.avatar ||
                          "https://avatar.iran.liara.run/public"
                        }
                        alt={friend.name}
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                      />
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {friend.name}
                      </p>
                      <p className="text-sm text-white/60 truncate">
                        {friend.email}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/60">
              {selectedUserIds.length} member
              {selectedUserIds.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              text="Cancel"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            />
            <Button
              text={`Add ${
                selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ""
              }`}
              onClick={handleAddMembers}
              variant="primary"
              disabled={selectedUserIds.length === 0}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
