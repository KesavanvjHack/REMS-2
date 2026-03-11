import { useState, useEffect, useRef } from "react";
import Badge from "../components/ui/Badge";
import BreakTracker from "../components/ui/BreakTracker";
import axiosInstance from "../api/axiosInstance";

const BreakTrackerPage = () => {
  const [onBreak, setOnBreak] = useState(false);
  const [breakType, setBreakType] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeBreak, setActiveBreak] = useState(null);
  const [pastBreaks, setPastBreaks] = useState([]);
  const timerRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await axiosInstance.get("sessions/break/");
      if (res.data.on_break) {
        setOnBreak(true);
        setActiveBreak(res.data.break);
        setBreakType(res.data.break.break_type);
        
        const start = new Date(res.data.break.start_time);
        const now = new Date();
        setElapsed(Math.floor((now - start) / 1000));
      }
    } catch (err) {
      console.error("Break status fetch failed", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (onBreak) {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [onBreak]);

  const startBreak = async (type) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("sessions/break/", { action: "start", break_type: type });
      setActiveBreak(res.data);
      setBreakType(type);
      setElapsed(0);
      setOnBreak(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to start break. Ensure you are punched in.");
    } finally {
      setLoading(false);
    }
  };

  const endBreak = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("sessions/break/", { action: "stop" });
      setOnBreak(false);
      setBreakType("");
      setElapsed(0);
      setActiveBreak(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to stop break.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Break Tracker</h1>
        <p className="text-sm text-gray-400 mt-1">Track your breaks during work sessions</p>
      </div>

      <BreakTracker 
        onBreak={onBreak} 
        breakType={breakType} 
        elapsed={elapsed} 
        loading={loading} 
        onStart={startBreak} 
        onEnd={endBreak} 
      />

      {/* Past Breaks Section */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Daily Break Summary</h3>
        <div className="space-y-3">
          {pastBreaks.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No breaks recorded today yet.</p>
          ) : (
            pastBreaks.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-700">
                <div className="flex items-center gap-3">
                  <Badge variant={b.type === "LUNCH" ? "warning" : "info"}>{b.type}</Badge>
                  <span className="text-sm text-gray-300">
                    {b.start} — {b.end}
                  </span>
                </div>
                <span className="text-sm font-semibold text-white">{b.duration}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakTrackerPage;
