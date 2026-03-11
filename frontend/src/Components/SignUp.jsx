import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";

const SignUp = () => {
    const navigate = useNavigate();

    const initialFormState = {
        fullname: "",
        username: "",
        designation: "",
        date_of_joining: "",
        department: "",
        role: "",
        gender: "",
        address: "",
        email: "",
        password: "",
        confirm_password: "",
        mobile: "",
        otp: "",
    };

    const [formData, setFormData] = useState(initialFormState);
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    // OTP timer
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // // Cleanup image preview
    // useEffect(() => {
    //     return () => {
    //         if (previewImage) URL.revokeObjectURL(previewImage);
    //     };
    // }, [previewImage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setProfilePicture(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;
        return regex.test(password);
    };

    // SEND OTP
    const sendOtp = async () => {
        if (!formData.mobile) return toast.error("Enter mobile number first");
        if (formData.mobile.length !== 10)
            return toast.error("Enter valid 10-digit mobile number");

        if (otpVerified || timer > 0) return;

        try {
            setOtpLoading(true);

            const res = await axiosInstance.post("send-otp/", {
                mobile: formData.mobile,
            });

            setOtpSent(true);
            setTimer(30);

            // ✅ show OTP in toast
            toast.success(`OTP: ${res.data.otp}`, {
                position: "top-right",
                autoClose: 5000,
            });

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    // VERIFY OTP
    const verifyOtp = async () => {
        if (!formData.otp) return toast.error("Enter OTP");

        try {
            await axiosInstance.post("verify-otp/", {
                mobile: formData.mobile,
                otp: formData.otp,
            });

            setOtpVerified(true);
            toast.success("OTP verified successfully");

        } catch (error) {
            toast.error("Invalid OTP");
        }
    };


    // SUBMIT FORM
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpVerified) return toast.error("Please verify OTP first");

        if (!validatePassword(formData.password))
            return toast.error(
                "Password must contain uppercase, lowercase & number"
            );

        if (formData.password !== formData.confirm_password)
            return toast.error("Passwords do not match");

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key !== "confirm_password") data.append(key, formData[key]);
        });

        if (profilePicture) data.append("profile_picture", profilePicture);

        try {
            setLoading(true);

            await axiosInstance.post("signup/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Registration successful");

            setFormData(initialFormState);
            setProfilePicture(null);
            setPreviewImage(null);
            setOtpSent(false);
            setOtpVerified(false);
            setTimer(0);

            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            console.log("Signup Error:", error.response?.data);

            toast.error(
                JSON.stringify(error.response?.data) || "Registration failed"
            );
        }

        finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100 bg-success d-flex align-items-center justify-content-center overflow-hidden">
            <ToastContainer />

            <div className="card shadow p-4 col-md-11" style={{ maxHeight: "95vh" }}>
                <h4 className="text-center text-danger">
                    <i className="bi bi-building"></i> IXLY Technologies
                </h4>
                <h5 className="text-center mb-3">
                    <i className="bi bi-person-plus"></i> Create Account
                </h5>

                <form className="small" onSubmit={handleSubmit}>
                    <div className="row">
                        {/* LEFT */}
                        <div className="col-md-6">
                            <div className="input-group mb-4">
                                <span className="input-group-text"><i className="bi bi-person"></i></span>
                                <input className="form-control form-control-sm" name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} />
                            </div>

                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-person-badge"></i></span>
                                <input className="form-control form-control-sm" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
                            </div>

                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-briefcase"></i></span>
                                <input className="form-control form-control-sm" name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} />
                            </div>

                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                                <input type="date" className="form-control form-control-sm" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} />
                            </div>

                            <select className="form-select form-select-sm mb-2" name="department" value={formData.department} onChange={handleChange}>
                                <option value="">🏢 Select Department</option>
                                <option>Human Resources (HR)</option>
                                <option>Development</option>
                                <option>Testing (QA)</option>
                                <option>DevOps</option>
                                <option>Information Technology (IT)</option>
                                <option>Finance</option>
                                <option>Marketing</option>
                                <option>Sales</option>
                                <option>Operations</option>
                                <option>Support</option>
                            </select>

                            <select className="form-select form-select-sm mb-2" name="role" value={formData.role} onChange={handleChange}>
                                <option value="">👔 Select Role</option>
                                <option>Super Admin</option>
                                <option>Admin</option>
                                <option>Manager</option>
                                <option>Employee</option>
                            </select>

                            <select className="form-select form-select-sm mb-2" name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">⚧ Select Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>

                        {/* RIGHT */}
                        <div className="col-md-5">
                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                                <input className="form-control form-control-sm" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                            </div>

                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                                <input type="email" className="form-control form-control-sm" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                            </div>

                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                                <input type="password" className="form-control form-control-sm" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                            </div>

                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-shield-lock"></i></span>
                                <input type="password" className="form-control form-control-sm" name="confirm_password" placeholder="Confirm Password" value={formData.confirm_password} onChange={handleChange} />
                            </div>

                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-image"></i></span>
                                <input type="file" className="form-control form-control-sm" onChange={handleFileChange} />
                            </div>

                            {/* {previewImage && (
                                <img src={previewImage} alt="Preview" className="img-thumbnail mb-2" width="60" />
                            )} */}

                            <div className="input-group mb-2">
                                <span className="input-group-text"><i className="bi bi-phone"></i></span>
                                <input
                                    className="form-control form-control-sm"
                                    name="mobile"
                                    placeholder="Mobile"
                                    value={formData.mobile}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        setFormData({ ...formData, mobile: value });
                                    }}
                                    maxLength={10}
                                />
                            </div>

                            <div className="input-group input-group-sm mb-2">
                                <span className="input-group-text"><i className="bi bi-shield-check"></i></span>
                                <input
                                    className="form-control"
                                    name="otp"
                                    placeholder="OTP"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    disabled={otpVerified}
                                />

                                {!otpVerified ? (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={otpSent ? verifyOtp : sendOtp}
                                        disabled={otpLoading || timer > 0}
                                    >
                                        <i className="bi bi-send"></i>{" "}
                                        {otpLoading
                                            ? "Sending..."
                                            : timer > 0
                                                ? `${timer}s`
                                                : otpSent
                                                    ? "Verify"
                                                    : "Send"}
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-success" disabled>
                                        <i className="bi bi-check-circle"></i> Verified
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mt-3"
                        disabled={!otpVerified || loading}
                    >
                        <i className="bi bi-person-check"></i>{" "}
                        {loading ? "Registering..." : "Register"}
                    </button>

                    <p className="text-center mt-2">
                        Already have an account?{" "}
                        <Link to="/login" className="fw-bold text-decoration-none">
                            <i className="bi bi-box-arrow-in-right"></i> Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUp;



