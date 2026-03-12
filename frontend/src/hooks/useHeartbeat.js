import { useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const useHeartbeat = (isIdle = false, intervalMinutes = 5) => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const sendHeartbeat = async () => {
      try {
        await axiosInstance.post('/sessions/heartbeat/', {
          status: isIdle ? 'idle' : 'working'
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up polling
    const interval = setInterval(sendHeartbeat, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [intervalMinutes, isIdle]);
};

export default useHeartbeat;
