import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SendTextMessagePayload,
  SendFileMessagePayload,
  ReceiveMessagePayload,
  TypingPayload,
  UserStatusPayload,
  ConversationCreatedPayload,
} from "@/types/socket";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

type MessageCallback = (payload: ReceiveMessagePayload) => void;
type TypingCallback = (payload: TypingPayload) => void;
type UserStatusCallback = (payload: UserStatusPayload) => void;
type ConversationCreatedCallback = (
  payload: ConversationCreatedPayload
) => void;

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
``    null;

  connect(userId: string) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { userId },
    });

    this.socket.on("connect", () => {
      console.log("🔌 Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Send messages
  sendText(payload: SendTextMessagePayload) {
    this.socket?.emit("message:send:text", payload);
  }

  sendFile(payload: SendFileMessagePayload) {
    this.socket?.emit("message:send:file", payload);
  }

  updateTyping(payload: TypingPayload) {
    this.socket?.emit("typing:update", payload);
  }

  onMessage(callback: MessageCallback) {
    this.socket?.on("message:receive", callback);
  }

  onTyping(callback: TypingCallback) {
    this.socket?.on("typing:update", callback);
  }

  onUserStatus(callback: UserStatusCallback) {
    this.socket?.on("user:status", callback);
  }

  onConversationCreated(callback: ConversationCreatedCallback) {
    this.socket?.on("conversation:created", callback);
  }

  offMessage(callback?: MessageCallback) {
    this.socket?.off("message:receive", callback);
  }

  offTyping(callback?: TypingCallback) {
    this.socket?.off("typing:update", callback);
  }

  offUserStatus(callback?: UserStatusCallback) {
    this.socket?.off("user:status", callback);
  }

  offConversationCreated(callback?: ConversationCreatedCallback) {
    this.socket?.off("conversation:created", callback);
  }
}

export const socketService = new SocketService();
