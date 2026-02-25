// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import AdminLayout from "../layouts/AdminLayout";

import DashboardPage from "../pages/admin/DashboardPage";
import ChecklistPage from "../pages/admin/ChecklistPage";
import ChecklistStudentPage from "../pages/admin/ChecklistStudentPage";
import CalendarPage from "../pages/admin/CalendarPage";
import ProfilePage from "../pages/admin/ProfilePage";
import AddStudentPage from "../pages/admin/AddStudentPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin (protected inside AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="checklist/:studentId" element={<ChecklistStudentPage />} />

          <Route path="students/new" element={<AddStudentPage mode="create" />} />
          <Route path="students/:studentId/edit" element={<AddStudentPage mode="edit" />} />

          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}