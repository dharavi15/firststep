import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import SchoolLandingPage from "../pages/home/SchoolLandingPage";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";

// admin pages
import DashboardPage from "../pages/admin/DashboardPage";
import ChecklistPage from "../pages/admin/ChecklistPage";
import ChecklistStudentPage from "../pages/admin/ChecklistStudentPage";
import CalendarPage from "../pages/admin/CalendarPage";
import ProfilePage from "../pages/admin/ProfilePage";
import AddStudentPage from "../pages/admin/AddStudentPage";

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        {/* public home */}
        <Route path="/" element={<SchoolLandingPage />} />

        {/* auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* blocked areas */}
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route path="/parent/*" element={<Navigate to="/login" replace />} />

        {/* admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="students" element={<ChecklistPage />} />
          <Route path="checklist" element={<Navigate to="/admin/students" replace />} />
          <Route path="checklist/:studentId" element={<ChecklistStudentPage />} />

          <Route path="students/new" element={<AddStudentPage mode="create" />} />
          <Route path="students/:studentId/edit" element={<AddStudentPage mode="edit" />} />

          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}