import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";

const SignIn = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            const response = await axiosInstance.post("login/", formData);


            const { token, role, user_id, username, profile_picture } = response.data;

            // ✅ store in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("profile_image", response.data.profile_image);
            localStorage.setItem("user_id", response.data.user_id);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("user_id", response.data.user_id);


            toast.success("Login successful");

            // ✅ role based navigation
            if (role === "Admin" || role === "Super Admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Invalid username or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100 bg-success d-flex align-items-center justify-content-center">
            <ToastContainer />

            <div className="card shadow p-4 col-md-4">
                <h4 className="text-center text-danger mb-1">
                    <i className="bi bi-building"></i> IXLY Technologies
                </h4>
                <h5 className="text-center mb-3">
                    Sign In
                </h5>

                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label className="form-label">Password</label>

                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="form-control"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >   <i className="bi bi-box-arrow-in-right"></i>
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center mt-4 mb-3">
                    Don't have an account?{" "}
                    <Link to="/" className="fw-bold text-decoration-none">
                        <i className="bi bi-box-arrow-in-left"></i>
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
