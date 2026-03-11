import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const DashboardLayout = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");
    const storedImage = localStorage.getItem("profile_image");

    const [profileImage, setProfileImage] = useState(storedImage);

    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login", { replace: true });
    };

    return (
        <div className="container-fluid">
            <div className="row">

                {/* SIDEBAR */}
                <div className="col-12 col-md-3 col-lg-2 bg-dark text-white p-3 
                        position-fixed top-0 start-0 vh-100 overflow-auto">

                    <h5 className="text-center mb-4 text-danger">IXLY Technologies</h5>

                    <ul className="nav nav-pills flex-column gap-1">

                        {/* EMPLOYEE / MANAGER */}
                        {(role === "Employee" || role === "Manager") && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/dashboard">Dashboard</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/live-feed">Live Feed</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/remote-track">RemoteTrack</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/timesheets">Timesheets</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/reports">Reports</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/tasks">Tasks</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/attendance">Attendance</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/projects">Projects</Link>
                                </li>
                            </>
                        )}

                        {/* ADMIN */}
                        {(role === "Admin" || role === "Super Admin") && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-dashboard">Admin Dashboard</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-teams">Teams</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-members">Members</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-users">Users</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-projects">Projects</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-attendance">Attendance</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-payroll">Payroll</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-reports">Reports</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-integrations">Integrations</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/admin-organizations">Organizations</Link>
                                </li>
                            </>
                        )}

                    </ul>
                </div>

                {/* MAIN CONTENT */}
                <div className="col offset-md-3 offset-lg-2">

                    {/* NAVBAR */}
                    <nav className="navbar bg-success sticky-top px-3 border-bottom">
                        <span className="navbar-brand fw-bold text-white">
                            Welcome to your dashboard 🎉
                        </span>

                        <div className="dropdown ms-auto">
                            <button
                                className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle"
                                data-bs-toggle="dropdown"
                            >
                                <img
                                    src={
                                        profileImage
                                            ? profileImage
                                            : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                    }
                                    alt="profile"
                                    width="40"
                                    height="40"
                                    className="rounded-circle"
                                />
                                <div className="text-start">
                                    <div className="fw-bold">{username}</div>
                                    <small>{role}</small>
                                </div>
                            </button>

                            <ul className="dropdown-menu dropdown-menu-end">
                                <li className="dropdown-item fw-bold text-muted">
                                    USER ID : {userId}
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* PAGE CONTENT */}
                    <div className="container-fluid p-3">
                        <Outlet />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
