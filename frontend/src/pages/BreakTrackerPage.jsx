import { useState, useEffect, useRef } from "react";
import Badge from "../components/ui/Badge";

const breakTypes = [
  { value: "LUNCH", label: "🍽 Lunch", duration: "30–60 min" },
  { value: "SHORT", label: "☕ Short Break", duration: "5–15 min" },
  { value: "PERSONAL", label: "🏠 Personal", duration: "Varies" },
];

const pastBreaks = [
  { id: 1, type: "LUNCH", start: "12:30 PM", end: "01:05 PM", duration: "35m" },
  { id: 2, type: "SHORT", start: "03:15 PM", end: "03:25 PM", duration: "10m" },
];

const BreakTrackerPage = () => {
  const [onBreak, setOnBreak] = useState(false);
  const [breakType, setBreakType] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (onBreak) {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [onBreak]);

  const startBreak = (type) => {
    setBreakType(type);
    setElapsed(0);
    setOnBreak(true);
  };

  const endBreak = () => {
    clearInterval(timerRef.current);
    setOnBreak(false);
    setBreakType("");
    setElapsed(0);
    // TODO: API call
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Break Tracker</h1>
        <p className="text-sm text-gray-400 mt-1">Track your breaks during work sessions</p>
      </div>

      {/* Break Cards */}
      {!onBreak ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {breakTypes.map((bt) => (
            <button
              key={bt.value}
              onClick={() => startBreak(bt.value)}
              className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-center
                hover:border-accent/50 hover:bg-dark-700 transition-all duration-300
                group"
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
        <div className="bg-dark-800 border border-accent/30 rounded-2xl p-8 text-center max-w-md mx-auto">
          <Badge variant="warning">On Break — {breakType}</Badge>
          <div className="text-5xl font-mono font-bold text-white mt-6">
            {formatTime(elapsed)}
          </div>
          <p className="text-sm text-gray-400 mt-2">Break started at {new Date().toLocaleTimeString()}</p>
          <button
            onClick={endBreak}
            className="mt-6 px-8 py-3 bg-accent hover:bg-accent-hover text-white font-semibold
              rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/25"
          >
            End Break
          </button>
        </div>
      )}

      {/* Past Breaks */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Today's Breaks</h3>
        <div className="space-y-3">
          {pastBreaks.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-700">
              <div className="flex items-center gap-3">
                <Badge variant={b.type === "LUNCH" ? "warning" : "info"}>{b.type}</Badge>
                <span className="text-sm text-gray-300">
                  {b.start} — {b.end}
                </span>
              </div>
              <span className="text-sm font-semibold text-white">{b.duration}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-dark-600 flex justify-between">
          <span className="text-sm text-gray-400">Total break time today</span>
          <span className="text-sm font-bold text-white">45m / 60m allowed</span>
        </div>
      </div>
    </div>
  );
};

export default BreakTrackerPage;
