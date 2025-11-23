import { Search, UserCheck, UserPlus, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import type { User } from "@/types/user";
import type { FriendRequest, UserResponse } from "@/types/api";
import { Input } from "@/components/ui/input/input";
import { FriendCard } from "@/components/common/card/FriendCard";
import { Button } from "@/components/ui/button/Button";
import {
  searchUsers,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/app/api";

type FriendsViewProps = {
  className?: string;
  onAddFriend: (userId: string) => void;
  onUnfriend: (userId: string) => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
};

type TabType = "find" | "requests";

export const FriendsView = ({
  className,
  onAddFriend,
  onUnfriend,
  showToast,
}: FriendsViewProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("find");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchPendingRequests();
    }
  }, [activeTab]);

  const fetchPendingRequests = async () => {
    try {
      const response = await getPendingRequests();
      if (response.success) {
        setPendingRequests(response.data as FriendRequest[]);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const isEmail = searchQuery.includes("@");
      const response = await searchUsers(
        isEmail ? searchQuery : undefined,
        isEmail ? undefined : searchQuery
      );
      if (response.success) {
        setSearchResults(response.data);
        if (response.data.length === 0) {
          showToast("info", "No users found");
        }
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to search users");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriendWithRefresh = async (userId: string) => {
    await onUnfriend(userId);
    if (searchQuery.trim()) {
      await handleSearch();
    }
  };
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await acceptFriendRequest(requestId);
      if (response.success) {
        showToast("success", "Friend request accepted!");
        await fetchPendingRequests();
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await rejectFriendRequest(requestId);
      if (response.success) {
        showToast("info", "Friend request rejected");
        await fetchPendingRequests();
      }
    } catch (error) {
      const err = error as Error;
      showToast("error", err.message || "Failed to reject request");
    }
  };

  const convertApiUserToUser = (
    apiUser: UserResponse
  ): User & {
    relationshipStatus?: "none" | "friends" | "pending";
    isSender?: boolean;
  } => ({
    _id: apiUser._id,
    name: apiUser.name,
    avatar: apiUser.avatar || "https://avatar.iran.liara.run/public",
    email: apiUser.email,
    isOnline: apiUser.isOnline,
    relationshipStatus: apiUser.relationshipStatus,
    isSender: apiUser.isSender,
  });

  return (
    <div
      className={`${className} bg-white/5 backdrop-blur-xl flex flex-col h-screen`}
    >
      <div className="shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Friends</h2>
            <p className="text-sm text-gray-400 mt-1">
              Manage your connections
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            text="Find Friends"
            icon={<UserPlus size={16} />}
            iconPosition="left"
            variant={activeTab === "find" ? "primary" : "ghost"}
            onClick={() => setActiveTab("find")}
            className="flex-1"
          />
          <Button
            text={`Requests (${pendingRequests.length})`}
            icon={<UserCheck size={16} />}
            iconPosition="left"
            variant={activeTab === "requests" ? "primary" : "ghost"}
            onClick={() => setActiveTab("requests")}
            className="flex-1"
          />
        </div>

        {activeTab === "find" && (
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email..."
              icon={<Search size={18} />}
              iconPosition="left"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              variant="third"
              radius="lg"
              className="flex-1"
            />
            <Button
              text="Search"
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="shrink-0"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        {activeTab === "find" ? (
          // Find Friends Tab
          loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-300 text-lg">Searching...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((apiUser) => (
                <FriendCard
                  key={apiUser._id}
                  user={convertApiUserToUser(apiUser)}
                  onAddFriend={onAddFriend}
                  onUnfriend={handleUnfriendWithRefresh}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-300 text-lg mb-2">No users found</p>
                <p className="text-gray-500 text-sm">
                  Try searching with different keywords
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Search size={48} className="mx-auto mb-4 text-gray-500" />
                <p className="text-gray-300 text-lg mb-2">Search for friends</p>
                <p className="text-gray-500 text-sm">
                  Enter a name or email to find people
                </p>
              </div>
            </div>
          )
        ) : // Friend Requests Tab
        pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      request.requester.avatar ||
                      "https://avatar.iran.liara.run/public"
                    }
                    alt={request.requester.name}
                    className="rounded-full w-14 h-14 object-cover border-2 border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {request.requester.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {request.requester.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      text="Accept"
                      icon={<Check size={16} />}
                      iconPosition="left"
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptRequest(request._id)}
                    />
                    <Button
                      text="Reject"
                      icon={<X size={16} />}
                      iconPosition="left"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRejectRequest(request._id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <UserCheck size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-300 text-lg mb-2">No pending requests</p>
              <p className="text-gray-500 text-sm">
                You don't have any friend requests at the moment
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
