import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

type ToastProps = {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
};

export const Toast = ({
  type,
  message,
  onClose,
  duration = 3000,
}: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    info: <AlertCircle size={20} className="text-blue-400" />,
  };

  const bgColors = {
    success: "bg-green-500/20 border-green-500/50",
    error: "bg-red-500/20 border-red-500/50",
    info: "bg-blue-500/20 border-blue-500/50",
  };

  return (
    <div
      className={`${bgColors[type]} backdrop-blur-md border rounded-xl p-4 shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}
    >
      {icons[type]}
      <p className="flex-1 text-white text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};
