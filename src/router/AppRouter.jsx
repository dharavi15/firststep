import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// auth page
import LoginPage from "../pages/auth/LoginPage";

// layout shared by admin and parent
import AdminLayout from "../layouts/AdminLayout";

// route protection
import ProtectedRoute from "./ProtectedRoute";

// admin pages
import DashboardPage from "../pages/admin/DashboardPage";
import ChecklistPage from "../pages/admin/ChecklistPage";
import ChecklistStudentPage from "../pages/admin/ChecklistStudentPage";
import CalendarPage from "../pages/admin/CalendarPage";
import ProfilePage from "../pages/admin/ProfilePage";

// parent pages
import ParentDashboard from "../pages/parent/Dashboard";
import ParentChecklist from "../pages/parent/Checklist";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        // public login page
        <Route path="/" element={<LoginPage />} />

        // admin routes
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="checklist/:studentId" element={<ChecklistStudentPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        // parent routes
        <Route
          path="/parent"
          element={
            <ProtectedRoute requiredRole="parent">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/parent/dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="checklist" element={<ParentChecklist />} />
        </Route>

        // fallback route
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}