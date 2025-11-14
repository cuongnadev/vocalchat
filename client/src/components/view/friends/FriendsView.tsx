import { Search } from "lucide-react";
import { useState } from "react";
import type { User } from "@/types/user";
import { Input } from "@/components/ui/input/input";
import { FriendCard } from "@/components/common/card/FriendCard";

type FriendsViewProps = {
  className?: string;
  potentialFriends: User[];
  onAddFriend: (userId: string) => void;
};

export const FriendsView = ({
  className,
  potentialFriends,
  onAddFriend,
}: FriendsViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = potentialFriends.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email &&
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className={`${className} bg-white/5 backdrop-blur-xl flex flex-col h-screen`}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-xl px-6 py-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Discover Friends</h2>
            <p className="text-sm text-gray-400 mt-1">
              Connect with new people
            </p>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Search by name or email..."
          icon={<Search size={18} />}
          iconPosition="left"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="third"
          radius="lg"
        />
      </div>

      {/* Friends Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        {filteredFriends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFriends.map((user) => (
              <FriendCard key={user.id} user={user} onAddFriend={onAddFriend} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-300 text-lg mb-2">No friends found</p>
              <p className="text-gray-500 text-sm">
                Try searching with different keywords
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
