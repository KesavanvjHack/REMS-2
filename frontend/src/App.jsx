import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Lazy load pages for better performance
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const WorkSessionsPage = lazy(() => import("./pages/WorkSessionsPage"));
const BreakTrackerPage = lazy(() => import("./pages/BreakTrackerPage"));
const ManagerReviewPage = lazy(() => import("./pages/ManagerReviewPage"));
const AdminPolicyPage = lazy(() => import("./pages/AdminPolicyPage"));
const AuditPage = lazy(() => import("./pages/AuditPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/audit" element={<AuditPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
