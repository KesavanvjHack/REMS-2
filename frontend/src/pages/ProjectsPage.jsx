import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", start_date: "", manager: "" });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("tasks/projects/");
      setProjects(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("tasks/projects/", form);
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      alert("Failed to create project");
    }
  };

  const columns = [
    { key: "name", label: "Project Name" },
    { key: "manager_name", label: "Manager" },
    { key: "status", label: "Status", render: (v) => <Badge variant="info">{v}</Badge> },
    { key: "budget", label: "Budget", render: (v) => v ? `$${parseFloat(v).toLocaleString()}` : "$0" },
    { key: "allocated_budget", label: "Allocated", render: (v) => v ? `$${parseFloat(v).toLocaleString()}` : "$0" },
    { key: "completion_percentage", label: "Progress", render: (v) => `${v}%` },
    { key: "start_date", label: "Start Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Management</h1>
          <p className="text-sm text-gray-400">Track high-level enterprise projects</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + New Project
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading projects...</div>
        ) : (
          <DataTable columns={columns} data={projects} emptyMessage="No projects found." />
        )}
      </div>

      {showModal && (
        <Modal title="Create New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Project Name</label>
              <input 
                type="text" required 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
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
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg text-sm font-bold">Create</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsPage;
