import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";

const MonitoringSuitePage = () => {
  const [plans, setPlans] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallMode, setWallMode] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchData();
    // Start polling for screenshots every 30 seconds
    pollRef.current = setInterval(fetchScreenshots, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        axiosInstance.get("monitoring/plans/"),
        axiosInstance.get("monitoring/screenshots/")
      ]);
      setPlans(pRes.data.results || pRes.data);
      setScreenshots(sRes.data.results || sRes.data);
    } catch (err) {
      console.error("Failed to fetch monitoring data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScreenshots = async () => {
      try {
          const res = await axiosInstance.get("monitoring/screenshots/");
          setScreenshots(res.data.results || res.data);
      } catch (err) {
          console.error("Polling failed", err);
      }
  };

  const renderScreenshotGrid = (isWall = false) => (
    <div className={`grid gap-4 ${isWall ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-8" : "grid-cols-2 md:grid-cols-4"}`}>
        {screenshots.map(s => (
        <div key={s.id} className="group relative aspect-video bg-dark-800 rounded-xl overflow-hidden border border-dark-600 hover:border-accent/50 transition-all shadow-lg">
            <img src={s.image} alt="User session" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-bold text-white capitalize">{s.username}</p>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Captured: {new Date(s.captured_at).toLocaleTimeString()}</p>
            </div>
        </div>
        ))}
        {screenshots.length === 0 && (
        <div className="col-span-full py-20 text-center bg-dark-800/50 rounded-2xl border border-dashed border-dark-600 text-gray-500 italic">
            No active sessions being monitored.
        </div>
        )}
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Monitoring Suite</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time oversight and policy management</p>
        </div>
        <button 
           onClick={() => setWallMode(true)}
           className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
        >
           <span>📺</span> Enter Wall Mode
        </button>
      </div>

      {/* Subscription Plans Section */}
      <section className="bg-dark-800/30 border border-dark-600 rounded-[2rem] p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full"></span>
            Monitoring Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-dark-800 border border-dark-600 p-8 rounded-3xl shadow-2xl flex flex-col items-center hover:border-accent/30 transition-all">
              <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-accent">${plan.price}</span>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">/ Month</span>
              </div>
              <ul className="text-sm text-gray-400 space-y-4 mb-8 w-full">
                <li className="flex justify-between items-center border-b border-dark-700 pb-2">
                    <span className="font-medium">Interval</span> 
                    <span className="text-white font-bold bg-dark-700 px-2 py-1 rounded-lg text-xs">{plan.screenshot_interval}m</span>
                </li>
                <li className="flex justify-between items-center">
                    <span className="font-medium">App Tracking</span> 
                    <span className={plan.features.apps ? "text-emerald-500" : "text-red-500"}>{plan.features.apps ? "✓ Enabled" : "✕ Disabled"}</span>
                </li>
                <li className="flex justify-between items-center">
                    <span className="font-medium">Web Tracking</span> 
                    <span className={plan.features.webs ? "text-emerald-500" : "text-red-500"}>{plan.features.webs ? "✓ Enabled" : "✕ Disabled"}</span>
                </li>
              </ul>
              <button className="w-full bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-xl font-bold transition-all border border-dark-600">Configure Deployment</button>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshot Gallery Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                Live Intelligence Feed
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Auto-refreshing every 30s
            </div>
        </div>
        {renderScreenshotGrid()}
      </section>

      {/* Wall Mode Overlay */}
      {wallMode && (
          <div className="fixed inset-0 z-[100] bg-dark-900 overflow-y-auto animate-in fade-in duration-300">
              <div className="sticky top-0 bg-dark-900/90 backdrop-blur-xl border-b border-dark-600 p-6 flex justify-between items-center z-10">
                  <div>
                      <h2 className="text-2xl font-black text-white tracking-tighter">LIVE MONITORING WALL</h2>
                      <p className="text-xs text-emerald-500 font-bold uppercase tracking-[0.3em]">Active Intelligence Surveillance</p>
                  </div>
                  <button 
                    onClick={() => setWallMode(false)}
                    className="bg-dark-700 hover:bg-red-500/20 text-white hover:text-red-500 px-6 py-2 rounded-xl text-sm font-bold transition-all border border-dark-600 hover:border-red-500/50"
                  >
                    Exit Wall Mode
                  </button>
              </div>
              {renderScreenshotGrid(true)}
          </div>
      )}
    </div>
  );
};

export default MonitoringSuitePage;
