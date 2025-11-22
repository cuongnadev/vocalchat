import { useEffect, useRef, useState } from "react";
import { Send, Mic, Image, Paperclip } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { Header } from "./Header";
import { ConversationDetails } from "./ConversationDetails";
import { Button } from "../ui/button/Button";
import { Input } from "../ui/input/input";
import { socketService } from "@/services/socketService";
import type { Conversation, Message } from "@/types/message";
import type {
  ReceiveMessagePayload,
  SendTextMessagePayload,
  UserStatusPayload,
} from "@/types/socket";
import type { User } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import { getConversationById } from "@/app/api";
import { chatService } from "@/services/chatService";

type ChatAreaProps = {
  className?: string;
  activeConversationId: string | null;
  availableFriends?: User[];
  onUpdateGroupInfo?: (
    conversationId: string,
    groupName: string,
    groupAvatar?: string
  ) => void;
  onRemoveMember?: (conversationId: string, memberId: string) => void;
  onAddMembers?: (conversationId: string, memberIds: string[]) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onDissolveGroup?: (conversationId: string) => void;
};

export const ChatArea = ({
  className,
  activeConversationId,
  availableFriends = [],
  onUpdateGroupInfo,
  onRemoveMember,
  onAddMembers,
  onDeleteConversation,
  onDissolveGroup,
}: ChatAreaProps) => {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation>();
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeConversationId) return;

    const fetchConversation = async () => {
      try {
        const response = await getConversationById(activeConversationId);
        const responseMessages = await chatService.getMessagesByConversationId(
          activeConversationId
        );

        setMessages(
          responseMessages.data.map((msg) => ({
            ...msg,
            sender: msg.senderId === user?._id ? "me" : "them",
          }))
        );

        if (!response.success) {
          throw new Error(response.message || "Failed to get conversation");
        }

        setActiveConversation(response.data);

        // Mark messages as read when entering conversation
        if (user?._id) {
          socketService.markMessagesRead({
            conversationId: activeConversationId,
            userId: user._id,
          });
        }
      } catch (error) {
        console.log("❌ Error fetching conversation:", error);
      }
    };

    fetchConversation();
  }, [activeConversationId, user?._id]);

  useEffect(() => {
    if (!user?._id || !activeConversationId) return;

    const handleReceiveMessage = (payload: ReceiveMessagePayload) => {
      if (payload.message.conversationId === activeConversationId) {
        const messagesFormatted: Message = {
          ...payload.message,
          sender: payload.message.senderId === user?._id ? "me" : "them",
        };

        setMessages((prev) => [...prev, messagesFormatted]);

        // Mark messages as read immediately when receiving in active conversation
        if (user?._id && payload.message.senderId !== user._id) {
          socketService.markMessagesRead({
            conversationId: activeConversationId,
            userId: user._id,
          });
        }
      }
    };

    const handleUserStatus = (payload: UserStatusPayload) => {
      setActiveConversation((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          participants: prev.participants.map((participant) => {
            if (participant._id === payload.userId) {
              return {
                ...participant,
                isOnline: payload.online,
              };
            }
            return participant;
          }),
        };
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleConversationUpdated = async (payload: any) => {
      if (payload.conversationId === activeConversationId) {
        try {
          const response = await getConversationById(activeConversationId);
          if (response.success) {
            setActiveConversation(response.data);
          }
        } catch (error) {
          console.error("Failed to refresh conversation:", error);
        }
      }
    };

    socketService.onMessage(handleReceiveMessage);
    socketService.onUserStatus(handleUserStatus);
    socketService.onConversationUpdated(handleConversationUpdated);

    return () => {
      socketService.offMessage(handleReceiveMessage);
      socketService.offUserStatus(handleUserStatus);
      socketService.offConversationUpdated(handleConversationUpdated);
    };
  }, [activeConversationId, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeConversationId || !activeConversation) {
    return (
      <div
        className={`${className} bg-white/5 backdrop-blur-xl flex items-center justify-center h-screen`}
      >
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-2">
            Select a conversation to start
          </p>
          <p className="text-gray-500 text-sm">
            Choose from your existing chats or start a new one
          </p>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversationId) return;
    const payload: SendTextMessagePayload = {
      conversationId: activeConversationId,
      senderId: user?._id as string,
      receiverId: activeConversation.participants,
      text: messageInput.trim(),
      type: "text",
    };

    socketService.sendText(payload);

    console.log("payload [111]: ", payload);

    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        sender: "me",
        text: payload.text,
        isRead: false,
        status: "sending",
        type: payload.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (type: "image" | "file") => {
    // TODO: Integrate file upload
    console.log("Opening file picker for:", type);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "*/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("File selected:", file);
        // TODO: Upload file to backend
      }
    };
    input.click();
  };

  const handleVoiceRecord = () => {
    // TODO: Integrate voice recording
    console.log("Start voice recording");
  };

  return (
    <div className={`${className} bg-white/5 backdrop-blur-xl flex h-screen`}>
      <div className="flex-1 flex flex-col">
        <Header
          activeConversation={activeConversation}
          onToggleDetails={() => setShowDetails(!showDetails)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                avatar={activeConversation.participants[0].avatar}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No messages yet</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center gap-2">
            {/* File & Image buttons */}
            <Button
              icon={<Paperclip size={20} color="#8B5CF6" />}
              variant="ghost"
              size="sm"
              radius="full"
              onClick={() => handleFileSelect("file")}
              className="text-[#8B5CF6] py-3"
            />
            <Button
              icon={<Image size={20} color="#00FFFF" />}
              variant="ghost"
              size="sm"
              radius="full"
              onClick={() => handleFileSelect("image")}
              className="text-[#00FFFF] py-3"
            />

            {/* Input field */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Aa"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full"
                radius="full"
                variant="third"
              />
            </div>

            {/* Voice or Send button */}
            {messageInput.trim() ? (
              <Button
                icon={<Send size={20} />}
                variant="primary"
                size="sm"
                radius="full"
                onClick={handleSendMessage}
                className="shadow-lg hover:shadow-xl py-3"
              />
            ) : (
              <Button
                icon={<Mic size={20} color="#8B5CF6" />}
                variant="ghost"
                size="sm"
                radius="full"
                onClick={handleVoiceRecord}
                className="text-[#8B5CF6] py-3"
              />
            )}
          </div>
        </div>
      </div>

      {/* Conversation Details */}
      {showDetails && activeConversation && user && (
        <ConversationDetails
          conversation={activeConversation}
          currentUser={user}
          availableFriends={availableFriends}
          onClose={() => setShowDetails(false)}
          onUpdateGroupInfo={(groupName, groupAvatar) => {
            if (onUpdateGroupInfo) {
              onUpdateGroupInfo(activeConversation._id, groupName, groupAvatar);
            }
          }}
          onRemoveMember={(memberId) => {
            if (onRemoveMember) {
              onRemoveMember(activeConversation._id, memberId);
            }
          }}
          onAddMembers={(memberIds) => {
            if (onAddMembers) {
              onAddMembers(activeConversation._id, memberIds);
            }
          }}
          onDeleteConversation={() => {
            if (onDeleteConversation) {
              onDeleteConversation(activeConversation._id);
              setShowDetails(false);
            }
          }}
          onDissolveGroup={() => {
            if (onDissolveGroup) {
              onDissolveGroup(activeConversation._id);
              setShowDetails(false);
            }
          }}
        />
      )}
    </div>
  );
};
