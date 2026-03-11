import { useState, useEffect } from "react";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";
import axiosInstance from "../api/axiosInstance";

const statusBadge = (val) => {
  const map = { PRESENT: "success", ABSENT: "danger", LATE: "warning" };
  return <Badge variant={map[val] || "default"}>{val}</Badge>;
};

const columns = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "present", label: "Present (30d)" },
  { key: "absent", label: "Absent (30d)" },
  { key: "late", label: "Late (30d)" },
  { 
    key: "avgHours", 
    label: "Avg Hours", 
    render: (val) => `${Number(val).toFixed(1)}h` 
  },
];

const ManagerReviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("records/team_summary/");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch team summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading team data...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Review</h1>
        <p className="text-sm text-gray-400 mt-1">Monitor your team's attendance and productivity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data?.total_employees || 0} icon="👥" color="accent" />
        <StatCard title="Present Today" value={data?.present_today || 0} icon="🟢" color="success" />
        <StatCard title="Late Today" value={data?.late_today || 0} icon="⏳" color="warning" />
      </div>

      <DataTable columns={columns} data={data?.team_details || []} emptyMessage="No team members found" />
    </div>
  );
};

export default ManagerReviewPage;
