import { useState, useEffect, useCallback, type ReactNode } from "react";
import { socketService } from "@/services/socketService";
import { IncomingCallPopup } from "@/components/call/IncomingCallPopup";
import { OutgoingCallPopup } from "@/components/call/OutgoingCallPopup";
import { CallWindow } from "@/components/call/CallWindow";
import {
  CallContext,
  type CallState,
  type CallInfo,
  type CallParticipant,
} from "@/components/call/CallContext";
import type {
  CallType,
  IncomingCallPayload,
  CallEndedPayload,
} from "@/types/socket";

interface CallProviderProps {
  children: ReactNode;
  currentoderId: string;
  currentoderName: string;
  currentoderAvatar: string;
}

export const CallProvider = ({
  children,
  currentoderId,
  currentoderName,
  currentoderAvatar,
}: CallProviderProps) => {
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
      if (currentCall?.callId === callId || callState === "outgoing") {
        setCallState("connected");
        if (currentCall?.callId.startsWith("temp-")) {
          setCurrentCall((prev) => (prev ? { ...prev, callId } : null));
        }
      }
    };

    const handleCallRejected = ({
      callId,
    }: {
      callId: string;
      oderId: string;
    }) => {
      if (
        (currentCall?.callId === callId || callState === "outgoing") &&
        !currentCall?.isGroup
      ) {
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
        incomingCall?.call._id === payload.callId ||
        callState === "outgoing" ||
        callState === "connected"
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
      participants: CallParticipant[],
      isGroup: boolean,
      conversationName?: string
    ) => {
      if (callState !== "idle") {
        return;
      }

      const participantIds = participants.map((p) => p.oderId);
      const tempCallId = `temp-${Date.now()}`;

      setCurrentCall({
        callId: tempCallId,
        conversationId,
        callType,
        isGroup,
        callerId: currentoderId,
        callerName: currentoderName,
        callerAvatar: currentoderAvatar,
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
    },
    [callState, currentoderId, currentoderName, currentoderAvatar]
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

  return (
    <CallContext.Provider
      value={{
        callState,
        currentCall,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        cancelCall,
      }}
    >
      {children}

      {/* Incoming call popup */}
      {callState === "incoming" && incomingCall && (
        <IncomingCallPopup
          callData={incomingCall}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}

      {/* Outgoing call popup */}
      {callState === "outgoing" && currentCall && (
        <OutgoingCallPopup
          callerName={currentCall.participants[0]?.name || "Unknown"}
          callerAvatar={
            currentCall.participants[0]?.avatar ||
            "https://avatar.iran.liara.run/public"
          }
          callType={currentCall.callType}
          isGroup={currentCall.isGroup}
          groupName={currentCall.conversationName}
          onCancel={cancelCall}
        />
      )}

      {/* Call window */}
      {callState === "connected" && currentCall && (
        <CallWindow
          callId={currentCall.callId}
          callType={currentCall.callType}
          currentoderId={currentoderId}
          participants={[
            {
              oderId: currentoderId,
              name: currentoderName,
              avatar: currentoderAvatar,
            },
            ...currentCall.participants,
          ]}
          isGroup={currentCall.isGroup}
          isCaller={currentCall.callerId === currentoderId}
          conversationName={currentCall.conversationName}
          onEndCall={endCall}
          onClose={() => {
            setCallState("idle");
            setCurrentCall(null);
          }}
        />
      )}
    </CallContext.Provider>
  );
};
