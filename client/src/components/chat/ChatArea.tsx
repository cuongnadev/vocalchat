import { useEffect, useRef, useState } from "react";
import { Send, Mic, Image, Paperclip } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { conversationsData } from "@/constants/mock-data";
import { Header } from "./Header";
import { Button } from "../ui/button/Button";
import { Input } from "../ui/input/input";
import { socketService } from "@/services/chatService";
import type { Message } from "@/types/message";
import type { ReceiveMessagePayload, SendTextMessagePayload } from "@/types/socket";

type ChatAreaProps = {
  className?: string;
  activeConversationId: string | null;
  currentUserId: string;
};

export const ChatArea = ({
  className,
  activeConversationId,
  currentUserId
}: ChatAreaProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUserId) return;
    socketService.connect(currentUserId);

    const handleReceiveMessage = (payload: ReceiveMessagePayload) => {
      if (payload.message.conversationId === activeConversationId) {
        setMessages((prev) => [...prev, payload.message]);
      }
    };

    socketService.onMessage(handleReceiveMessage);

    return () => {
      socketService.offMessage(handleReceiveMessage);
    };
  }, [activeConversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversationsData.find(
    (c) => c.id === activeConversationId
  );

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
      senderId: currentUserId,
      receiverId: activeConversation.participantId,
      text: messageInput.trim(),
      type: "text",
    };

    socketService.sendText(payload);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        sender: "me",
        text: payload.text,
        isRead: false,
        status: "sending",
        type: payload.type,
        createdAt: new Date().toISOString(),
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
    <div
      className={`${className} bg-white/5 backdrop-blur-xl flex flex-col h-screen`}
    >
      {/* Header */}
      <Header activeConversation={activeConversation} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              avatar={activeConversation.participant.avatar}
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
  );
};
