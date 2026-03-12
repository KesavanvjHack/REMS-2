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
      const res = await axiosInstance.post("auth/login/", form);
      setTempUserData(res.data);
      
      const otpRes = await axiosInstance.post("auth/send-otp/", { username: form.username });
      setReceivedOtp(otpRes.data.otp);
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
    <div className="min-h-screen relative flex items-center justify-center bg-dark-900 overflow-hidden px-4">
      {showOtpToast && (
        <Toast 
          message={`Your login verification code is: ${receivedOtp}`} 
          onClose={() => setShowOtpToast(false)} 
        />
      )}

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,10,0.8)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row bg-dark-800/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 hover:border-white/10">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-accent/20 to-purple-600/20 p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-black text-dark-900">R</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">REMS</span>
            </div>
            <div className="mt-20">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Enterprise <br />
                <span className="text-accent underline decoration-4 underline-offset-8">Monitoring</span> <br />
                Simplified.
              </h2>
              <p className="mt-6 text-gray-400 text-lg max-w-xs leading-relaxed">
                Empower your workforce with data-driven insights and ethical monitoring.
              </p>
            </div>
          </div>

          <div className="relative z-20 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-dark-900 bg-dark-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">Joined by 10k+ professionals</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
          <div className="md:hidden flex justify-center mb-8">
             <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-2xl font-black text-white">R</span>
              </div>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {step === 1 ? "Sign In" : "Security Check"}
            </h1>
            <p className="text-gray-400 mt-2">
              {step === 1 
                ? "Enter your credentials to access your workspace" 
                : `We've sent a code to your registered device`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-shake">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="transition-all duration-300">
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors">👤</span>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                      placeholder="e.g. johndoe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                    <button type="button" className="text-[10px] font-bold text-accent hover:text-white transition-colors uppercase tracking-widest">Forgot?</button>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors">🔒</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl shadow-[0_10px_20px_-5px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Authenticating"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                <div className="flex justify-center gap-2">
                   <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-5
                      text-3xl font-black tracking-[0.6em] text-center text-accent placeholder-gray-700
                      focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40
                      transition-all"
                    placeholder="000000"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl shadow-lg transition-all"
                  >
                    {loading ? "Verifying..." : "Confirm Verification"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-3 text-sm text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest"
                  >
                    Use different account
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              New to the platform? {" "}
              <a href="/" className="text-white font-bold hover:text-accent transition-colors underline underline-offset-4 decoration-accent/30 decoration-2">
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
