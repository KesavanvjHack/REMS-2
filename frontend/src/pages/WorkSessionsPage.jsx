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
  const timerRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await axiosInstance.get("attendance/records/");
    } catch (err) {
      console.error("Status fetch failed", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (isPunchedIn) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPunchedIn]);

  const togglePunch = async () => {
    setLoading(true);
    const action = isPunchedIn ? "out" : "in";
    try {
      const res = await axiosInstance.post("sessions/punch/", { action });
      setIsPunchedIn(!isPunchedIn);
      if (action === "in") {
          setCurrentSession(res.data);
          setElapsed(0);
      } else {
          setCurrentSession(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Punch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Work Sessions</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your daily clock in/out</p>
      </div>

      <SessionControls 
          isPunchedIn={isPunchedIn} 
          elapsed={elapsed} 
          loading={loading} 
          onToggle={togglePunch} 
      />
    </div>
  );
};

export default WorkSessionsPage;
