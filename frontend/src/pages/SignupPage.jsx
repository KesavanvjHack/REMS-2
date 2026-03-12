import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Toast from "../components/ui/Toast";

const SignupPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpToast, setShowOtpToast] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState("");
  const [form, setForm] = useState({
    username: "", password: "", fullname: "", designation: "",
    department: "", role: "Employee", gender: "Male", address: "", mobile: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [otp, setOtp] = useState("");

  const [otpVerified, setOtpVerified] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/send-otp/", { mobile: form.mobile });
      setReceivedOtp(res.data.otp);
      setShowOtpToast(true);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post("auth/verify-otp/", { mobile: form.mobile, otp });
      setOtpVerified(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (profileImage) {
        formData.append("profile_picture", profileImage);
      }

      await axiosInstance.post("auth/signup/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessToast(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
    text-sm text-white placeholder-gray-600
    focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all duration-200`;

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-dark-900 overflow-hidden px-4 py-10">
      {showOtpToast && (
        <Toast 
          message={`Your verification code is: ${receivedOtp}`} 
          onClose={() => setShowOtpToast(false)} 
        />
      )}
      
      {successToast && (
        <Toast 
          message="Registration Successful! Redirecting..." 
          type="success"
          onClose={() => setSuccessToast(false)} 
        />
      )}

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] flex flex-col md:flex-row bg-dark-800/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-tr from-accent/20 to-purple-600/20 p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-black text-dark-900">R</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">REMS</span>
            </div>
            <div className="mt-16">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Join the <br />
                <span className="text-accent underline decoration-4 underline-offset-8">Future</span> <br />
                of Work.
              </h2>
              <p className="mt-6 text-gray-400 text-lg leading-relaxed">
                Start your journey with the world's most advanced remote monitoring platform.
              </p>
            </div>
          </div>

          <div className="relative z-20 flex flex-col gap-4">
             <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Secure</p>
                <p className="text-sm text-white">End-to-end encrypted biometric data.</p>
             </div>
             <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Ethical</p>
                <p className="text-sm text-white">Privacy-first monitoring protocols.</p>
             </div>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 p-8 md:p-12 lg:p-14 overflow-y-auto max-h-[90vh]">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
              <p className="text-gray-400 mt-2">
                {step === 1 ? "Fill in your details to get started" : "Verify your mobile number"}
              </p>
            </div>
            <div className="flex gap-2">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 1 ? "bg-accent scale-125" : "bg-dark-600"}`} />
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 2 ? "bg-accent scale-125" : "bg-dark-600"}`} />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-shake">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in duration-500">
              {/* Profile Picture Upload Section */}
              <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/10 group">
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-20 h-20 rounded-2xl bg-dark-700 border-2 border-dashed border-dark-600 
                    flex items-center justify-center cursor-pointer hover:border-accent transition-all overflow-hidden relative"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-50">📷</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">Change</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Profile Photo</h4>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB (Optional)</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                  <input type="text" required value={form.username} onChange={(e) => handleChange("username", e.target.value)} className={inputClass} placeholder="johndoe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                  <input type="password" required value={form.password} onChange={(e) => handleChange("password", e.target.value)} className={inputClass} placeholder="••••••••" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" required value={form.fullname} onChange={(e) => handleChange("fullname", e.target.value)} className={inputClass} placeholder="John Alexander Doe" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Designation</label>
                  <input type="text" required value={form.designation} onChange={(e) => handleChange("designation", e.target.value)} className={inputClass} placeholder="Sr. Frontend Developer" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Department</label>
                  <input type="text" required value={form.department} onChange={(e) => handleChange("department", e.target.value)} className={inputClass} placeholder="Product Engineering" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">System Role</label>
                  <select value={form.role} onChange={(e) => handleChange("role", e.target.value)} className={inputClass}>
                    <option>Employee</option>
                    <option>Manager</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Gender</label>
                  <select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} className={inputClass}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mobile Contact</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">📱</span>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    className={`${inputClass} pl-12`}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Primary Address</label>
                <input type="text" required value={form.address} onChange={(e) => handleChange("address", e.target.value)} className={inputClass} placeholder="Penthouse 42, Silicon Valley Towers" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-bold
                  rounded-2xl shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all duration-300
                  hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Initialize Verification"}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
              <div className="text-center">
                <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent/20">
                  <span className="text-3xl">📩</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Identity Access Management</h3>
                <p className="text-gray-400 mt-2 max-w-sm mx-auto">
                  We've dispatched a secure token to <span className="text-white font-bold">{form.mobile}</span>. Enter it below to authorize.
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={otpVerified}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-6
                      text-4xl font-black text-center tracking-[0.8em] text-accent placeholder-gray-800
                      focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40
                      transition-all ${otpVerified ? "opacity-50 cursor-not-allowed border-green-500/50" : ""}`}
                    placeholder="000000"
                  />
                  {otpVerified && (
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  )}
                </div>

                {!otpVerified ? (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold
                        rounded-2xl transition-all duration-200 border border-white/5"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length < 6}
                      className="flex-[2] py-4 bg-accent hover:bg-accent-hover text-white font-bold
                        rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-60"
                    >
                      {loading ? "Verifying..." : "Authorize"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleFinalSignup}
                    disabled={loading}
                    className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-black
                      rounded-2xl transition-all duration-500 text-xl shadow-[0_15px_40px_-10px_rgba(34,197,94,0.4)]
                      animate-in zoom-in duration-500"
                  >
                    {loading ? "Establishing Identity..." : "Create Identity"}
                  </button>
                )}

                {!otpVerified && (
                  <div className="text-center mt-6">
                     <button
                        onClick={handleSendOtp}
                        className="text-xs text-gray-500 hover:text-accent font-bold uppercase tracking-widest transition-colors"
                        disabled={loading}
                      >
                        Request fresh token
                      </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Already possess an identity? {" "}
              <a href="/login" className="text-white font-bold hover:text-accent transition-colors underline underline-offset-4 decoration-accent/30 decoration-2">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
