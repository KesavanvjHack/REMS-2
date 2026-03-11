import { useState, useEffect } from "react";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import FilterBar from "../components/ui/FilterBar";
import axiosInstance from "../api/axiosInstance";

const statusBadge = (val) => {
  const map = {
    PRESENT: "success",
    ABSENT: "danger",
    HALF_DAY: "warning",
    ON_LEAVE: "info",
    HOLIDAY: "accent",
  };
  return <Badge variant={map[val] || "default"}>{val?.replace("_", " ")}</Badge>;
};

const columns = [
  { key: "date", label: "Date" },
  { key: "status", label: "Status", render: statusBadge },
  { key: "total_work_hours", label: "Gross Hours", render: (v) => `${v}h` },
  { key: "net_work_hours", label: "Productive", render: (v) => `${v}h` },
  { key: "total_idle_hours", label: "Idle", render: (v) => `${v}h` },
  {
    key: "is_late",
    label: "Late",
    render: (val) => val ? <Badge variant="warning">Late</Badge> : <span className="text-gray-500">—</span>,
  },
];

const AttendancePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("attendance/records/");
      setData(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = statusFilter === "all" 
    ? data 
    : data.filter(d => d.status === statusFilter);

  const filters = [
    {
      name: "status",
      type: "select",
      value: statusFilter,
      options: [
        { label: "All Status", value: "all" },
        { label: "Present", value: "PRESENT" },
        { label: "Absent", value: "ABSENT" },
        { label: "Half Day", value: "HALF_DAY" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance History</h1>
          <p className="text-sm text-gray-400 mt-1">Your daily attendance records</p>
        </div>
        <FilterBar filters={filters} onFilterChange={(name, val) => setStatusFilter(val)} />
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading records...</div>
      ) : (
        <DataTable columns={columns} data={filteredData} emptyMessage="No attendance records found" />
      )}
    </div>
  );
};

export default AttendancePage;
