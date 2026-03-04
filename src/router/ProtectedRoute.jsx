import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function ProtectedRoute({ allowRole, children }) {
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);
  const location = useLocation();

  if (!authReady) {
    return <div style={{ padding: 24, fontWeight: 700 }}>Loading...</div>;
  }

  // ✅ If logged out -> go back to SchoolLandingPage
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />;

  // ✅ If role mismatch -> also go back to SchoolLandingPage
  if (allowRole && user.role !== allowRole) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}