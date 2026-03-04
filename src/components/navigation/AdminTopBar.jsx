import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Home, Users, CalendarDays, User } from "lucide-react";

export default function AdminTopBar({ title = "Dashboard", userName = "Miss ABC", avatarUrl, onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="adminTopBar">
      <div className="adminMenuWrap" ref={wrapRef}>
        <button
          type="button"
          className="iconBtn"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu size={22} />
        </button>

        {open ? (
          <div className="adminHamburgerDropdown" role="menu" aria-label="Admin menu">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `adminHamburgerItem ${isActive ? "isActive" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="adminHamburgerIcon" aria-hidden="true">
                <Home size={20} />
              </span>
              <span className="adminHamburgerLabel">Dashboard</span>
            </NavLink>

            {/* Student + icon */}
            <NavLink
              to="/admin/students"
              className={({ isActive }) => `adminHamburgerItem ${isActive ? "isActive" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="adminHamburgerIcon" aria-hidden="true">
                <Users size={20} />
              </span>
              <span className="adminHamburgerLabel">Student</span>
            </NavLink>

            <NavLink
              to="/admin/calendar"
              className={({ isActive }) => `adminHamburgerItem ${isActive ? "isActive" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="adminHamburgerIcon" aria-hidden="true">
                <CalendarDays size={20} />
              </span>
              <span className="adminHamburgerLabel">Calendar</span>
            </NavLink>

            <NavLink
              to="/admin/profile"
              className={({ isActive }) => `adminHamburgerItem ${isActive ? "isActive" : ""}`}
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

      <h1 className="adminTopTitle">{title}</h1>

      <div className="adminUser">
        {avatarUrl ? (
          <img className="adminUserAvatar" src={avatarUrl} alt="User avatar" />
        ) : (
          <div className="adminUserAvatar" aria-hidden="true" />
        )}

        <div className="adminUserName">{userName}</div>

        <button type="button" className="adminLogoutBtn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}