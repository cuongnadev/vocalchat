import { useState } from "react";
import { Send, Mic, Image, Paperclip } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { conversationsData, messagesData } from "@/constants/mock-data";
import { Header } from "./Header";

type ChatAreaProps = {
  className?: string;
  activeConversationId: string | null;
};

export const ChatArea = ({
  className,
  activeConversationId,
}: ChatAreaProps) => {
  const [messageInput, setMessageInput] = useState("");

  // Find active conversation
  const activeConversation = conversationsData.find(
    (c) => c.id === activeConversationId
  );

  // Get messages for conversation
  const messages = activeConversationId
    ? messagesData[activeConversationId] || []
    : [];

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
    if (messageInput.trim()) {
      // TODO: Integrate with backend API to send message
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
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
          <button
            onClick={() => handleFileSelect("file")}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} className="text-[#8B5CF6]" />
          </button>
          <button
            onClick={() => handleFileSelect("image")}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Send image"
          >
            <Image size={20} className="text-[#00FFFF]" />
          </button>

          {/* Input field */}
          <input
            type="text"
            placeholder="Aa"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full outline-none focus:ring-2 focus:ring-[#00FFFF] transition-colors placeholder-gray-400 text-white"
          />

          {/* Voice or Send button */}
          {messageInput.trim() ? (
            <button
              onClick={handleSendMessage}
              className="p-3 bg-linear-to-r from-[#00FFFF] to-[#8B5CF6] hover:from-[#00FFFF]/80 hover:to-[#8B5CF6]/80 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              title="Send message"
            >
              <Send size={20} className="text-white" />
            </button>
          ) : (
            <button
              onClick={handleVoiceRecord}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
              title="Record voice message"
            >
              <Mic size={20} className="text-[#8B5CF6]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
