import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "", password: "", fullname: "", designation: "",
    department: "", role: "Employee", gender: "Male", address: "", mobile: "",
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post("signup/", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || JSON.stringify(err.response?.data) || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5
    text-sm text-white placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 mb-3">
            <span className="text-2xl font-bold text-accent">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join REMS Attendance System</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                <input type="text" required value={form.username} onChange={(e) => handleChange("username", e.target.value)} className={inputClass} placeholder="johndoe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                <input type="password" required value={form.password} onChange={(e) => handleChange("password", e.target.value)} className={inputClass} placeholder="••••••" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
              <input type="text" required value={form.fullname} onChange={(e) => handleChange("fullname", e.target.value)} className={inputClass} placeholder="John Doe" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Designation</label>
                <input type="text" required value={form.designation} onChange={(e) => handleChange("designation", e.target.value)} className={inputClass} placeholder="Developer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
                <input type="text" required value={form.department} onChange={(e) => handleChange("department", e.target.value)} className={inputClass} placeholder="Engineering" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Role</label>
                <select value={form.role} onChange={(e) => handleChange("role", e.target.value)} className={inputClass}>
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} className={inputClass}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Mobile</label>
                <input type="text" required maxLength={10} value={form.mobile} onChange={(e) => handleChange("mobile", e.target.value)} className={inputClass} placeholder="9876543210" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Address</label>
              <input type="text" required value={form.address} onChange={(e) => handleChange("address", e.target.value)} className={inputClass} placeholder="123 Main St, City" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold
                rounded-lg transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed
                hover:shadow-lg hover:shadow-accent/25"
            >
              {loading ? "Creating…" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-accent hover:text-accent-hover transition-colors">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
