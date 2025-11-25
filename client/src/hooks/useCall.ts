import { useState, useEffect, useCallback } from "react";
import { socketService } from "@/services/socketService";
import type {
  CallType,
  IncomingCallPayload,
  CallEndedPayload,
} from "@/types/socket";

export type CallState =
  | "idle"
  | "outgoing"
  | "incoming"
  | "connected"
  | "ended";

interface CallInfo {
  callId: string;
  conversationId: string;
  callType: CallType;
  isGroup: boolean;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  conversationName?: string;
  participants: {
    oderId: string;
    name: string;
    avatar: string;
  }[];
}

interface UseCallReturn {
  callState: CallState;
  currentCall: CallInfo | null;
  incomingCall: IncomingCallPayload | null;
  initiateCall: (
    conversationId: string,
    callType: CallType,
    participants: { oderId: string; name: string; avatar: string }[],
    isGroup: boolean,
    conversationName?: string
  ) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  cancelCall: () => void;
}

export const useCall = (currentoderId: string): UseCallReturn => {
  const [callState, setCallState] = useState<CallState>("idle");
  const [currentCall, setCurrentCall] = useState<CallInfo | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(
    null
  );

  useEffect(() => {
    const handleIncomingCall = (payload: IncomingCallPayload) => {
      if (callState === "idle") {
        setIncomingCall(payload);
        setCallState("incoming");
      } else {
        socketService.rejectCall({
          callId: payload.call._id,
          oderId: currentoderId,
          response: "reject",
        });
      }
    };

    const handleCallAccepted = ({
      callId,
    }: {
      callId: string;
      oderId: string;
    }) => {
      if (currentCall?.callId === callId) {
        setCallState("connected");
      }
    };

    const handleCallRejected = ({
      callId,
    }: {
      callId: string;
      oderId: string;
    }) => {
      if (currentCall?.callId === callId && !currentCall.isGroup) {
        setCallState("ended");
        setTimeout(() => {
          setCallState("idle");
          setCurrentCall(null);
        }, 2000);
      }
    };

    const handleCallEnded = (payload: CallEndedPayload) => {
      if (
        currentCall?.callId === payload.callId ||
        incomingCall?.call._id === payload.callId
      ) {
        setCallState("ended");
        setTimeout(() => {
          setCallState("idle");
          setCurrentCall(null);
          setIncomingCall(null);
        }, 1000);
      }
    };

    const handleCallCancelled = ({ callId }: { callId: string }) => {
      if (incomingCall?.call._id === callId) {
        setIncomingCall(null);
        setCallState("idle");
      }
    };

    const handleCallBusy = () => {
      setCallState("ended");
      setTimeout(() => {
        setCallState("idle");
        setCurrentCall(null);
      }, 2000);
    };

    const handleCallError = () => {
      setCallState("idle");
      setCurrentCall(null);
    };

    socketService.onIncomingCall(handleIncomingCall);
    socketService.onCallAccepted(handleCallAccepted);
    socketService.onCallRejected(handleCallRejected);
    socketService.onCallEnded(handleCallEnded);
    socketService.onCallCancelled(handleCallCancelled);
    socketService.onCallBusy(handleCallBusy);
    socketService.onCallError(handleCallError);

    return () => {
      socketService.offIncomingCall(handleIncomingCall);
      socketService.offCallAccepted(handleCallAccepted);
      socketService.offCallRejected(handleCallRejected);
      socketService.offCallEnded(handleCallEnded);
      socketService.offCallCancelled(handleCallCancelled);
      socketService.offCallBusy(handleCallBusy);
      socketService.offCallError(handleCallError);
    };
  }, [callState, currentCall, incomingCall, currentoderId]);

  const initiateCall = useCallback(
    (
      conversationId: string,
      callType: CallType,
      participants: { oderId: string; name: string; avatar: string }[],
      isGroup: boolean,
      conversationName?: string
    ) => {
      if (callState !== "idle") {
        return;
      }

      const participantIds = participants.map((p) => p.oderId);

      // Generate a temporary call ID (will be replaced by server)
      const tempCallId = `temp-${Date.now()}`;

      setCurrentCall({
        callId: tempCallId,
        conversationId,
        callType,
        isGroup,
        callerId: currentoderId,
        callerName: "You",
        callerAvatar: "",
        conversationName,
        participants,
      });

      setCallState("outgoing");

      socketService.initiateCall({
        conversationId,
        callerId: currentoderId,
        participantIds,
        type: callType,
        isGroup,
      });

      // Listen for the actual call ID from server
      const handleIncomingCall = (payload: IncomingCallPayload) => {
        if (
          payload.call.conversationId === conversationId &&
          payload.call.callerId === currentoderId
        ) {
          setCurrentCall((prev) =>
            prev
              ? {
                  ...prev,
                  callId: payload.call._id,
                }
              : null
          );
          socketService.offIncomingCall(handleIncomingCall);
        }
      };

      socketService.onIncomingCall(handleIncomingCall);
    },
    [callState, currentoderId]
  );

  const acceptCall = useCallback(() => {
    if (!incomingCall) return;

    socketService.acceptCall({
      callId: incomingCall.call._id,
      oderId: currentoderId,
      response: "accept",
    });

    setCurrentCall({
      callId: incomingCall.call._id,
      conversationId: incomingCall.call.conversationId,
      callType: incomingCall.call.type,
      isGroup: incomingCall.call.isGroup,
      callerId: incomingCall.caller._id,
      callerName: incomingCall.caller.name,
      callerAvatar: incomingCall.caller.avatar,
      conversationName: incomingCall.conversationName,
      participants: [
        {
          oderId: incomingCall.caller._id,
          name: incomingCall.caller.name,
          avatar: incomingCall.caller.avatar,
        },
      ],
    });

    setIncomingCall(null);
    setCallState("connected");
  }, [incomingCall, currentoderId]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;

    socketService.rejectCall({
      callId: incomingCall.call._id,
      oderId: currentoderId,
      response: "reject",
    });

    setIncomingCall(null);
    setCallState("idle");
  }, [incomingCall, currentoderId]);

  const endCall = useCallback(() => {
    if (!currentCall) return;

    socketService.endCall({
      callId: currentCall.callId,
      oderId: currentoderId,
    });

    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
      setCurrentCall(null);
    }, 1000);
  }, [currentCall, currentoderId]);

  const cancelCall = useCallback(() => {
    if (!currentCall) return;

    socketService.cancelCall(currentCall.callId);

    setCallState("idle");
    setCurrentCall(null);
  }, [currentCall]);

  return {
    callState,
    currentCall,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    cancelCall,
  };
};
