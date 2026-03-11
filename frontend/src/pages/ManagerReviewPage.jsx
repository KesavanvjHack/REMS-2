import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";

const teamData = [
  { id: 1, name: "Arun Kumar", role: "Developer", status: "Active", todayHours: "7h 23m", weekHours: "38h 15m", idle: "12m", late: 0, productivity: 94 },
  { id: 2, name: "Priya Sharma", role: "Designer", status: "Idle", todayHours: "6h 15m", weekHours: "32h 40m", idle: "45m", late: 2, productivity: 78 },
  { id: 3, name: "Ravi Patel", role: "QA Engineer", status: "Active", todayHours: "8h 01m", weekHours: "40h 05m", idle: "8m", late: 0, productivity: 97 },
  { id: 4, name: "Meena S.", role: "Developer", status: "Break", todayHours: "5h 45m", weekHours: "29h 30m", idle: "22m", late: 1, productivity: 85 },
  { id: 5, name: "Vikram J.", role: "DevOps", status: "Offline", todayHours: "0h", weekHours: "34h 10m", idle: "0m", late: 0, productivity: 90 },
];

const statusBadge = (val) => {
  const map = { Active: "success", Idle: "warning", Break: "info", Offline: "danger" };
  return <Badge variant={map[val] || "default"}>{val}</Badge>;
};

const prodBar = (val) => (
  <div className="flex items-center gap-2">
    <div className="w-20 h-2 bg-dark-600 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${val}%`,
          backgroundColor: val >= 90 ? "#22c55e" : val >= 70 ? "#f59e0b" : "#ef4444",
        }}
      />
    </div>
    <span className="text-xs text-gray-400">{val}%</span>
  </div>
);

const columns = [
  {
    key: "name",
    label: "Employee",
    render: (val, row) => (
      <div>
        <div className="text-sm font-medium text-white">{val}</div>
        <div className="text-xs text-gray-400">{row.role}</div>
      </div>
    ),
  },
  { key: "status", label: "Status", render: statusBadge },
  { key: "todayHours", label: "Today" },
  { key: "weekHours", label: "This Week" },
  { key: "idle", label: "Idle Time" },
  { key: "late", label: "Late (Month)" },
  { key: "productivity", label: "Productivity", render: prodBar },
];

const ManagerReviewPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Review</h1>
        <p className="text-sm text-gray-400 mt-1">Monitor your team's attendance and productivity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Team Size" value="5" icon="👥" color="accent" />
        <StatCard title="Active Now" value="2" subtitle="Online working" icon="🟢" color="success" />
        <StatCard title="Avg Productivity" value="89%" trend="up" trendValue="3% vs last week" icon="📊" color="info" />
        <StatCard title="Late Arrivals" value="3" subtitle="This month" icon="⏳" color="warning" />
      </div>

      <DataTable columns={columns} data={teamData} emptyMessage="No team members found" />
    </div>
  );
};

export default ManagerReviewPage;
