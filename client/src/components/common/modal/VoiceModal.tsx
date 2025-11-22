import { useState, useRef, useEffect } from "react";
import { Mic, Trash2, SendHorizonal, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";

type VoiceModalProps = {
    onClose: () => void;
    onSend: (mode: "audio" | "text", audio: Blob) => void;
};

export const VoiceModal = ({ onClose, onSend }: VoiceModalProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [seconds, setSeconds] = useState(0);
    const [sendMode, setSendMode] = useState<"audio" | "text">("audio");
    const isCancelledRef = useRef(false);

    const timerRef = useRef<number | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = window.setInterval(() => setSeconds(prev => prev + 1), 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRecording]);

    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            isCancelledRef.current = false;
            setSeconds(0);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const recorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                if (!isCancelledRef.current && chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" });
                    onSend(sendMode, blob);
                }

                streamRef.current?.getTracks().forEach(t => t.stop());
                streamRef.current = null;
                chunksRef.current = [];
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch {
            alert("Microphone not accessible. Please check your device settings.");
            onClose();
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleMainButton = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };


    const handleDelete = () => {
        isCancelledRef.current = true;
        stopRecording();
    };

    const handleClose = () => {
        if (isRecording) {
            isCancelledRef.current = true;
            stopRecording();
        }
        onClose();
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="relative flex flex-col items-center bg-white/5 backdrop-blur-xl border-r border-white/10 rounded-lg p-8 w-100 gap-1">

                {/* Header */}
                {!isRecording ? (
                    <p className="text-white text-lg font-medium">Nhấn để ghi âm</p>
                ) : (
                    <div className="flex items-center justify-between w-full px-6 gap-2 border border-white/20 rounded-full">
                        <div className="relative w-80 h-10 overflow-hidden">
                            <div className="absolute inset-0 flex items-center">
                                <div className="flex gap-1 wave-container">
                                    {Array.from({ length: 70 }, (_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-[#8B5CF6] rounded-full origin-center opacity-0 invisible"
                                            style={{
                                                height: "4px",
                                                animation: isRecording
                                                    ? `dotGrow 0.4s ease-out forwards`
                                                    : "none",
                                                animationDelay: `${i * 0.1}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <span className="text-white/90 text-sm tracking-wider">
                            {Math.floor(seconds / 60).toString().padStart(2, "0")}:
                            {(seconds % 60).toString().padStart(2, "0")}
                        </span>
                    </div>
                )}

                {/* Controls */}
                <div className="px-4 py-24 flex items-center gap-4 flex-1">
                    {(isRecording) && (
                        <Button
                            icon={<Trash2 size={22} />}
                            onClick={handleDelete}
                            variant="outline"
                            size="md"
                            radius="full"
                            className="p-4!"
                        />
                    )}

                    <Button
                        icon={!isRecording ? <Mic size={22} /> : <SendHorizonal size={22} />}
                        onClick={handleMainButton}
                        variant="primary"
                        size="md"
                        radius="full"
                        className="p-4!"
                    />
                </div>

                {/* Mode */}
                <div className="flex w-full justify-between gap-1.5 border border-gray-400 p-1.5 rounded-full">
                    <Button
                        text="Gửi bản ghi âm"
                        onClick={() => setSendMode("audio")}
                        variant={sendMode === "audio" ? "primary" : "outline"}
                        className="flex-1"
                        radius="full"
                        size="sm"
                        disabled={isRecording}
                    />
                    <Button
                        text="Gửi dạng văn bản"
                        onClick={() => setSendMode("text")}
                        variant={sendMode === "text" ? "primary" : "outline"}
                        className="flex-1"
                        radius="full"
                        size="sm"
                        disabled={isRecording}
                    />
                </div>

                {/* Close */}
                <Button
                    icon={<X size={16} />}
                    onClick={handleClose}
                    variant="outline"
                    className="absolute top-2 right-2 p-1!"
                    radius="full"
                    size="sm"
                />
            </div>
        </div>
    );
};
