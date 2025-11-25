import type { MessageResponse, MessageType } from "./message";
import type { User } from "./user";

export type CallType = "audio" | "video";
export type CallStatus =
  | "pending"
  | "ringing"
  | "ongoing"
  | "ended"
  | "missed"
  | "rejected"
  | "busy";

export interface SendTextMessagePayload {
  conversationId: string;
  senderId: string;
  receiverId: User[];
  text: string;
  type: Extract<MessageType, "text">;
}

export interface SendFileMessagePayload {
  conversationId: string;
  senderId: string;
  receiverId: User[];
  fileName: string;
  fileType: string;
  fileSize: number;
  buffer: ArrayBuffer;
  type: Extract<MessageType, "image" | "file" | "audio" | "video">;
}

export interface ReceiveMessagePayload {
  message: MessageResponse;
}

export interface TypingPayload {
  conversationId: string;
  senderId: string;
  receiverId: string;
  isTyping: boolean;
}

export interface UserStatusPayload {
  userId: string;
  online: boolean;
}

export interface ConversationCreatedPayload {
  conversationId: string;
  participantId: string;
  friendId: string;
}

export interface ConversationUpdatedPayload {
  conversationId: string;
  lastMessage: MessageResponse;
  unreadCount: number;
  participantIds: string[];
}

export interface MarkMessagesReadPayload {
  conversationId: string;
  userId: string;
}

export interface ConversationDeletedPayload {
  conversationId: string;
  participantIds: string[];
}

// Call related types
export interface InitiateCallPayload {
  conversationId: string;
  callerId: string;
  participantIds: string[];
  type: CallType;
  isGroup: boolean;
}

export interface CallResponsePayload {
  callId: string;
  oderId: string;
  response: "accept" | "reject";
}

export interface EndCallPayload {
  callId: string;
  oderId: string;
}

export interface WebRTCSignalPayload {
  callId: string;
  senderId: string;
  targetId: string;
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
  type: "offer" | "answer" | "ice-candidate";
}

export interface IncomingCallPayload {
  call: {
    _id: string;
    conversationId: string;
    callerId: string;
    participants: string[];
    type: CallType;
    status: CallStatus;
    isGroup: boolean;
  };
  caller: {
    _id: string;
    name: string;
    avatar: string;
  };
  conversationName?: string;
}

export interface CallStatusUpdatePayload {
  callId: string;
  status: CallStatus;
  oderId?: string;
}

export interface CallEndedPayload {
  callId: string;
  duration?: number;
  reason: "ended" | "missed" | "rejected" | "busy" | "error";
}

export interface UserInCallPayload {
  oderId: string;
  isInCall: boolean;
  callId?: string;
}

export interface CallHistoryPayload {
  message: MessageResponse;
  callId: string;
}

export interface ClientToServerEvents {
  "message:send:text": (payload: SendTextMessagePayload) => void;
  "message:send:file": (payload: SendFileMessagePayload) => void;
  "typing:update": (payload: TypingPayload) => void;
  "user:online": (userId: string) => void;
  "user:offline": (userId: string) => void;
  "messages:mark:read": (payload: MarkMessagesReadPayload) => void;
  // Call events
  "call:initiate": (payload: InitiateCallPayload) => void;
  "call:accept": (payload: CallResponsePayload) => void;
  "call:reject": (payload: CallResponsePayload) => void;
  "call:end": (payload: EndCallPayload) => void;
  "call:cancel": (callId: string) => void;
  "call:signal": (payload: WebRTCSignalPayload) => void;
  "call:check:status": (oderId: string) => void;
}

export interface ServerToClientEvents {
  "message:receive": (payload: ReceiveMessagePayload) => void;
  "typing:update": (payload: TypingPayload) => void;
  "user:status": (payload: UserStatusPayload) => void;
  "conversation:created": (payload: ConversationCreatedPayload) => void;
  "conversation:updated": (payload: ConversationUpdatedPayload) => void;
  "conversation:deleted": (payload: ConversationDeletedPayload) => void;
  // Call events
  "call:incoming": (payload: IncomingCallPayload) => void;
  "call:accepted": (payload: { callId: string; oderId: string }) => void;
  "call:rejected": (payload: { callId: string; oderId: string }) => void;
  "call:ended": (payload: CallEndedPayload) => void;
  "call:cancelled": (payload: { callId: string }) => void;
  "call:busy": (payload: {
    message: string;
    busyParticipants: string[];
  }) => void;
  "call:some:busy": (payload: {
    callId: string;
    busyParticipants: string[];
  }) => void;
  "call:error": (payload: { message: string }) => void;
  "call:signal": (payload: WebRTCSignalPayload) => void;
  "call:status:update": (payload: CallStatusUpdatePayload) => void;
  "call:status:response": (payload: UserInCallPayload) => void;
  "call:participant:joined": (payload: {
    callId: string;
    oderId: string;
  }) => void;
  "call:participant:rejected": (payload: {
    callId: string;
    oderId: string;
  }) => void;
  "call:history": (payload: CallHistoryPayload) => void;
}
