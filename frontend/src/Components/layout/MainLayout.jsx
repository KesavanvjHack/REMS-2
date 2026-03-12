import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useIdle from "../../hooks/useIdle";
import useHeartbeat from "../../hooks/useHeartbeat";

const MainLayout = () => {
  const token = localStorage.getItem("token");
  
  // Enterprise Hardening: Automatic Activity Tracking
  const isIdle = useIdle(5); // 5 minutes threshold
  useHeartbeat(isIdle, 1);   // 1 minute polling

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
