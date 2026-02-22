// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// auth page
import LoginPage from "../pages/auth/LoginPage";

// shared layout (used for both admin and parent)
import AdminLayout from "../layouts/AdminLayout";

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

        // admin routes use AdminLayout
        <Route path="/admin" element={<AdminLayout />}>
          // redirect /admin to dashboard
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          // admin dashboard
          <Route path="dashboard" element={<DashboardPage />} />

          // admin checklist pages
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="checklist/:studentId" element={<ChecklistStudentPage />} />

          // admin calendar
          <Route path="calendar" element={<CalendarPage />} />

          // admin profile
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        // parent routes now also use AdminLayout
        // this makes parent use same blue header and bottom nav
        <Route path="/parent" element={<AdminLayout />}>
          // redirect /parent to dashboard
          <Route index element={<Navigate to="/parent/dashboard" replace />} />

          // parent dashboard
          <Route path="dashboard" element={<ParentDashboard />} />

          // parent checklist
          <Route path="checklist" element={<ParentChecklist />} />
        </Route>

        // fallback route
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}