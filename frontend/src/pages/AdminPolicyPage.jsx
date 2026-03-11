import { useState } from "react";

const defaultPolicy = {
  shiftStart: "09:00",
  shiftEnd: "18:00",
  gracePeriod: 15,
  minFullDay: 8,
  minHalfDay: 4,
  maxIdle: 30,
  breakDuration: 60,
};

const AdminPolicyPage = () => {
  const [policy, setPolicy] = useState(defaultPolicy);
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setPolicy({ ...policy, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: API call
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { key: "shiftStart", label: "Shift Start Time", type: "time", icon: "🕘" },
    { key: "shiftEnd", label: "Shift End Time", type: "time", icon: "🕕" },
    { key: "gracePeriod", label: "Grace Period (minutes)", type: "number", icon: "⏱" },
    { key: "minFullDay", label: "Min Hours — Full Day", type: "number", icon: "📅" },
    { key: "minHalfDay", label: "Min Hours — Half Day", type: "number", icon: "🌗" },
    { key: "maxIdle", label: "Max Idle Time (minutes)", type: "number", icon: "💤" },
    { key: "breakDuration", label: "Allowed Break (minutes)", type: "number", icon: "☕" },
  ];

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
                value={policy[f.key]}
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
          <button
            onClick={() => setPolicy(defaultPolicy)}
            className="px-6 py-2.5 bg-dark-700 border border-dark-600 text-gray-300 font-medium
              rounded-lg transition-all duration-200 text-sm hover:bg-dark-600 ml-auto"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Audit hint */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 max-w-2xl">
        <p className="text-sm text-amber-400">
          ⚠️ All policy changes are logged in the audit trail for compliance.
        </p>
      </div>
    </div>
  );
};

export default AdminPolicyPage;
