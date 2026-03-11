import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const MainLayout = () => {
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const heartbeat = setInterval(async () => {
      try {
        await axiosInstance.post("sessions/heartbeat/");
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    }, 60000); // Every minute

    return () => clearInterval(heartbeat);
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen transition-all duration-300">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
