import React, { useEffect, useState } from "react";
import { MessageItem } from "./MessageItem";
import { getConversations, getFriendsList } from "@/app/api";
import type { Conversation } from "@/types/message";
import type { User } from "@/types/user";
import { socketService } from "@/services/socketService";
import type {
  ConversationUpdatedPayload,
  UserStatusPayload,
  ConversationDeletedPayload,
} from "@/types/socket";

type MessageListProps = {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  refreshTrigger?: number;
  searchQuery?: string;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onStartConversation?: (friendId: string) => void;
};

export const MessageList = ({
  activeConversationId,
  onSelectConversation,
  refreshTrigger,
  searchQuery = "",
  onMarkAsRead,
  onMarkAsUnread,
  onDeleteConversation,
  onStartConversation,
}: MessageListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>();
  const [friends, setFriends] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (searchQuery.trim()) {
          setIsSearching(true);

          const [friendsResponse, conversationsResponse] = await Promise.all([
            getFriendsList(),
            getConversations(),
          ]);

          if (!friendsResponse.success || !conversationsResponse.success) {
            throw new Error("Failed to search");
          }

          const filteredFriends = friendsResponse.data.filter(
            (friend: User) =>
              friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (friend.email &&
                friend.email.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          const filteredConversations = conversationsResponse.data.filter(
            (conv: Conversation) =>
              conv.isGroup &&
              conv.groupName &&
              conv.groupName.toLowerCase().includes(searchQuery.toLowerCase())
          );

          setFriends(filteredFriends);
          setConversations(filteredConversations);
        } else {
          setIsSearching(false);
          const response = await getConversations();

          if (!response.success) {
            throw new Error(response.message || "Failed to get conversations");
          }

          setConversations(response.data);
          setFriends([]);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
        setConversations([]);
        setFriends([]);
      }
    };

    fetchData();
  }, [refreshTrigger, searchQuery]);

  useEffect(() => {
    if (isSearching) return;

    const handleConversationUpdated = (payload: ConversationUpdatedPayload) => {
      setConversations((prev) => {
        if (!prev) return prev;

        const existingConv = prev.find(
          (conv) => conv._id === payload.conversationId
        );

        if (existingConv) {
          return prev.map((conv) => {
            if (conv._id === payload.conversationId) {
              return {
                ...conv,
                lastMessage: payload.lastMessage,
                unreadCount: payload.unreadCount,
              };
            }
            return conv;
          });
        } else {
          getConversations()
            .then((response) => {
              if (response.success) {
                setConversations(response.data);
              }
            })
            .catch((error) => {
              console.error("Failed to fetch conversations:", error);
            });
          return prev;
        }
      });
    };

    const handleUserStatus = (payload: UserStatusPayload) => {
      setConversations((prev) => {
        if (!prev) return prev;

        return prev.map((conv) => ({
          ...conv,
          participants: conv.participants.map((participant) => {
            if (participant._id === payload.userId) {
              return {
                ...participant,
                isOnline: payload.online,
              };
            }
            return participant;
          }),
        }));
      });
    };

    const handleConversationDeleted = (payload: ConversationDeletedPayload) => {
      setConversations((prev) => {
        if (!prev) return prev;
        return prev.filter((conv) => conv._id !== payload.conversationId);
      });
    };

    socketService.onConversationUpdated(handleConversationUpdated);
    socketService.onUserStatus(handleUserStatus);
    socketService.onConversationDeleted(handleConversationDeleted);

    return () => {
      socketService.offConversationUpdated(handleConversationUpdated);
      socketService.offUserStatus(handleUserStatus);
      socketService.offConversationDeleted(handleConversationDeleted);
    };
  }, [isSearching]);

  // Filter pinned (Started) and unpinned (Messages) conversations
  const starredConversations = conversations?.filter((c) => c.isPinned) || [];
  const otherConversations = conversations?.filter((c) => !c.isPinned) || [];

  // Show message when searching and no results
  if (isSearching && friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-400 text-sm">No friends found</p>
        <p className="text-gray-500 text-xs mt-1">
          Try searching with a different name
        </p>
      </div>
    );
  }

  if (
    isSearching &&
    (friends.length > 0 || (conversations && conversations.length > 0))
  ) {
    return (
      <div className="flex flex-col gap-6 mt-4">
        {friends.length > 0 && (
          <div className="flex flex-col">
            <h5 className="font-bold text-base px-2 mb-2 text-violet-200">
              Friends
            </h5>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 max-h-[300px] overflow-y-auto scrollbar-hide">
              {friends.map((friend, index) => (
                <React.Fragment key={friend._id}>
                  <div
                    onClick={() => onStartConversation?.(friend._id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
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
                      <h4 className="text-sm font-semibold text-white truncate">
                        {friend.name}
                      </h4>
                      <p className="text-xs text-white/60 truncate">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  {index < friends.length - 1 && (
                    <div className="border-t border-white/10 my-1"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {conversations && conversations.length > 0 && (
          <div className="flex flex-col">
            <h5 className="font-bold text-base px-2 mb-2 text-violet-200">
              Groups
            </h5>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 max-h-[300px] overflow-y-auto scrollbar-hide">
              {conversations.map((conv, index) => (
                <React.Fragment key={conv._id}>
                  <MessageItem
                    conversation={conv}
                    isActive={activeConversationId === conv._id}
                    onClick={onSelectConversation}
                    onMarkAsRead={onMarkAsRead}
                    onMarkAsUnread={onMarkAsUnread}
                    onDeleteConversation={onDeleteConversation}
                  />
                  {index < conversations.length - 1 && (
                    <div className="border-t border-white/10 my-1"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-white/60">No results found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Started Section - Pinned conversations */}
      {starredConversations.length > 0 && !isSearching && (
        <div className="flex flex-col">
          <h5 className="font-bold text-base px-2 mb-2 text-violet-200">
            Started
          </h5>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 max-h-[200px] overflow-y-auto scrollbar-hide">
            {starredConversations.map((conv, index) => (
              <React.Fragment key={conv._id}>
                <MessageItem
                  conversation={conv}
                  isActive={activeConversationId === conv._id}
                  onClick={onSelectConversation}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAsUnread={onMarkAsUnread}
                  onDeleteConversation={onDeleteConversation}
                />
                {index < starredConversations.length - 1 && (
                  <div className="border-t border-white/10 my-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Messages Section - Regular conversations or Search Results */}
      {otherConversations.length > 0 && (
        <div className="flex flex-col">
          <h5 className="font-bold text-base px-2 mb-2 text-violet-200">
            {isSearching ? "Search Results" : "Messages"}
          </h5>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 max-h-[400px] overflow-y-auto scrollbar-hide">
            {otherConversations.map((conv, index) => (
              <React.Fragment key={conv._id}>
                <MessageItem
                  conversation={conv}
                  isActive={activeConversationId === conv._id}
                  onClick={onSelectConversation}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAsUnread={onMarkAsUnread}
                  onDeleteConversation={onDeleteConversation}
                />
                {index < otherConversations.length - 1 && (
                  <div className="border-t border-white/10 my-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
