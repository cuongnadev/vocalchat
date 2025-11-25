import { createContext, useContext } from "react";
import type { CallType } from "@/types/socket";

export type CallState =
  | "idle"
  | "outgoing"
  | "incoming"
  | "connected"
  | "ended";

export interface CallParticipant {
  oderId: string;
  name: string;
  avatar: string;
}

export interface CallInfo {
  callId: string;
  conversationId: string;
  callType: CallType;
  isGroup: boolean;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  conversationName?: string;
  participants: CallParticipant[];
}

export interface CallContextType {
  callState: CallState;
  currentCall: CallInfo | null;
  initiateCall: (
    conversationId: string,
    callType: CallType,
    participants: CallParticipant[],
    isGroup: boolean,
    conversationName?: string
  ) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  cancelCall: () => void;
}

export const CallContext = createContext<CallContextType | null>(null);

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within a CallProvider");
  }
  return context;
};
