import { useEffect, useRef, useState } from "react";
import { Send, Mic, Image, Paperclip } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { Header } from "./Header";
import { ConversationDetails } from "./ConversationDetails";
import { Button } from "../ui/button/Button";
import { Input } from "../ui/input/input";
import { socketService } from "@/services/socketService";
import type { Conversation, Message, MessageType } from "@/types/message";
import type {
  ReceiveMessagePayload,
  SendTextMessagePayload,
  SendFileMessagePayload,
  UserStatusPayload,
  CallHistoryPayload,
} from "@/types/socket";
import type { User } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getConversationById } from "@/app/api";
import { chatService } from "@/services/chatService";
import { Toast } from "../ui/toast/Toast";
import { VoiceModal } from "../common/modal/VoiceModal";

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
  const { showToast, toasts, removeToast } = useToast();
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation>();
  const [showDetails, setShowDetails] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

        setMessages((prev) => {
          const filtered = prev.filter(
            (msg) =>
              !(
                msg._id.startsWith("temp-") &&
                msg.conversationId === messagesFormatted.conversationId &&
                msg.senderId === messagesFormatted.senderId
              )
          );
          return [...filtered, messagesFormatted];
        });

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

    // Handle call history messages
    const handleCallHistory = (payload: CallHistoryPayload) => {
      if (payload.message.conversationId === activeConversationId) {
        const callMessage: Message = {
          ...payload.message,
          sender: payload.message.senderId === user?._id ? "me" : "them",
        };

        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === callMessage._id);
          if (exists) return prev;
          return [...prev, callMessage];
        });
      }
    };

    socketService.onMessage(handleReceiveMessage);
    socketService.onUserStatus(handleUserStatus);
    socketService.onConversationUpdated(handleConversationUpdated);
    socketService.onCallHistory(handleCallHistory);

    return () => {
      socketService.offMessage(handleReceiveMessage);
      socketService.offUserStatus(handleUserStatus);
      socketService.offConversationUpdated(handleConversationUpdated);
      socketService.offCallHistory(handleCallHistory);
    };
  }, [activeConversationId, user?._id, messages]);

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

    setMessages((prev) => [
      ...prev,
      {
        _id: `temp-${Date.now()}`,
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
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "*/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (!file || !activeConversation || !user) {
        return;
      }

      try {
        const dangerousExtensions = [
          ".exe",
          ".bat",
          ".cmd",
          ".sh",
          ".com",
          ".scr",
        ];
        const fileExtension = file.name
          .toLowerCase()
          .substring(file.name.lastIndexOf("."));
        if (dangerousExtensions.includes(fileExtension)) {
          showToast("error", "This file type is not allowed!");
          return;
        }

        // Validate file size based on type
        const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
        if (file.size > maxSize) {
          const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
          showToast(
            "error",
            `File is too large! Maximum size for ${
              type === "image" ? "image" : "file"
            } is ${sizeMB}MB. Your file: ${fileSizeMB}MB`
          );
          return;
        }

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Determine message type based on file type
        let messageType: "image" | "file" | "audio" | "video" = "file";

        // If user clicked image button, force it to be image type
        if (type === "image") {
          messageType = "image";
        } else {
          // Otherwise, auto-detect from MIME type
          if (file.type.startsWith("image/")) messageType = "image";
          else if (file.type.startsWith("audio/")) messageType = "audio";
          else if (file.type.startsWith("video/")) messageType = "video";
        }

        // Get receiver info - use full User objects from participants
        const receiverId = activeConversation.participants;

        // Create temporary message for UI
        const tempMessage: Message = {
          _id: `temp-${Date.now()}`,
          conversationId: activeConversation._id,
          senderId: user._id,
          text: file.name,
          sender: "me",
          isRead: false,
          status: "sending",
          type: messageType,
          fileMetadata: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            filePath: "",
            fileUrl: URL.createObjectURL(file),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to UI immediately
        setMessages((prev) => [...prev, tempMessage]);

        // Send via socket
        const payload: SendFileMessagePayload = {
          conversationId: activeConversation._id,
          senderId: user._id,
          receiverId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          buffer: arrayBuffer,
          type: messageType,
        };

        socketService.sendFile(payload);

        // Show success toast
        showToast(
          "success",
          `Sending ${messageType === "image" ? "image" : "file"}: ${file.name}`
        );
      } catch (error) {
        console.error("Error uploading file:", error);
        showToast("error", "Error uploading file. Please try again!");
        // Remove failed temp message
        setMessages((prev) =>
          prev.filter((msg) => !msg._id.startsWith("temp-"))
        );
      }
    };
    input.click();
  };

  const handleSendRecord = async (
    mode: Extract<MessageType, "text" | "audio">,
    audio: Blob
  ) => {
    if (!activeConversationId) return;

    if (mode === "audio") {
      const file = new File([audio], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const tempMessage: Message = {
        _id: `temp-${Date.now()}`,
        conversationId: activeConversation._id,
        senderId: user?._id as string,
        text: file.name,
        sender: "me",
        isRead: false,
        status: "sending",
        type: "audio",
        fileMetadata: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          filePath: "",
          fileUrl: URL.createObjectURL(file),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to UI immediately
      setMessages((prev) => [...prev, tempMessage]);

      // Send via socket
      const payload: SendFileMessagePayload = {
        conversationId: activeConversation._id,
        senderId: user?._id as string,
        receiverId: activeConversation.participants,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        buffer: await audio.arrayBuffer(),
        type: "audio",
      };

      socketService.sendFile(payload);
    }

    if (mode === "text") {
      setIsConverting(true);

      const response = await chatService.convertVoiceToText(audio);

      setIsConverting(false);

      const payload: SendTextMessagePayload = {
        conversationId: activeConversationId,
        senderId: user?._id as string,
        receiverId: activeConversation.participants,
        text: response.data,
        type: "text",
      };

      socketService.sendText(payload);

      setMessages((prev) => [
        ...prev,
        {
          _id: `temp-${Date.now()}`,
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
    }
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4">
          {isConverting && (
            <p className="text-sm text-right text-[#00FFFF] -translate-y-2 -translate-x-16">
              Converting voice to text...
            </p>
          )}
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
                onClick={() => setShowVoiceModal(true)}
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

      {showVoiceModal && (
        <VoiceModal
          onClose={() => setShowVoiceModal(false)}
          onSend={handleSendRecord}
        />
      )}
    </div>
  );
};
