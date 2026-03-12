import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const OrganizationsPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", registration_id: "", address: "", contact_email: "" });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get("org/companies/");
      setCompanies(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch companies", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("org/companies/", form);
      setShowModal(false);
      fetchCompanies();
    } catch (err) {
      alert("Failed to create company");
    }
  };

  const columns = [
    { key: "name", label: "Company Name" },
    { key: "registration_id", label: "Reg ID" },
    { key: "contact_email", label: "Email" },
    { key: "created_at", label: "Registered On", render: (v) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Organization Management</h1>
          <p className="text-sm text-gray-400">Manage companies and departments (Module 4)</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Company
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading organizations...</div>
        ) : (
          <DataTable columns={columns} data={companies} emptyMessage="No companies registered." />
        )}
      </div>

      {showModal && (
        <Modal title="Add New Company" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Company Name</label>
              <input type="text" required className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
                value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Registration ID</label>
              <input type="text" required className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
                value={form.registration_id} onChange={(e) => setForm({...form, registration_id: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input type="email" required className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
                value={form.contact_email} onChange={(e) => setForm({...form, contact_email: e.target.value})} />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg text-sm font-bold">Register Company</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default OrganizationsPage;
