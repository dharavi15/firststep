import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// auth
import LoginPage from "../pages/auth/LoginPage";

// route guard
import ProtectedRoute from "./ProtectedRoute";

// layout
import AdminLayout from "../layouts/AdminLayout";
import ParentLayout from "../layouts/ParentLayout";

// admin pages
import DashboardPage from "../pages/admin/DashboardPage";
import ChecklistPage from "../pages/admin/ChecklistPage";
import ChecklistStudentPage from "../pages/admin/ChecklistStudentPage";
import CalendarPage from "../pages/admin/CalendarPage";
import ProfilePage from "../pages/admin/ProfilePage";

// parent pages
import ParentDashboard from "../pages/parent/Dashboard";
import ParentChecklist from "../pages/parent/Checklist";
import ParentCalendar from "../pages/parent/Calendar";
import ParentProfile from "../pages/parent/Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

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
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="checklist/:studentId" element={<ChecklistStudentPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route
          path="/parent"
          element={
            <ProtectedRoute allowRole="parent">
              <ParentLayout title="Dashboard" userName="Parent" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/parent/dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="checklist" element={<ParentChecklist />} />
          <Route path="calendar" element={<ParentCalendar />} />
          <Route path="profile" element={<ParentProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}