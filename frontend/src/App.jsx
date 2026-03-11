import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import WorkSessionsPage from "./pages/WorkSessionsPage";
import BreakTrackerPage from "./pages/BreakTrackerPage";
import ManagerReviewPage from "./pages/ManagerReviewPage";
import AdminPolicyPage from "./pages/AdminPolicyPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes with layout */}
      <Route element={<MainLayout />}>
        {/* All authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/sessions" element={<WorkSessionsPage />} />
          <Route path="/breaks" element={<BreakTrackerPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* Manager + Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["Manager", "Admin"]} />}>
          <Route path="/manager-review" element={<ManagerReviewPage />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin-policy" element={<AdminPolicyPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
