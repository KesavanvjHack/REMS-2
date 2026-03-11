import StatCard from "../components/ui/StatCard";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";

const weeklyData = [
  { day: "Mon", hours: 8.2, productive: 7.5 },
  { day: "Tue", hours: 7.8, productive: 7.1 },
  { day: "Wed", hours: 8.5, productive: 8.0 },
  { day: "Thu", hours: 7.5, productive: 6.9 },
  { day: "Fri", hours: 8.0, productive: 7.3 },
];

const activityData = [
  { name: "Active", value: 75 },
  { name: "Idle", value: 15 },
  { name: "Break", value: 10 },
];

const COLORS = ["#22c55e", "#f59e0b", "#6366f1"];

const teamMembers = [
  { name: "Arun Kumar", status: "Active", hours: "7h 23m", avatar: "A" },
  { name: "Priya Sharma", status: "Idle", hours: "6h 15m", avatar: "P" },
  { name: "Ravi Patel", status: "Active", hours: "8h 01m", avatar: "R" },
  { name: "Meena S.", status: "Break", hours: "5h 45m", avatar: "M" },
  { name: "Vikram J.", status: "Offline", hours: "0h 00m", avatar: "V" },
];

const statusColor = {
  Active: "bg-green-500",
  Idle: "bg-amber-500",
  Break: "bg-blue-500",
  Offline: "bg-gray-500",
};

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
  const role = localStorage.getItem("role") || "Employee";
  const username = localStorage.getItem("username") || "User";

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
          title="Today's Hours"
          value="7h 23m"
          subtitle="Punched in at 9:02 AM"
          icon="⏰"
          trend="up"
          trendValue="12% vs yesterday"
          color="accent"
        />
        <StatCard
          title="Productive Time"
          value="6h 48m"
          subtitle="92% productivity"
          icon="🎯"
          trend="up"
          trendValue="5% vs avg"
          color="success"
        />
        <StatCard
          title="Break Time"
          value="35m"
          subtitle="1 of 60m used"
          icon="☕"
          color="warning"
        />
        <StatCard
          title="Idle Time"
          value="12m"
          subtitle="Under threshold"
          icon="💤"
          color="info"
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
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Today's Activity</h3>
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
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {activityData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {item.name} ({item.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Team Panel + Attendance Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members (for managers/admins) */}
        {(role === "Manager" || role === "Admin") && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Team Members</h3>
            <div className="space-y-3">
              {teamMembers.map((m) => (
                <div key={m.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.hours} today</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColor[m.status]}`} />
                    <span className="text-xs text-gray-400">{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Attendance Bar */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">This Week's Attendance</h3>
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
