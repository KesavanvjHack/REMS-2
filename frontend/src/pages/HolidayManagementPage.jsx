import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";

const HolidayManagementPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", description: "" });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await axiosInstance.get("attendance/holidays/");
      setHolidays(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("attendance/holidays/", form);
      setShowModal(false);
      fetchHolidays();
    } catch (err) {
      alert("Failed to add holiday");
    }
  };

  const columns = [
    { key: "date", label: "Date" },
    { key: "name", label: "Holiday Name" },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Holiday Calendar</h1>
          <p className="text-sm text-gray-400">Manage global company holidays</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Holiday
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading holidays...</div>
        ) : (
          <DataTable columns={columns} data={holidays} emptyMessage="No holidays configured." />
        )}
      </div>

      {showModal && (
        <Modal title="Add New Holiday" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Holiday Name</label>
              <input 
                type="text" required 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
              <input 
                type="date" required 
                value={form.date} 
                onChange={(e) => setForm({...form, date: e.target.value})}
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
              <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg text-sm font-bold">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HolidayManagementPage;
