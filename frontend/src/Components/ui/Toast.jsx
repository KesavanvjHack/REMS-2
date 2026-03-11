import { useState, useEffect } from "react";

const Toast = ({ message, type = "info", duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgMap = {
    success: "bg-green-500/10 border-green-500/50 text-green-400",
    error: "bg-red-500/10 border-red-500/50 text-red-400",
    info: "bg-accent/10 border-accent/50 text-accent",
  };

  const iconMap = {
    success: "✅",
    error: "❌",
    info: "📲",
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 
      rounded-2xl border ${bgMap[type]} shadow-2xl backdrop-blur-xl
      animate-in slide-in-from-right-10 fade-in duration-300`}>
      <span className="text-xl">{iconMap[type]}</span>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider opacity-60">
          {type === "info" ? "OTP Notification" : "Notice"}
        </div>
        <div className="text-sm font-semibold">{message}</div>
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
