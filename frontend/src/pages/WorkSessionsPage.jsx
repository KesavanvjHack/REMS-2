import { useState, useEffect, useRef } from "react";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";

const WorkSessionsPage = () => {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPunchedIn) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPunchedIn]);

  const formatTime = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const togglePunch = () => {
    if (isPunchedIn) {
      clearInterval(timerRef.current);
      // TODO: API call to punch out
    } else {
      setElapsed(0);
      // TODO: API call to punch in
    }
    setIsPunchedIn(!isPunchedIn);
  };

  const todaySessions = [
    { id: 1, punchIn: "09:02 AM", punchOut: "01:00 PM", duration: "3h 58m", ip: "192.168.1.10", device: "Chrome / Windows" },
    { id: 2, punchIn: "02:05 PM", punchOut: "—", duration: "Running…", ip: "192.168.1.10", device: "Chrome / Windows" },
  ];

  const sessionColumns = [
    { key: "punchIn", label: "Punch In" },
    { key: "punchOut", label: "Punch Out" },
    { key: "duration", label: "Duration" },
    { key: "ip", label: "IP Address" },
    { key: "device", label: "Device" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Work Sessions</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your daily clock in/out</p>
      </div>

      {/* Punch Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 text-center max-w-lg mx-auto">
        {/* Timer ring */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#323a50" strokeWidth="8" />
            {isPunchedIn && (
              <circle
                cx="100" cy="100" r="90" fill="none"
                stroke="#6366f1" strokeWidth="8"
                strokeDasharray={`${(elapsed / 28800) * 565} 565`}
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

        {/* Status */}
        <div className="flex justify-center mb-6">
          <Badge variant={isPunchedIn ? "success" : "danger"}>
            {isPunchedIn ? "🟢 Clocked In" : "🔴 Clocked Out"}
          </Badge>
        </div>

        {/* Punch Button */}
        <button
          onClick={togglePunch}
          className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300
            hover:shadow-lg ${
              isPunchedIn
                ? "bg-red-500 hover:bg-red-600 text-white hover:shadow-red-500/25"
                : "bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/25"
            }`}
        >
          {isPunchedIn ? "⏹ Punch Out" : "▶ Punch In"}
        </button>
      </div>

      {/* Today's Sessions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Today's Sessions</h2>
        <DataTable columns={sessionColumns} data={todaySessions} emptyMessage="No sessions recorded today" />
      </div>
    </div>
  );
};

export default WorkSessionsPage;
