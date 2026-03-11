import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AdminPolicyPage = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await axiosInstance.get("policies/current/");
        setPolicy(res.data);
      } catch (err) {
        console.error("Failed to fetch policy", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleChange = (key, value) => {
    setPolicy({ ...policy, [key]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put("policies/current/", policy);
      setPolicy(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Failed to save policy");
    }
  };

  const fields = [
    { key: "shift_start", label: "Shift Start Time", type: "time", icon: "🕘" },
    { key: "shift_end", label: "Shift End Time", type: "time", icon: "🕕" },
    { key: "grace_period", label: "Grace Period (minutes)", type: "number", icon: "⏱" },
    { key: "min_full_day", label: "Min Hours — Full Day", type: "number", icon: "📅" },
    { key: "min_half_day", label: "Min Hours — Half Day", type: "number", icon: "🌗" },
    { key: "max_idle_minutes", label: "Max Idle Time (minutes)", type: "number", icon: "💤" },
    { key: "allowed_break_minutes", label: "Allowed Break (minutes)", type: "number", icon: "☕" },
  ];

  if (loading) return <div className="py-20 text-center text-gray-400">Loading policy...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Attendance Policies</h1>
        <p className="text-sm text-gray-400 mt-1">Configure attendance rules and thresholds</p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-white mb-6">Global Policy</h2>

        <div className="space-y-5">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-4">
              <span className="text-2xl w-10 text-center">{f.icon}</span>
              <label className="flex-1 text-sm font-medium text-gray-300">{f.label}</label>
              <input
                type={f.type}
                value={policy[f.key] || ""}
                onChange={(e) =>
                  handleChange(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                }
                className="w-32 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2
                  text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-accent/50
                  transition-all duration-200"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-dark-600">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold
              rounded-lg transition-all duration-200 text-sm hover:shadow-lg hover:shadow-accent/25"
          >
            Save Policy
          </button>
          {saved && (
            <span className="text-sm text-green-400 animate-pulse">✓ Policy saved successfully</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPolicyPage;
