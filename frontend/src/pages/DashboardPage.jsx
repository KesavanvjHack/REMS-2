import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from "recharts";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("userRole");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, prodRes] = await Promise.all([
          axiosInstance.get("reports/dashboard-stats/"),
          axiosInstance.get("monitoring/productivity/")
        ]);
        setStats(statsRes.data);
        setProductivity(prodRes.data);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      <p className="text-gray-400 font-medium animate-pulse">Synchronizing Enterprise Intelligence...</p>
    </div>
  );

  if (!stats) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-white mb-2">Data Synchronization Error</h2>
      <p className="text-gray-400 max-w-md">We were unable to retrieve your performance statistics. Please try refreshing the page or check your connectivity.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dark-800/50 p-8 rounded-[2rem] border border-dark-600 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="text-accent underline decoration-accent/20 underline-offset-8">{username}</span>
          </h1>
          <p className="text-gray-400 text-lg mt-2 font-medium">
            {role === 'Admin' ? 'System Administrator Console' : role === 'Manager' ? 'Operational Oversight Dashboard' : 'Personal Performance Overview'}
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-dark-900/50 px-6 py-4 rounded-2xl border border-dark-600 shadow-2xl backdrop-blur-md">
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Network Status</span>
              <span className="text-sm font-bold text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Feed Active
              </span>
           </div>
           <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-xl">🌐</div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Productivity Score (Focus of Module 10) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-accent to-purple-600 p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(6,182,212,0.4)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-2">Efficiency Rating</p>
              <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums">
                {productivity?.overall_score || 0}<span className="text-3xl opacity-50 ml-1">%</span>
              </h2>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-white/80">
                  <span className="uppercase tracking-wider">Attendance Integrity</span>
                  <span>{productivity?.breakdown?.attendance || 0}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden backdrop-blur-md">
                  <div className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" style={{ width: `${productivity?.breakdown?.attendance || 0}%` }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-white/80">
                  <span className="uppercase tracking-wider">Task Velocity</span>
                  <span>{productivity?.breakdown?.tasks || 0}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden backdrop-blur-md">
                  <div className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" style={{ width: `${productivity?.breakdown?.tasks || 0}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 py-3 px-4 bg-white/5 rounded-2xl border border-white/10">
               <span className="text-2xl">🏆</span>
               <p className="text-xs font-bold text-white leading-tight">
                  {productivity?.overall_score > 85 ? "Optimal performance achieved today." : "Steady progress. Aim for 90% velocity."}
               </p>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 text-[12rem] font-black italic text-white/5 select-none pointer-events-none transition-transform group-hover:scale-110 duration-700">
            {productivity?.overall_score > 80 ? "A" : "B"}
          </div>
        </div>

        {/* Quick Insights Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title="Session" value={stats.status} icon="⏱️" color="cyan" detail="Current Status" />
          <StatCard title="Leaves" value={stats.total_leaves} icon="📄" color="indigo" detail="Total Balance" />
          <StatCard title="Tasks" value={stats.pending_tasks || 0} icon="✅" color="amber" detail="Pending Action" />
          
          {role !== 'Employee' ? (
            <>
              <StatCard title="Team" value={stats.total_users} icon="👥" color="emerald" detail="Online Now" />
              <StatCard title="Compliance" value="96.4%" icon="🛡️" color="rose" detail="Policy Score" />
              <StatCard title="Alerts" value={stats.idle_alerts || 0} icon="⚠️" color="yellow" detail="System Flags" />
            </>
          ) : (
            <>
              <StatCard title="Projects" value="4 Active" icon="📁" color="emerald" detail="Assigned" />
              <StatCard title="Ranking" value="#12" icon="🏅" color="blue" detail="Team Standing" />
              <StatCard title="Work Hours" value="168h" icon="📊" color="purple" detail="Current Month" />
            </>
          )}
        </div>
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-12">
        
        {/* Area Chart: Work Trends */}
        <div className="xl:col-span-2 bg-dark-800 p-8 rounded-[2.5rem] border border-dark-600 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Work Intensity Over Time</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">7-Day Analysis Feed</p>
            </div>
            <div className="flex gap-2">
               <button className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-lg border border-accent/20">WEEKLY</button>
               <button className="px-3 py-1 bg-dark-700 text-gray-500 text-[10px] font-bold rounded-lg border border-dark-600">MONTHLY</button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chart_data}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="day" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }}
                  itemStyle={{ color: "#06b6d4", fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{ color: "#A3A3A3", fontSize: "10px", marginBottom: "4px" }}
                />
                <Area type="monotone" dataKey="hours" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Task Distribution */}
        <div className="xl:col-span-1 bg-dark-800 p-8 rounded-[2.5rem] border border-dark-600 shadow-2xl">
          <h3 className="text-xl font-bold text-white">Operations Load</h3>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1 mb-8">Pending vs Completed</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="day" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "16px" }}
                />
                <Bar dataKey="tasks" fill="#818cf8" radius={[8, 8, 8, 8]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, detail }) => (
  <div className="group bg-dark-800/40 backdrop-blur-lg p-6 rounded-3xl border border-dark-600 transition-all duration-300 hover:scale-[1.03] hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 overflow-hidden relative">
    <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-2" style={{ backgroundColor: `var(--accent-color, #06b6d4)` }} />
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:rotate-12 duration-500 bg-white/5 border border-white/10`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{detail}</span>
      </div>
      <div className="mt-8">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">{title}</p>
        <p className="text-2xl font-black text-white mt-2 tracking-tight group-hover:text-accent transition-colors">{value}</p>
      </div>
    </div>
    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-accent/5 rounded-full blur-2xl transition-all group-hover:scale-150" />
  </div>
);

export default DashboardPage;
