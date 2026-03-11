import Badge from "./Badge";

const breakTypes = [
  { value: "LUNCH", label: "🍽 Lunch", duration: "30–60 min" },
  { value: "SHORT", label: "☕ Short Break", duration: "5–15 min" },
  { value: "PERSONAL", label: "🏠 Personal", duration: "Varies" },
];

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const BreakTracker = ({ onBreak, breakType, elapsed, loading, onStart, onEnd }) => {
  return (
    <div className="space-y-6">
      {!onBreak ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {breakTypes.map((bt) => (
            <button
              key={bt.value}
              onClick={() => onStart(bt.value)}
              disabled={loading}
              className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-center
                hover:border-accent/50 hover:bg-dark-700 transition-all duration-300
                group disabled:opacity-50"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300 inline-block">
                {bt.label.split(" ")[0]}
              </span>
              <h3 className="text-sm font-semibold text-white mt-3">
                {bt.label.split(" ").slice(1).join(" ")}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{bt.duration}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-dark-800 border border-accent/30 rounded-2xl p-8 text-center max-w-md mx-auto shadow-2xl">
          <Badge variant="warning">On Break — {breakType}</Badge>
          <div className="text-5xl font-mono font-bold text-white mt-6">
            {formatTime(elapsed)}
          </div>
          <p className="text-sm text-gray-400 mt-2 italic">Taking a well-deserved break...</p>
          <button
            onClick={onEnd}
            disabled={loading}
            className="mt-6 px-8 py-3 bg-accent hover:bg-accent-hover text-white font-semibold
              rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50"
          >
            {loading ? "Closing..." : "End Break"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BreakTracker;
