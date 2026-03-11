import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Toast from "../components/ui/Toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [form, setForm] = useState({ username: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpToast, setShowOtpToast] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState("");
  const [tempUserData, setTempUserData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Initial Login (Validate credentials)
      const res = await axiosInstance.post("auth/login/", form);
      
      // If server returns profile info but needs OTP
      setTempUserData(res.data);
      
  // Request OTP for the user (using their mobile number)
      const otpRes = await axiosInstance.post("auth/send-otp/", { username: form.username });
      setReceivedOtp(otpRes.data.otp);
      // We can use the masked mobile from backend response if available
      setTempUserData({ ...res.data, maskedMobile: otpRes.data.mobile });
      setShowOtpToast(true);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In a real app, we'd have a specific endpoint for login OTP verification
      // For now, we'll verify and then set the localStorage from tempUserData
      await axiosInstance.post("auth/verify-otp/", { 
        username: form.username, 
        otp 
      });

      localStorage.setItem("token", tempUserData.access || tempUserData.token);
      localStorage.setItem("userRole", tempUserData.role);
      localStorage.setItem("username", tempUserData.username);
      if (tempUserData.profile_picture) {
        localStorage.setItem("profile_image", tempUserData.profile_picture);
      }
      
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      {showOtpToast && (
        <Toast 
          message={`Your login verification code is: ${receivedOtp}`} 
          onClose={() => setShowOtpToast(false)} 
        />
      )}

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 mb-4">
            <span className="text-3xl font-bold text-accent">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 1 ? "Welcome back" : "Security Check"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {step === 1 ? "Sign in to REMS Attendance System" : `Please enter the OTP sent to ${tempUserData?.maskedMobile || "your device"}`}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3
                    text-sm text-white placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                    transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3
                    text-sm text-white placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                    transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold
                  rounded-lg transition-all duration-200 text-sm
                  disabled:opacity-60 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-accent/25"
              >
                {loading ? "Checking credentials…" : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3
                    text-2xl font-bold tracking-[0.5em] text-center text-accent placeholder-gray-600
                    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                    transition-all duration-200"
                  placeholder="000000"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white text-sm rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="flex-[2] py-3 bg-accent hover:bg-accent-hover text-white font-semibold
                    rounded-lg transition-all duration-200 text-sm disabled:opacity-60"
                >
                  {loading ? "Verifying…" : "Verify & Enter"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{" "}
            <a href="/" className="text-accent hover:text-accent-hover transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
