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

  const inputClass = `w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5
    text-sm text-white placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-10">
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

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 mb-3">
            <span className="text-2xl font-bold text-accent">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">
            {step === 1 ? "Step 1: Base Details" : "Step 2: Mobile Verification"}
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-6">
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-24 h-24 rounded-full bg-dark-700 border-2 border-dashed border-dark-600 
                    flex items-center justify-center cursor-pointer hover:border-accent transition-all overflow-hidden relative group"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl text-gray-500">📷</span>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Upload</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
                    <span className="text-xs text-white font-medium">Change</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <p className="text-xs text-gray-500 mt-2">Optional: Add a profile picture</p>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Mobile Number (Verification required)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">📱</span>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Address</label>
                <input type="text" required value={form.address} onChange={(e) => handleChange("address", e.target.value)} className={inputClass} placeholder="123 Main St, City" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-bold
                  rounded-xl transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-accent/25"
              >
                {loading ? "Sending OTP…" : "Continue to Verification"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
                  <span className="text-2xl">📩</span>
                </div>
                <h3 className="text-lg font-bold text-white">Enter Verification Code</h3>
                <p className="text-sm text-gray-400 mt-1">
                  We've sent a 6-digit code to <span className="font-semibold text-white">{form.mobile}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={otpVerified}
                    className={`w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-4
                      text-2xl font-bold text-center tracking-[1em] text-accent placeholder-gray-700
                      focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                      ${otpVerified ? "opacity-50 cursor-not-allowed border-green-500/50" : ""}`}
                    placeholder="000000"
                  />
                  {otpVerified && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xl font-bold">
                      ✓
                    </span>
                  )}
                </div>

                {!otpVerified ? (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 font-semibold
                        rounded-xl transition-all duration-200 text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length < 6}
                      className="flex-[2] py-3 bg-accent hover:bg-accent-hover text-white font-bold
                        rounded-xl transition-all duration-200 text-sm disabled:opacity-60"
                    >
                      {loading ? "Verifying…" : "Verify OTP"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleFinalSignup}
                    disabled={loading}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold
                      rounded-xl transition-all duration-200 text-lg shadow-lg shadow-green-500/25
                      animate-in fade-in zoom-in duration-300"
                  >
                    {loading ? "Registering…" : "Register Now"}
                  </button>
                )}
              </div>

              {!otpVerified && (
                <p className="text-center text-xs text-gray-500">
                  Didn't receive the code? {" "}
                  <button
                    onClick={handleSendOtp}
                    className="text-accent hover:underline font-medium"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </p>
              )}
            </div>
          )}

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-accent hover:text-accent-hover transition-colors font-semibold">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
