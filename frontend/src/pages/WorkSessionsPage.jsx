import { useState, useEffect, useRef } from "react";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import SessionControls from "../components/ui/SessionControls";
import axiosInstance from "../api/axiosInstance";

const WorkSessionsPage = () => {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const timerRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await axiosInstance.get("sessions/punch/");
      if (res.data.is_punched_in) {
        setIsPunchedIn(true);
        setCurrentSession(res.data.session);
        
        // Calculate elapsed time from start_time
        const start = new Date(res.data.session.start_time);
        const now = new Date();
        setElapsed(Math.floor((now - start) / 1000));
      } else {
        setIsPunchedIn(false);
        setCurrentSession(null);
        setElapsed(0);
      }
    } catch (err) {
      console.error("Status fetch failed", err);
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      // In a real app we might have a specific history endpoint
      // For now we'll use the record list
      const res = await axiosInstance.get("attendance/records/");
      setSessions(res.data.results || []);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, []);

  useEffect(() => {
    if (isPunchedIn) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPunchedIn]);

  const togglePunch = async () => {
    setLoading(true);
    const action = isPunchedIn ? "out" : "in";
    try {
      const res = await axiosInstance.post("sessions/punch/", { action });
      if (action === "in") {
        setIsPunchedIn(true);
        setCurrentSession(res.data);
        setElapsed(0);
      } else {
        setIsPunchedIn(false);
        setCurrentSession(null);
        setElapsed(0);
        fetchHistory(); // Refresh history after punch out
      }
    } catch (err) {
      alert(err.response?.data?.error || "Punch failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Sessions</h1>
          <p className="text-sm text-gray-400 mt-1">Track your daily working hours</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-lg border border-dark-600">
          <div className={`w-2 h-2 rounded-full ${isPunchedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            {isPunchedIn ? 'Active Session' : 'Offline'}
          </span>
        </div>
      </div>

      <SessionControls 
          isPunchedIn={isPunchedIn} 
          elapsed={elapsed} 
          loading={loading} 
          onToggle={togglePunch} 
      />

      {/* Session History */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-dark-600 flex justify-between items-center bg-dark-700/30">
          <h3 className="text-lg font-bold text-white">Recent Attendance Records</h3>
          <button onClick={fetchHistory} className="text-xs font-medium text-accent hover:underline">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-900/50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Work Hours</th>
                <th className="px-6 py-4">Late</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {sessions.length > 0 ? sessions.map((s, idx) => (
                <tr key={idx} className="hover:bg-dark-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">{s.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      s.status === 'PRESENT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">{s.total_work_hours || '0.00'} hrs</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${s.is_late ? 'text-orange-400' : 'text-gray-500'}`}>
                      {s.is_late ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkSessionsPage;
