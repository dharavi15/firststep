import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/auth";
import { getUserProfile } from "../firebase/userProfile";

// This component protects routes by checking login and role
// It waits for Firebase auth
// Then it loads user profile from Firestore
// If role does not match, it redirects

export default function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      const profile = await getUserProfile(user.uid);

      if (!profile) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      // Check if role matches
      if (profile.role === requiredRole) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [requiredRole]);

  // While checking auth and role
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not allowed redirect to login
  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  // If allowed render protected page
  return children;
}