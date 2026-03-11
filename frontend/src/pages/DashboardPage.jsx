import { useState, useEffect } from "react";
import StatCard from "../components/ui/StatCard";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import axiosInstance from "../api/axiosInstance";

const COLORS = ["#22c55e", "#f59e0b", "#6366f1"];

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#1e2231",
    border: "1px solid #323a50",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#e5e7eb",
  },
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [teamSummary, setTeamSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("userRole") || "Employee";
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, teamRes] = await Promise.all([
          axiosInstance.get("reports/summary/"),
          (role === "Admin" || role === "Manager") 
            ? axiosInstance.get("records/team_summary/") 
            : Promise.resolve({ data: null })
        ]);
        setStats(statsRes.data);
        setTeamSummary(teamRes.data);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  const weeklyData = stats?.weekly_trend || [
    { day: "Mon", hours: 0, productive: 0 },
    { day: "Tue", hours: 0, productive: 0 },
    { day: "Wed", hours: 0, productive: 0 },
    { day: "Thu", hours: 0, productive: 0 },
    { day: "Fri", hours: 0, productive: 0 },
  ];

  const activityData = [
    { name: "Active", value: stats?.activity_breakdown?.active || 100 },
    { name: "Idle", value: stats?.activity_breakdown?.idle || 0 },
    { name: "Break", value: stats?.activity_breakdown?.break || 0 },
  ];

  if (loading) return <div className="py-20 text-center text-gray-400">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {username} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Present Days"
          value={stats?.total_present || 0}
          subtitle="This month"
          icon="✅"
          color="success"
        />
        <StatCard
          title="Absent Days"
          value={stats?.total_absent || 0}
          subtitle="This month"
          icon="❌"
          color="danger"
        />
        <StatCard
          title="Late Arrivals"
          value={stats?.total_late || 0}
          subtitle="This month"
          icon="⏳"
          color="warning"
        />
        <StatCard
          title="Avg. Hours"
          value={`${Number(stats?.avg_working_hours || 0).toFixed(1)}h`}
          subtitle="Daily working"
          icon="📊"
          color="accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Hours Chart */}
        <div className="lg:col-span-2 bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Weekly Working Hours</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#323a50" />
              <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="hours" stroke="#6366f1" fill="url(#colorHours)" strokeWidth={2} />
              <Area type="monotone" dataKey="productive" stroke="#22c55e" fill="url(#colorProd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {activityData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {activityData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {item.name} ({item.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Team Panel + Attendance Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members (for managers/admins) */}
        {(role === "Manager" || role === "Admin") && teamSummary && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Team Summary (Last 30 Days)</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {teamSummary.team_details.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white">{m.present} Days Present</div>
                    <div className="text-[10px] text-gray-500">{Number(m.avgHours).toFixed(1)}h avg</div>
                  </div>
                </div>
              ))}
              {teamSummary.team_details.length === 0 && (
                <p className="text-sm text-gray-500 italic">No team data available.</p>
              )}
            </div>
          </div>
        )}

        {/* Weekly Attendance Bar */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#323a50" />
              <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="productive" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
