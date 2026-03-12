import { useState, useEffect } from "react";
import StatCard from "../components/ui/StatCard";
import ExportButton from "../components/ui/ExportButton";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import axiosInstance from "../api/axiosInstance";
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

const columns = [
  { key: "name", label: "Employee" },
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "late", label: "Late" },
  { 
    key: "avgHours", 
    label: "Avg Hours", 
    render: (val) => `${Number(val).toFixed(1)}h`
  },
];

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosInstance.get("attendance/records/team_summary/");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleExport = () => {
    if (!data) return;
    const headers = ["Employee", "Present", "Absent", "Late", "Avg Hours"];
    const rows = data.team_details.map(t => [t.name, t.present, t.absent, t.late, Number(t.avgHours).toFixed(1)]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rems_report.csv";
    a.click();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Generating reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Attendance and productivity analytics</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <ExportButton label="Export PDF" onExport={handlePrintPDF} />
          <ExportButton label="Export CSV" onExport={handleExport} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data?.total_employees || 0} icon="👥" color="accent" />
        <StatCard title="Present Today" value={data?.present_today || 0} icon="🟢" color="success" />
        <StatCard title="Late Today" value={data?.late_today || 0} icon="⏳" color="warning" />
      </div>

      {/* Detail Table */}
      <DataTable columns={columns} data={data?.team_details || []} emptyMessage="No report data" />
    </div>
  );
};

export default ReportsPage;
