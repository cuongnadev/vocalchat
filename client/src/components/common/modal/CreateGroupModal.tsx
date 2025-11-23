import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/input";
import type { User } from "@/types/user";
import { X, Search, Check } from "lucide-react";
import { useState } from "react";

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
  onCreateGroup: (groupName: string, selectedUserIds: string[]) => void;
};

export const CreateGroupModal = ({
  isOpen,
  onClose,
  availableUsers,
  onCreateGroup,
}: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedUserIds.length > 0) {
      onCreateGroup(groupName, selectedUserIds);
      setGroupName("");
      setSelectedUserIds([]);
      setSearchQuery("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0a001f] border border-white/20 rounded-3xl shadow-2xl w-[500px] max-h-[700px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Create New Group</h2>
          <Button
            icon={<X size={20} />}
            variant="ghost"
            size="sm"
            radius="full"
            onClick={onClose}
            className="text-gray-300 py-3"
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Group Name Input */}
          <div>
            <Input
              label="Group Name"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              variant="third"
              radius="lg"
            />
          </div>

          {/* Search Friends */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                Add Members (min 2 members)
              </label>
              <span className="text-xs text-gray-400">
                {selectedUserIds.length} selected
              </span>
            </div>
            <Input
              placeholder="Search friends..."
              icon={<Search size={18} />}
              iconPosition="left"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="third"
              radius="lg"
            />
          </div>

          {/* User List */}
          <div className="bg-white/5 rounded-xl border border-white/10 max-h-[200px] overflow-y-auto scrollbar-hide">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => toggleUserSelection(user._id)}
                    className={`flex items-center justify-between p-3 hover:bg-white/10 cursor-pointer transition-colors ${
                      isSelected ? "bg-white/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="rounded-full w-10 h-10 object-cover border-2 border-white/20"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-linear-to-r from-[#00FFFF] to-[#8B5CF6] border-transparent"
                          : "border-white/30"
                      }`}
                    >
                      {isSelected && <Check size={16} className="text-white" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-400">
                No friends found
              </div>
            )}
          </div>

          {selectedUserIds.length > 0 && selectedUserIds.length < 2 && (
            <p className="text-xs text-yellow-400">
              Please select at least 2 members to create a group (total 3
              including you)
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <Button
            text="Cancel"
            variant="ghost"
            size="md"
            radius="lg"
            onClick={onClose}
          />
          <Button
            text="Create Group"
            variant="primary"
            size="md"
            radius="lg"
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedUserIds.length < 2}
          />
        </div>
      </div>
    </div>
  );
};
