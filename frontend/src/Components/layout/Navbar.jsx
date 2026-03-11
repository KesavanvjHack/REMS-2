import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "Employee";
  const profileImage = localStorage.getItem("profile_image");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-dark-800 border-b border-dark-600 flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search employees, reports…"
            className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-2
              text-sm text-gray-300 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
              transition-all duration-200"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notification bell */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-dark-600">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-dark-600 transition-all duration-200"
          >
            <img
              src={profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-dark-500"
            />
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-white">{username}</div>
              <div className="text-xs text-gray-400">{role}</div>
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">▼</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-dark-700 border border-dark-600
              rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-dark-600">
                <div className="text-sm font-semibold text-white">{username}</div>
                <div className="text-xs text-gray-400">{role}</div>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-600 transition-colors"
              >
                👤 My Profile
              </button>
              <button
                onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-600 transition-colors"
              >
                ⚙️ Settings
              </button>
              <div className="border-t border-dark-600 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
