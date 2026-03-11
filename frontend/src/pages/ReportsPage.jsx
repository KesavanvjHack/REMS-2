import { useState } from "react";
import StatCard from "../components/ui/StatCard";
import ExportButton from "../components/ui/ExportButton";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line,
} from "recharts";

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#1e2231",
    border: "1px solid #323a50",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#e5e7eb",
  },
};

const monthlyData = [
  { week: "Week 1", avgHours: 7.8, attendance: 95, idle: 8 },
  { week: "Week 2", avgHours: 8.2, attendance: 98, idle: 5 },
  { week: "Week 3", avgHours: 7.5, attendance: 90, idle: 12 },
  { week: "Week 4", avgHours: 8.0, attendance: 96, idle: 7 },
];

const reportData = [
  { id: 1, name: "Arun Kumar", present: 20, absent: 1, late: 1, avgHours: "8.1h", productivity: "94%", status: "Good" },
  { id: 2, name: "Priya Sharma", present: 18, absent: 3, late: 3, avgHours: "7.2h", productivity: "78%", status: "Needs Review" },
  { id: 3, name: "Ravi Patel", present: 21, absent: 0, late: 0, avgHours: "8.4h", productivity: "97%", status: "Excellent" },
  { id: 4, name: "Meena S.", present: 19, absent: 2, late: 2, avgHours: "7.6h", productivity: "85%", status: "Good" },
];

const statusBadge = (val) => {
  const map = { Excellent: "success", Good: "info", "Needs Review": "warning" };
  return <Badge variant={map[val] || "default"}>{val}</Badge>;
};

const columns = [
  { key: "name", label: "Employee" },
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "late", label: "Late" },
  { key: "avgHours", label: "Avg Hours" },
  { key: "productivity", label: "Productivity" },
  { key: "status", label: "Rating", render: statusBadge },
];

const ReportsPage = () => {
  const [reportType, setReportType] = useState("monthly");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Attendance and productivity analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-300
              focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <ExportButton label="Export CSV" onExport={() => alert("Exporting CSV…")} />
          <ExportButton label="Export PDF" onExport={() => alert("Exporting PDF…")} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Attendance" value="95%" trend="up" trendValue="2% vs last month" icon="📅" color="success" />
        <StatCard title="Avg Hours/Day" value="7.9h" icon="⏰" color="accent" />
        <StatCard title="Total Late" value="6" subtitle="Across team" icon="⏳" color="warning" />
        <StatCard title="Avg Idle" value="8%" trend="down" trendValue="3% improvement" icon="💤" color="info" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Average Working Hours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#323a50" />
              <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="avgHours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Attendance Rate & Idle %</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#323a50" />
              <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Line type="monotone" dataKey="attendance" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
              <Line type="monotone" dataKey="idle" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail Table */}
      <DataTable columns={columns} data={reportData} emptyMessage="No report data" />
    </div>
  );
};

export default ReportsPage;
