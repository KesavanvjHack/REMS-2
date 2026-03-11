import { useState } from "react";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";

const mockAttendance = [
  { id: 1, date: "2026-03-11", punchIn: "09:02 AM", punchOut: "06:15 PM", gross: "9h 13m", productive: "8h 30m", idle: "18m", status: "PRESENT", late: false },
  { id: 2, date: "2026-03-10", punchIn: "09:18 AM", punchOut: "06:00 PM", gross: "8h 42m", productive: "7h 55m", idle: "22m", status: "PRESENT", late: true },
  { id: 3, date: "2026-03-09", punchIn: "—", punchOut: "—", gross: "0h", productive: "0h", idle: "0h", status: "ABSENT", late: false },
  { id: 4, date: "2026-03-08", punchIn: "08:55 AM", punchOut: "01:10 PM", gross: "4h 15m", productive: "3h 50m", idle: "10m", status: "HALF_DAY", late: false },
  { id: 5, date: "2026-03-07", punchIn: "—", punchOut: "—", gross: "0h", productive: "0h", idle: "0h", status: "ON_LEAVE", late: false },
];

const statusBadge = (val) => {
  const map = {
    PRESENT: "success",
    ABSENT: "danger",
    HALF_DAY: "warning",
    ON_LEAVE: "info",
    HOLIDAY: "accent",
  };
  return <Badge variant={map[val] || "default"}>{val.replace("_", " ")}</Badge>;
};

const columns = [
  { key: "date", label: "Date" },
  { key: "punchIn", label: "Punch In" },
  { key: "punchOut", label: "Punch Out" },
  { key: "gross", label: "Gross Hours" },
  { key: "productive", label: "Productive" },
  { key: "idle", label: "Idle" },
  { key: "status", label: "Status", render: statusBadge },
  {
    key: "late",
    label: "Late",
    render: (val) => val ? <Badge variant="warning">Late</Badge> : <span className="text-gray-500">—</span>,
  },
];

const AttendancePage = () => {
  const [dateRange, setDateRange] = useState("week");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-sm text-gray-400 mt-1">Your daily attendance records</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-300
            focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present Days" value="18" subtitle="This month" icon="✅" color="success" />
        <StatCard title="Absent Days" value="2" subtitle="This month" icon="❌" color="danger" />
        <StatCard title="Late Arrivals" value="3" subtitle="This month" icon="⏳" color="warning" />
        <StatCard title="Avg. Hours" value="8.1h" subtitle="Daily average" icon="📊" color="accent" />
      </div>

      {/* Attendance Table */}
      <DataTable columns={columns} data={mockAttendance} emptyMessage="No attendance records found" />
    </div>
  );
};

export default AttendancePage;
