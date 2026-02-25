// src/layouts/AdminLayout.jsx
import { useEffect, useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import AdminTopBar from "../components/navigation/AdminTopBar";
import AdminBottomNav from "../components/navigation/AdminBottomNav";

import { auth } from "../firebase/firebase";
import { getUserProfile } from "../firebase/userProfile";

function getTitle(pathname) {
  if (pathname.includes("/admin/checklist")) return "Checklist";
  if (pathname.includes("/admin/calendar")) return "Calendar";
  if (pathname.includes("/admin/profile")) return "Profile";
  if (pathname.includes("/admin/students")) return "Students";
  return "Dashboard";
}

export default function AdminLayout() {
  const location = useLocation();
  const title = getTitle(location.pathname);

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const profile = await getUserProfile(user.uid);
        if (!profile) {
          setIsAdmin(false);
          return;
        }

        const roleOk = profile.role === "admin";
        setIsAdmin(roleOk);

        const display =
          profile.fullName || profile.name || user.displayName || user.email || "Admin";
        setUserName(display);
      } catch (e) {
        console.log("ADMIN GUARD ERROR:", e);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="adminApp">
        <div className="adminContent" style={{ padding: 24 }}>
          Checking access...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="adminApp">
      <AdminTopBar title={title} userName={userName} />
      <main className="adminContent">
        <Outlet />
      </main>
      <AdminBottomNav />
    </div>
  );
}