import { useState, useEffect } from "react";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import axiosInstance from "../api/axiosInstance";

const ManagerReviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get("attendance/records/team_summary/");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch team summary", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCorrection = async () => {
      if (!selectedSnapshot) return;
      setSubmitting(true);
      try {
          await axiosInstance.patch(`monitoring/snapshots/${selectedSnapshot.id}/`, {
              remarks: remarks,
              correction_requested: true
          });
          setSelectedSnapshot(null);
          setRemarks("");
          fetchSummary();
      } catch (err) {
          alert("Failed to request correction");
      } finally {
          setSubmitting(false);
      }
  };

  const columns = [
    { key: "name", label: "Employee" },
    { key: "role", label: "Role" },
    { key: "score", label: "Latest Score", render: (v, row) => (
        <div className="flex items-center gap-2">
            <span className="font-bold">{v}%</span>
            {row.correction_requested && <Badge variant="warning">Refining</Badge>}
        </div>
    )},
    { 
      key: "actions", 
      label: "Feedback", 
      render: (_, row) => (
          <button 
            onClick={() => {
                setSelectedSnapshot(row.latest_snapshot);
                setRemarks(row.latest_snapshot?.remarks || "");
            }}
            className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
          >
            Review & Remark
          </button>
      ) 
    },
  ];

  if (loading) return <div className="py-20 text-center text-gray-400 animate-pulse font-bold tracking-widest uppercase text-xs">Accessing Team Core...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Team Review Console</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium italic">Operational oversight and performance adjustment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Direct Reports" value={data?.total_employees || 0} icon="👥" color="accent" />
        <StatCard title="Active Today" value={data?.present_today || 0} icon="🟢" color="success" />
        <StatCard title="Deployment Lags" value={data?.late_today || 0} icon="⏳" color="warning" />
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-[2rem] overflow-hidden shadow-2xl">
        <DataTable columns={columns} data={data?.team_details || []} emptyMessage="No team members localized." />
      </div>

      {selectedSnapshot && (
          <Modal title={`Performance Review: ${selectedSnapshot.user_name || 'Employee'}`} onClose={() => setSelectedSnapshot(null)}>
              <div className="space-y-4">
                  <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-600">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Managerial Remarks</p>
                      <textarea 
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Provide feedback or correction details..."
                        className="w-full h-32 bg-dark-900 border border-dark-600 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-accent resize-none font-medium"
                      />
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={handleRequestCorrection}
                        disabled={submitting}
                        className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20"
                      >
                        {submitting ? "Processing..." : "Submit Correction Request"}
                      </button>
                      <button 
                        onClick={() => setSelectedSnapshot(null)}
                        className="px-6 py-3 bg-dark-700 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default ManagerReviewPage;
