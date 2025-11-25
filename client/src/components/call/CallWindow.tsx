import { useState, useEffect, useRef, useCallback } from "react";
import {
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Users,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { CallType, WebRTCSignalPayload } from "@/types/socket";
import { socketService } from "@/services/socketService";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

interface Participant {
  oderId: string;
  name: string;
  avatar: string;
  stream?: MediaStream;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

interface CallWindowProps {
  callId: string;
  callType: CallType;
  currentoderId: string;
  participants: Participant[];
  isGroup: boolean;
  isCaller: boolean;
  conversationName?: string;
  onEndCall: () => void;
  onClose: () => void;
}

export const CallWindow = ({
  callId,
  callType,
  currentoderId,
  participants: initialParticipants,
  isGroup,
  isCaller,
  conversationName,
  onEndCall,
  onClose,
}: CallWindowProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants] = useState<Participant[]>(initialParticipants);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [connectionStatus, setConnectionStatus] =
    useState<string>("connecting");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize media stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const initMedia = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: callType === "video",
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        setLocalStream(stream);

        // For video calls, set the video element
        if (callType === "video" && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Failed to get media stream:", error);
        setConnectionStatus("media-error");
      }
    };

    initMedia();

    return () => {
      currentStream?.getTracks().forEach((track) => track.stop());
    };
  }, [callType]);

  // Start call timer
  useEffect(() => {
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Create peer connection for a participant
  const createPeerConnection = useCallback(
    (targetId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.sendSignal({
            callId,
            senderId: currentoderId,
            targetId,
            signal: event.candidate.toJSON(),
            type: "ice-candidate",
          });
        }
      };

      // Handle incoming tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];

        // When we receive a track, it means the connection is established
        setConnectionStatus("connected");

        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(targetId, remoteStream);
          return newMap;
        });

        if (callType === "audio" && event.track.kind === "audio") {
          let audioEl = remoteAudioRefs.current.get(targetId);
          if (!audioEl) {
            audioEl = new Audio();
            audioEl.autoplay = true;
            remoteAudioRefs.current.set(targetId, audioEl);
          }
          audioEl.srcObject = remoteStream;
          audioEl
            .play()
            .catch((err) => console.error("Audio play error:", err));
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setConnectionStatus("connected");
        } else if (pc.connectionState === "failed") {
          setConnectionStatus("failed");
        }
        // Ignore "disconnected", "closed", "connecting", "new" - they are transitional
      };

      // Also monitor ICE connection state as backup
      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === "connected" ||
          pc.iceConnectionState === "completed"
        ) {
          setConnectionStatus("connected");
        } else if (pc.iceConnectionState === "failed") {
          setConnectionStatus("failed");
        }
        // Ignore "checking", "disconnected", "closed", "new" - they are transitional or may recover
      };

      peerConnections.current.set(targetId, pc);
      return pc;
    },
    [callId, currentoderId, localStream]
  );

  // Handle WebRTC signaling
  useEffect(() => {
    if (!localStream) return;

    const handleSignal = async (payload: WebRTCSignalPayload) => {
      if (payload.callId !== callId) return;
      if (payload.targetId !== currentoderId) return;

      let pc = peerConnections.current.get(payload.senderId);

      if (payload.type === "offer") {
        if (!pc) {
          pc = createPeerConnection(payload.senderId);
        }
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload.signal as RTCSessionDescriptionInit)
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketService.sendSignal({
          callId,
          senderId: currentoderId,
          targetId: payload.senderId,
          signal: answer,
          type: "answer",
        });
      } else if (payload.type === "answer") {
        if (pc) {
          await pc.setRemoteDescription(
            new RTCSessionDescription(
              payload.signal as RTCSessionDescriptionInit
            )
          );
        }
      } else if (payload.type === "ice-candidate") {
        if (pc) {
          try {
            await pc.addIceCandidate(
              new RTCIceCandidate(payload.signal as RTCIceCandidateInit)
            );
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      }
    };

    socketService.onCallSignal(handleSignal);

    // If caller, initiate connections to all participants
    if (isCaller) {
      participants.forEach(async (participant) => {
        if (participant.oderId !== currentoderId) {
          const pc = createPeerConnection(participant.oderId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketService.sendSignal({
            callId,
            senderId: currentoderId,
            targetId: participant.oderId,
            signal: offer,
            type: "offer",
          });
        }
      });
    } else {
      // If receiver, wait a bit then send offer if no connection established
      // This handles the case where caller's offer was sent before receiver was ready
      const timeoutId = setTimeout(() => {
        participants.forEach(async (participant) => {
          if (participant.oderId !== currentoderId) {
            // Only create offer if we don't have a peer connection yet
            if (!peerConnections.current.has(participant.oderId)) {
              const pc = createPeerConnection(participant.oderId);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socketService.sendSignal({
                callId,
                senderId: currentoderId,
                targetId: participant.oderId,
                signal: offer,
                type: "offer",
              });
            }
          }
        });
      }, 1000); // Wait 1 second for caller's offer

      return () => {
        clearTimeout(timeoutId);
        socketService.offCallSignal(handleSignal);
      };
    }

    return () => {
      socketService.offCallSignal(handleSignal);
    };
  }, [
    callId,
    currentoderId,
    isCaller,
    localStream,
    participants,
    createPeerConnection,
  ]);

  // Handle participant joined
  useEffect(() => {
    const handleParticipantJoined = async ({
      oderId,
    }: {
      callId: string;
      oderId: string;
    }) => {
      // Create peer connection and send offer to new participant
      const pc = createPeerConnection(oderId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketService.sendSignal({
        callId,
        senderId: currentoderId,
        targetId: oderId,
        signal: offer,
        type: "offer",
      });
    };

    socketService.onCallParticipantJoined(handleParticipantJoined);

    return () => {
      socketService.offCallParticipantJoined(handleParticipantJoined);
    };
  }, [callId, currentoderId, createPeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    const connections = peerConnections.current;
    const audioRefs = remoteAudioRefs.current;
    return () => {
      // Close all peer connections
      connections.forEach((pc) => pc.close());
      connections.clear();

      // Stop all audio elements
      audioRefs.forEach((audio) => {
        audio.srcObject = null;
        audio.pause();
      });
      audioRefs.clear();

      // Stop all tracks
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [localStream]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = () => {
    // Stop all tracks
    localStream?.getTracks().forEach((track) => track.stop());

    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Stop all remote audio elements
    remoteAudioRefs.current.forEach((audio) => {
      audio.srcObject = null;
      audio.pause();
    });
    remoteAudioRefs.current.clear();

    onEndCall();
    onClose();
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const remoteParticipants = participants.filter(
    (p) => p.oderId !== currentoderId
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9999 bg-linear-to-br from-[#0a001f] via-[#10002b] to-[#1b0038] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/20">
        <div className="flex items-center gap-3">
          {isGroup && <Users size={20} className="text-gray-400" />}
          <span className="text-white font-semibold">
            {isGroup
              ? conversationName || "Group Call"
              : remoteParticipants[0]?.name || "Call"}
          </span>
          <span className="text-gray-400 text-sm">
            {formatDuration(callDuration)}
          </span>
          {connectionStatus === "connecting" && (
            <span className="text-yellow-400 text-xs animate-pulse">
              Connecting...
            </span>
          )}
          {connectionStatus === "connected" && (
            <span className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Connected
            </span>
          )}
          {connectionStatus === "failed" && (
            <span className="text-red-400 text-xs">Connection Failed</span>
          )}
          {connectionStatus === "media-error" && (
            <span className="text-red-400 text-xs">Media Error</span>
          )}
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 size={20} className="text-gray-400" />
          ) : (
            <Maximize2 size={20} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-4 overflow-hidden">
        {callType === "video" ? (
          <div
            className={`grid gap-4 h-full ${
              remoteParticipants.length === 0
                ? "grid-cols-1"
                : remoteParticipants.length === 1
                ? "grid-cols-2"
                : remoteParticipants.length <= 3
                ? "grid-cols-2 grid-rows-2"
                : "grid-cols-3 grid-rows-2"
            }`}
          >
            {/* Remote videos */}
            {remoteParticipants.map((participant) => {
              const stream = remoteStreams.get(participant.oderId);
              return (
                <div
                  key={participant.oderId}
                  className="relative bg-gray-900 rounded-2xl overflow-hidden"
                >
                  {stream ? (
                    <video
                      autoPlay
                      playsInline
                      ref={(el) => {
                        if (el && el.srcObject !== stream) {
                          el.srcObject = stream;
                          // Ensure audio plays for video calls
                          el.muted = false;
                          el.play().catch((err) =>
                            console.error("Video play error:", err)
                          );
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={
                          participant.avatar ||
                          "https://avatar.iran.liara.run/public"
                        }
                        alt={participant.name}
                        className="w-24 h-24 rounded-full"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-lg">
                    <span className="text-white text-sm">
                      {participant.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Local video (small, positioned in corner) */}
            <div
              className={`${
                remoteParticipants.length > 0
                  ? "absolute bottom-24 right-8 w-48 h-36"
                  : "w-full h-full"
              } bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20`}
            >
              {isVideoEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <VideoOff
                      size={32}
                      className="text-gray-500 mx-auto mb-2"
                    />
                    <span className="text-gray-500 text-sm">Camera off</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                You
              </div>
            </div>
          </div>
        ) : (
          // Audio call UI
          <div className="h-full flex flex-col items-center justify-center">
            <div className="flex flex-wrap justify-center gap-8 max-w-3xl">
              {remoteParticipants.map((participant) => (
                <div
                  key={participant.oderId}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <img
                      src={
                        participant.avatar ||
                        "https://avatar.iran.liara.run/public"
                      }
                      alt={participant.name}
                      className="w-32 h-32 rounded-full border-4 border-cyan-500/50"
                    />
                    {/* Audio visualizer placeholder */}
                    <div className="absolute -inset-2 rounded-full border-2 border-cyan-500/30 animate-pulse" />
                  </div>
                  <span className="mt-4 text-white font-medium">
                    {participant.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-6 bg-black/30 backdrop-blur-lg">
        <div className="flex items-center justify-center gap-4">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-300 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {isMuted ? (
              <MicOff size={24} className="text-white" />
            ) : (
              <Mic size={24} className="text-white" />
            )}
          </button>

          {/* Video toggle (only for video calls) */}
          {callType === "video" && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all duration-300 ${
                !isVideoEnabled
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {isVideoEnabled ? (
                <Video size={24} className="text-white" />
              ) : (
                <VideoOff size={24} className="text-white" />
              )}
            </button>
          )}

          {/* Screen share (placeholder) */}
          <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
            <Monitor size={24} className="text-white" />
          </button>

          {/* End call button */}
          <button
            onClick={handleEndCall}
            className="p-4 px-8 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300"
          >
            <PhoneOff size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
