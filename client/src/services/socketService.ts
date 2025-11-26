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
  ConversationUpdatedPayload,
  ConversationDeletedPayload,
  MarkMessagesReadPayload,
  InitiateCallPayload,
  CallResponsePayload,
  EndCallPayload,
  WebRTCSignalPayload,
  IncomingCallPayload,
  CallStatusUpdatePayload,
  CallEndedPayload,
  UserInCallPayload,
  CallHistoryPayload,
} from "@/types/socket";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

type MessageCallback = (payload: ReceiveMessagePayload) => void;
type TypingCallback = (payload: TypingPayload) => void;
type UserStatusCallback = (payload: UserStatusPayload) => void;
type ConversationCreatedCallback = (
  payload: ConversationCreatedPayload
) => void;
type ConversationUpdatedCallback = (
  payload: ConversationUpdatedPayload
) => void;
type ConversationDeletedCallback = (
  payload: ConversationDeletedPayload
) => void;

// Call callbacks
type IncomingCallCallback = (payload: IncomingCallPayload) => void;
type CallAcceptedCallback = (payload: {
  callId: string;
  oderId: string;
}) => void;
type CallRejectedCallback = (payload: {
  callId: string;
  oderId: string;
}) => void;
type CallEndedCallback = (payload: CallEndedPayload) => void;
type CallCancelledCallback = (payload: { callId: string }) => void;
type CallBusyCallback = (payload: {
  message: string;
  busyParticipants: string[];
}) => void;
type CallSomeBusyCallback = (payload: {
  callId: string;
  busyParticipants: string[];
}) => void;
type CallErrorCallback = (payload: { message: string }) => void;
type CallSignalCallback = (payload: WebRTCSignalPayload) => void;
type CallStatusUpdateCallback = (payload: CallStatusUpdatePayload) => void;
type CallStatusResponseCallback = (payload: UserInCallPayload) => void;
type CallParticipantJoinedCallback = (payload: {
  callId: string;
  oderId: string;
}) => void;
type CallParticipantRejectedCallback = (payload: {
  callId: string;
  oderId: string;
}) => void;
type CallHistoryCallback = (payload: CallHistoryPayload) => void;

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;

  connect(userId: string) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { userId },
      timeout: 60000,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔥 Socket connection error:", error);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Send messages
  sendText(payload: SendTextMessagePayload) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("message:send:text", payload);
  }

  sendFile(payload: SendFileMessagePayload) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit("message:send:file", payload);
  }

  updateTyping(payload: TypingPayload) {
    this.socket?.emit("typing:update", payload);
  }

  markMessagesRead(payload: MarkMessagesReadPayload) {
    this.socket?.emit("messages:mark:read", payload);
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

  onConversationUpdated(callback: ConversationUpdatedCallback) {
    this.socket?.on("conversation:updated", callback);
  }

  onConversationDeleted(callback: ConversationDeletedCallback) {
    this.socket?.on("conversation:deleted", callback);
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

  offConversationUpdated(callback?: ConversationUpdatedCallback) {
    this.socket?.off("conversation:updated", callback);
  }

  offConversationDeleted(callback?: ConversationDeletedCallback) {
    this.socket?.off("conversation:deleted", callback);
  }

  // Call methods
  initiateCall(payload: InitiateCallPayload) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("call:initiate", payload);
  }

  acceptCall(payload: CallResponsePayload) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("call:accept", payload);
  }

  rejectCall(payload: CallResponsePayload) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("call:reject", payload);
  }

  endCall(payload: EndCallPayload) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("call:end", payload);
  }

  cancelCall(callId: string) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("call:cancel", callId);
  }

  sendSignal(payload: WebRTCSignalPayload) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("call:signal", payload);
  }

  checkUserStatus(oderId: string) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("call:check:status", oderId);
  }

  // Call event listeners
  onIncomingCall(callback: IncomingCallCallback) {
    this.socket?.on("call:incoming", callback);
  }

  onCallAccepted(callback: CallAcceptedCallback) {
    this.socket?.on("call:accepted", callback);
  }

  onCallRejected(callback: CallRejectedCallback) {
    this.socket?.on("call:rejected", callback);
  }

  onCallEnded(callback: CallEndedCallback) {
    this.socket?.on("call:ended", callback);
  }

  onCallCancelled(callback: CallCancelledCallback) {
    this.socket?.on("call:cancelled", callback);
  }

  onCallBusy(callback: CallBusyCallback) {
    this.socket?.on("call:busy", callback);
  }

  onCallSomeBusy(callback: CallSomeBusyCallback) {
    this.socket?.on("call:some:busy", callback);
  }

  onCallError(callback: CallErrorCallback) {
    this.socket?.on("call:error", callback);
  }

  onCallSignal(callback: CallSignalCallback) {
    this.socket?.on("call:signal", callback);
  }

  onCallStatusUpdate(callback: CallStatusUpdateCallback) {
    this.socket?.on("call:status:update", callback);
  }

  onCallStatusResponse(callback: CallStatusResponseCallback) {
    this.socket?.on("call:status:response", callback);
  }

  onCallParticipantJoined(callback: CallParticipantJoinedCallback) {
    this.socket?.on("call:participant:joined", callback);
  }

  onCallParticipantRejected(callback: CallParticipantRejectedCallback) {
    this.socket?.on("call:participant:rejected", callback);
  }

  onCallHistory(callback: CallHistoryCallback) {
    this.socket?.on("call:history", callback);
  }

  // Off call event listeners
  offIncomingCall(callback?: IncomingCallCallback) {
    this.socket?.off("call:incoming", callback);
  }

  offCallAccepted(callback?: CallAcceptedCallback) {
    this.socket?.off("call:accepted", callback);
  }

  offCallRejected(callback?: CallRejectedCallback) {
    this.socket?.off("call:rejected", callback);
  }

  offCallEnded(callback?: CallEndedCallback) {
    this.socket?.off("call:ended", callback);
  }

  offCallCancelled(callback?: CallCancelledCallback) {
    this.socket?.off("call:cancelled", callback);
  }

  offCallBusy(callback?: CallBusyCallback) {
    this.socket?.off("call:busy", callback);
  }

  offCallSomeBusy(callback?: CallSomeBusyCallback) {
    this.socket?.off("call:some:busy", callback);
  }

  offCallError(callback?: CallErrorCallback) {
    this.socket?.off("call:error", callback);
  }

  offCallSignal(callback?: CallSignalCallback) {
    this.socket?.off("call:signal", callback);
  }

  offCallStatusUpdate(callback?: CallStatusUpdateCallback) {
    this.socket?.off("call:status:update", callback);
  }

  offCallStatusResponse(callback?: CallStatusResponseCallback) {
    this.socket?.off("call:status:response", callback);
  }

  offCallParticipantJoined(callback?: CallParticipantJoinedCallback) {
    this.socket?.off("call:participant:joined", callback);
  }

  offCallParticipantRejected(callback?: CallParticipantRejectedCallback) {
    this.socket?.off("call:participant:rejected", callback);
  }

  offCallHistory(callback?: CallHistoryCallback) {
    this.socket?.off("call:history", callback);
  }
}

export const socketService = new SocketService();
