import { useState, useEffect } from "react";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import axiosInstance from "../api/axiosInstance";

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosInstance.get("audit/");
        setLogs(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    { key: "created_at", label: "Timestamp", render: (v) => new Date(v).toLocaleString() },
    { key: "username", label: "User" },
    { key: "module", label: "Module" },
    { 
      key: "action", 
      label: "Action", 
      render: (v) => {
        const isMutation = v.includes('POST') || v.includes('PUT') || v.includes('PATCH') || v.includes('DELETE');
        return (
          <Badge variant={isMutation ? "warning" : "info"}>
            {v}
          </Badge>
        );
      } 
    },
    { key: "ip_address", label: "IP Address" },
    { key: "description", label: "Details" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Audit Logs</h1>
        <p className="text-sm text-gray-400 mt-1">Track all critical system activities and logins</p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading audit trail...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={logs} 
            emptyMessage="No audit logs recorded yet." 
          />
        )}
      </div>
    </div>
  );
};

export default AuditPage;
