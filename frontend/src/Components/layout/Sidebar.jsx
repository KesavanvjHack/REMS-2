import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const navItems = {
  Employee: [
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/attendance", icon: "⏰", label: "Attendance" },
    { to: "/sessions", icon: "💻", label: "Work Sessions" },
    { to: "/breaks", icon: "☕", label: "Break Tracker" },
    { to: "/reports", icon: "📈", label: "Reports" },
  ],
  Manager: [
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/attendance", icon: "⏰", label: "Attendance" },
    { to: "/sessions", icon: "💻", label: "Work Sessions" },
    { to: "/breaks", icon: "☕", label: "Break Tracker" },
    { to: "/manager-review", icon: "👥", label: "Team Review" },
    { to: "/reports", icon: "📈", label: "Reports" },
  ],
  Admin: [
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/attendance", icon: "⏰", label: "Attendance" },
    { to: "/sessions", icon: "💻", label: "Work Sessions" },
    { to: "/breaks", icon: "☕", label: "Break Tracker" },
    { to: "/manager-review", icon: "👥", label: "Team Review" },
    { to: "/admin-policy", icon: "⚙️", label: "Policies" },
    { to: "/reports", icon: "📈", label: "Reports" },
  ],
};

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "Employee";
  const [collapsed, setCollapsed] = useState(false);
  const items = navItems[role] || navItems.Employee;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-dark-800 border-r border-dark-600
        flex flex-col transition-all duration-300 z-50
        ${collapsed ? "w-[68px]" : "w-60"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-dark-600 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
          R
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white tracking-tight">
            REMS
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "text-gray-400 hover:bg-dark-600 hover:text-white"
                  }`
                }
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: Logout */}
      <div className="p-3 border-t border-dark-600 shrink-0">
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login", { replace: true });
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
            text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <span className="text-lg">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
