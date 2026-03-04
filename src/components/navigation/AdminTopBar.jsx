// src/components/nav/AdminTopBar.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Home, Users, CalendarDays, User } from "lucide-react";

import { auth } from "../../firebase/firebase";
import useAuthStore from "../../store/useAuthStore";

export default function AdminTopBar({ title = "Dashboard", onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  const storeUser = useAuthStore((s) => s.user);
  const logoutFromStore = useAuthStore((s) => s.logout);

  const uid = storeUser?.uid || auth.currentUser?.uid || "";
  const nameFromStore =
    storeUser?.fullName || storeUser?.name || storeUser?.displayName || "";

  // close dropdown when click outside
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // close dropdown on ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const displayName = nameFromStore || "Miss ABC";

  async function handleLogout() {
    try {
      setOpen(false);

      // If parent passes a custom onLogout, use it (and still go landing)
      if (typeof onLogout === "function") {
        await onLogout();
        navigate("/", { replace: true });
        return;
      }

      // ✅ One source of truth for logout
      if (typeof logoutFromStore === "function") {
        await logoutFromStore();
      } else {
        // fallback if store logout is missing for any reason
        const st = useAuthStore.getState?.();
        if (st?.logout) await st.logout();
        else if (st?.setUser) st.setUser(null);
      }

      // ✅ Go back to SchoolLandingPage after logout
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      // Even if error, go to landing so user isn't stuck
      navigate("/", { replace: true });
    }
  }

  return (
    <header className="adminTopBar">
      {/* Left: hamburger + dropdown */}
      <div className="adminMenuWrap" ref={wrapRef}>
        <button
          type="button"
          className="iconBtn"
          aria-label="Open menu"
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu size={22} />
        </button>

        {open ? (
          <div className="adminHamburgerDropdown" role="menu" aria-label="Admin menu">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `adminHamburgerItem ${isActive ? "isActive" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              <span className="adminHamburgerIcon" aria-hidden="true">
                <Home size={20} />
              </span>
              <span className="adminHamburgerLabel">Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/students"
              className={({ isActive }) =>
                `adminHamburgerItem ${isActive ? "isActive" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              <span className="adminHamburgerIcon" aria-hidden="true">
                <Users size={20} />
              </span>
              <span className="adminHamburgerLabel">Student</span>
            </NavLink>

            <NavLink
              to="/admin/calendar"
              className={({ isActive }) =>
                `adminHamburgerItem ${isActive ? "isActive" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              <span className="adminHamburgerIcon" aria-hidden="true">
                <CalendarDays size={20} />
              </span>
              <span className="adminHamburgerLabel">Calendar</span>
            </NavLink>

            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `adminHamburgerItem ${isActive ? "isActive" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              <span className="adminHamburgerIcon" aria-hidden="true">
                <User size={20} />
              </span>
              <span className="adminHamburgerLabel">Profile</span>
            </NavLink>
          </div>
        ) : null}
      </div>

      {/* Title */}
      <h1 className="adminTopTitle">{title}</h1>

      {/* Right: user name + logout */}
      <div className="adminUser">
        <div className="adminUserName">{displayName}</div>

        <button type="button" className="adminLogoutBtn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* keep uid hidden (optional) */}
      <span style={{ display: "none" }}>{uid}</span>
    </header>
  );
}