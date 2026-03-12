import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";

const OrganizationsPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", theme_color: "#3b82f6" });
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("theme_color", formData.theme_color);
    if (logoFile) data.append("logo", logoFile);

    try {
        if (editingCompany) {
            await axiosInstance.patch(`org/companies/${editingCompany.id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            await axiosInstance.post("org/companies/", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        setEditingCompany(null);
        setShowCreate(false);
        setLogoFile(null);
        setFormData({ name: "", description: "", theme_color: "#3b82f6" });
        fetchCompanies();
    } catch (err) {
        alert("Failed to save organization branding");
    } finally {
        setSaving(false);
    }
  };

  const columns = [
    { 
      key: "logo", 
      label: "Brand", 
      render: (v) => v ? (
        <img src={v} className="w-8 h-8 rounded-lg object-contain bg-white/10" alt="logo" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-[10px] font-black">REMS</div>
      ) 
    },
    { key: "name", label: "Company Name" },
    { 
      key: "theme_color", 
      label: "Theme", 
      render: (v) => <div className="w-12 h-4 rounded-full border border-dark-500 shadow-sm" style={{ backgroundColor: v }}></div> 
    },
    { key: "created_at", label: "Onboarded", render: (v) => new Date(v).toLocaleDateString() },
    { 
      key: "actions", 
      label: "Control", 
      render: (_, row) => (
        <button 
          onClick={() => {
            setEditingCompany(row);
            setFormData({ name: row.name, description: row.description, theme_color: row.theme_color });
          }}
          className="text-[10px] font-black uppercase text-accent hover:underline tracking-widest"
        >
          Manage Brand
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Organization Cluster</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium italic">Manage enterprise identity and branding clusters</p>
        </div>
        <button 
          onClick={() => {
            setEditingCompany(null);
            setShowCreate(true);
            setFormData({ name: "", description: "", theme_color: "#3b82f6" });
            setLogoFile(null);
          }}
          className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20 transition-all active:scale-95"
        >
          + New Organization
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-[2rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse font-bold tracking-widest uppercase text-xs italic">Synchronizing Cluster Nodes...</div>
        ) : (
          <DataTable columns={columns} data={companies} emptyMessage="No organizations localized in this cluster." />
        )}
      </div>

      {(editingCompany || showCreate) && (
          <Modal title={editingCompany ? `Rebrand: ${editingCompany.name}` : "Onboard Organization"} onClose={() => { setEditingCompany(null); setShowCreate(false); }}>
              <form onSubmit={handleSave} className="space-y-5 py-2">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entity Name</label>
                          <input 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            placeholder="Enterprise Title"
                            className="bg-dark-900 border border-dark-600 rounded-xl p-3.5 text-xs text-white w-full focus:outline-none focus:border-accent transition-colors font-medium"
                          />
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Theme Accent</label>
                          <input 
                            type="color"
                            value={formData.theme_color}
                            onChange={(e) => setFormData({...formData, theme_color: e.target.value})}
                            className="bg-dark-900 border border-dark-600 rounded-xl h-[46px] w-full focus:outline-none p-1.5 cursor-pointer"
                          />
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand Identity (Logo)</label>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setLogoFile(e.target.files[0])}
                        accept="image/*"
                        className="bg-dark-900 border border-dark-600 rounded-xl p-2.5 text-xs text-white w-full file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-accent/20 file:text-accent file:cursor-pointer hover:file:bg-accent/30 transition-all font-medium"
                      />
                  </div>

                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Executive Summary</label>
                      <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Company mission and background..."
                        className="bg-dark-900 border border-dark-600 rounded-xl p-3.5 text-xs text-white w-full h-28 focus:outline-none focus:border-accent resize-none transition-colors font-medium leading-relaxed"
                      />
                  </div>

                  <div className="flex gap-4 pt-4">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-accent hover:bg-accent-hover text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/30 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {saving ? "Deploying Core..." : "Finalize Infrastructure"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setEditingCompany(null); setShowCreate(false); }}
                        className="px-8 py-4 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Abort
                      </button>
                  </div>
              </form>
          </Modal>
      )}
    </div>
  );
};

export default OrganizationsPage;
