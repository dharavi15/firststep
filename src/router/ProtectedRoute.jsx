import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function ProtectedRoute({ allowRole, children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/" replace />;

  if (allowRole && user.role !== allowRole) return <Navigate to="/" replace />;

  return children;
}