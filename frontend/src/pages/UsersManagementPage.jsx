import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("auth/users/");
      setUsers(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      setImporting(true);
      try {
          const res = await axiosInstance.post("auth/bulk-import/", formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setImportResults(res.data);
          fetchUsers();
      } catch (err) {
          alert(err.response?.data?.error || "Import failed");
      } finally {
          setImporting(false);
      }
  };

  const columns = [
    { key: "username", label: "Username" },
    { key: "fullname", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (v) => <Badge variant="info">{v}</Badge> },
    { key: "department", label: "Dept" },
    { key: "is_active", label: "Status", render: (v) => <Badge variant={v ? 'success' : 'danger'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: "date_joined", label: "Joined", render: (v) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Identity & Access</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Enterprise directory and permission control</p>
        </div>
        <div className="flex gap-4">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".csv"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
                {importing ? "Processing..." : "📂 Bulk Import"}
            </button>
            <button className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20">
                + Add User
            </button>
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-[2rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse font-bold tracking-widest uppercase text-xs">Synchronizing Directory...</div>
        ) : (
          <DataTable columns={columns} data={users} emptyMessage="No users found in the directory." />
        )}
      </div>

      {importResults && (
          <Modal title="Import Results" onClose={() => setImportResults(null)}>
              <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-2xl">✅</span>
                      <div>
                          <p className="text-sm font-bold text-white">Import Complete</p>
                          <p className="text-xs text-emerald-400 font-medium">Successfully created {importResults.created} user accounts.</p>
                      </div>
                  </div>

                  {importResults.errors.length > 0 && (
                      <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Errors ({importResults.errors.length})</p>
                          <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                              {importResults.errors.map((err, i) => (
                                  <div key={i} className="p-3 bg-red-500/10 border border-red-500/10 rounded-lg text-[10px] flex justify-between gap-4">
                                      <span className="text-gray-400 font-bold truncate">Line: {err.row.username || "Unknown"}</span>
                                      <span className="text-red-400 font-medium">{err.error}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="pt-4 flex justify-end">
                      <button 
                        onClick={() => setImportResults(null)}
                        className="bg-dark-700 text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest"
                      >
                        Dismiss
                      </button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default UsersManagementPage;
