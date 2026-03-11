import Badge from "./Badge";

const formatTime = (totalSec) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const SessionControls = ({ isPunchedIn, elapsed, loading, onToggle }) => {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xl">
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#1e2231" strokeWidth="8" />
          {isPunchedIn && (
            <circle
              cx="100" cy="100" r="90" fill="none"
              stroke="#6366f1" strokeWidth="8"
              strokeDasharray="565"
              strokeDashoffset={565 - (Math.min(elapsed, 28800) / 28800) * 565}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold text-white">{formatTime(elapsed)}</span>
          <span className="text-xs text-gray-400 mt-1">
            {isPunchedIn ? "Working…" : "Not clocked in"}
          </span>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <Badge variant={isPunchedIn ? "success" : "danger"}>
          {isPunchedIn ? "🟢 Clocked In" : "🔴 Clocked Out"}
        </Badge>
      </div>

      <button
        onClick={onToggle}
        disabled={loading}
        className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300
          hover:shadow-lg disabled:opacity-50 ${
            isPunchedIn
              ? "bg-red-500 hover:bg-red-600 text-white hover:shadow-red-500/25"
              : "bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/25"
          }`}
      >
        {loading ? "Processing..." : isPunchedIn ? "⏹ Punch Out" : "▶ Punch In"}
      </button>
    </div>
  );
};

export default SessionControls;
