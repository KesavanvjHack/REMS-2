import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import Badge from "../components/ui/Badge";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axiosInstance.get("notifications/alerts/");
      setAlerts(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`notifications/alerts/${id}/`, { is_read: true });
      setAlerts(alerts.map(alert => alert.id === id ? { ...alert, is_read: true } : alert));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const markAllAsRead = async () => {
      try {
          await axiosInstance.post("notifications/alerts/mark_all_read/");
          setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
      } catch (error) {
          console.error("Error marking all read", error);
      }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "unread") return !alert.is_read;
    return true;
  });

  const getSeverityVariant = (severity) => {
    switch (severity) {
      case "critical": return "danger";
      case "warning": return "warning";
      default: return "info";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "IDLE": return "⏰";
      case "UNAUTHORIZED": return "🚨";
      default: return "🔔";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Intelligence & Alerts</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            System-wide monitoring notifications and security alerts
          </p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest px-4 py-2 border border-dark-600 rounded-lg"
            >
                Clear All
            </button>
            <div className="flex bg-dark-800 p-1.5 rounded-xl border border-dark-600 shadow-inner">
            <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                filter === "all" ? "bg-accent text-white shadow-lg" : "text-gray-400 hover:text-white"
                }`}
            >
                All
            </button>
            <button
                onClick={() => setFilter("unread")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                filter === "unread" ? "bg-accent text-white shadow-lg" : "text-gray-400 hover:text-white"
                }`}
            >
                Unread
            </button>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-dark-800/30 rounded-[2.5rem] border border-dashed border-dark-600">
          <span className="text-5xl mb-6">🛰️</span>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Communication silence. No active alerts.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`group flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-500 hover:translate-x-1 ${
                alert.is_read 
                  ? "bg-dark-800/20 border-dark-600 opacity-60" 
                  : "bg-dark-800 border-dark-600 shadow-2xl shadow-black/40 border-l-4 border-l-accent"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                  alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 
                  alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 
                  'bg-blue-500/10 border-blue-500/20'
              }`}>
                <span className="text-2xl">{getIcon(alert.alert_type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={getSeverityVariant(alert.severity)}>
                    {alert.alert_type}
                  </Badge>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm font-medium leading-relaxed ${alert.is_read ? "text-gray-500" : "text-gray-200"}`}>
                  {alert.message}
                </p>
              </div>
              {!alert.is_read && (
                <button
                  onClick={() => markAsRead(alert.id)}
                  className="px-5 py-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-dark-600 shadow-lg"
                >
                  Confirm
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
