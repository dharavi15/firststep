import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import SchoolLandingPage from "../pages/home/SchoolLandingPage";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import ParentLayout from "../layouts/ParentLayout";

// admin pages
import DashboardPage from "../pages/admin/DashboardPage";
import ChecklistPage from "../pages/admin/ChecklistPage";
import ChecklistStudentPage from "../pages/admin/ChecklistStudentPage";
import CalendarPage from "../pages/admin/CalendarPage";
import ProfilePage from "../pages/admin/ProfilePage";
import AddStudentPage from "../pages/admin/AddStudentPage";

// parent pages
import ParentDashboard from "../pages/parent/Dashboard";
import ParentChecklist from "../pages/parent/Checklist";
import ParentCalendar from "../pages/parent/Calendar";
import ParentProfile from "../pages/parent/Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
       {/* public home */}
<Route path="/" element={<SchoolLandingPage />} />

{/* auth */}
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="checklist/:studentId" element={<ChecklistStudentPage />} />
          <Route path="students/new" element={<AddStudentPage mode="create" />} />
          <Route path="students/:studentId/edit" element={<AddStudentPage mode="edit" />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* parent */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowRole="parent">
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/parent/dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="checklist" element={<ParentChecklist />} />
          <Route path="calendar" element={<ParentCalendar />} />
          <Route path="profile" element={<ParentProfile />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}