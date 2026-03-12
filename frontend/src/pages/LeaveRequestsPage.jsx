import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const LeaveRequestsPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    leave_type: "ANNUAL",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axiosInstance.get("attendance/leaves/");
      setLeaves(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.post("attendance/leaves/", form);
      setShowModal(false);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (id, level, status) => {
    const remarks = prompt(`Enter ${level} review remarks:`);
    if (remarks === null) return;
    
    try {
      const endpoint = level === 'Manager' ? 'approve_manager' : 'approve_hr';
      await axiosInstance.post(`attendance/leaves/${id}/${endpoint}/`, { status, remarks });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to review leave request");
    }
  };

  const StatusBadge = ({ v }) => (
    <Badge variant={v === 'APPROVED' ? 'success' : v === 'REJECTED' ? 'danger' : 'warning'}>
        {v}
    </Badge>
  );

  const columns = [
    { key: "created_at", label: "Date Applied", render: (v) => new Date(v).toLocaleDateString() },
    ...(role !== 'Employee' ? [{ key: "username", label: "Employee" }] : []),
    { key: "leave_type", label: "Type" },
    { key: "start_date", label: "Starts" },
    { key: "end_date", label: "Ends" },
    { 
      key: "manager_status", 
      label: "Manager", 
      render: (v) => <StatusBadge v={v} />
    },
    { 
        key: "hr_status", 
        label: "HR/Admin", 
        render: (v) => <StatusBadge v={v} />
    },
    { 
      key: "status", 
      label: "Final", 
      render: (v) => (
        <Badge variant={v === 'APPROVED' ? 'success' : v === 'REJECTED' ? 'danger' : 'warning'}>
          {v}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => {
        const isOwner = row.username === localStorage.getItem("username");
        if (role === 'Manager' && row.manager_status === 'PENDING' && !isOwner) {
            return (
                <div className="flex gap-2">
                    <button onClick={() => handleReview(row.id, 'Manager', 'APPROVED')} className="text-xs text-green-400 hover:underline">Approve</button>
                    <button onClick={() => handleReview(row.id, 'Manager', 'REJECTED')} className="text-xs text-red-400 hover:underline">Reject</button>
                </div>
            );
        }
        if (role === 'Admin' && row.hr_status === 'PENDING' && row.manager_status === 'APPROVED') {
            return (
                <div className="flex gap-2">
                   <button onClick={() => handleReview(row.id, 'HR', 'APPROVED')} className="text-xs text-green-400 hover:underline">Approve</button>
                   <button onClick={() => handleReview(row.id, 'HR', 'REJECTED')} className="text-xs text-red-400 hover:underline">Reject</button>
                </div>
            )
        }
        return <span className="text-xs text-gray-500 italic">No actions</span>
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Requests</h1>
          <p className="text-sm text-gray-400">Manage time-off and annual leaves</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-accent/20"
        >
          + Request Leave
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading requests...</div>
        ) : (
          <DataTable columns={columns} data={leaves} emptyMessage="No leave requests found." />
        )}
      </div>

      {showModal && (
        <Modal title="Apply for Leave" onClose={() => setShowModal(false)}>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Leave Type</label>
              <select 
                value={form.leave_type} 
                onChange={(e) => setForm({...form, leave_type: e.target.value})}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="ANNUAL">Annual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Start Date</label>
                <input 
                  type="date" required 
                  value={form.start_date} 
                  onChange={(e) => setForm({...form, start_date: e.target.value})}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">End Date</label>
                <input 
                  type="date" required 
                  value={form.end_date} 
                  onChange={(e) => setForm({...form, end_date: e.target.value})}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Reason</label>
              <textarea 
                required rows={3}
                value={form.reason} 
                onChange={(e) => setForm({...form, reason: e.target.value})}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
                placeholder="Explain the reason for leave..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LeaveRequestsPage;
