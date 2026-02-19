import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import AdminLayout from "../layouts/AdminLayout";

import DashboardPage from "../pages/admin/DashboardPage";
import ChecklistPage from "../pages/admin/ChecklistPage";
import ChecklistStudentPage from "../pages/admin/ChecklistStudentPage";
import CalendarPage from "../pages/admin/CalendarPage";
import ProfilePage from "../pages/admin/ProfilePage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Checklist */}
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="checklist/:studentId" element={<ChecklistStudentPage />} />

          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}