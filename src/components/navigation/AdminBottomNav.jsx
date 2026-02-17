import { NavLink } from "react-router-dom";
import { Home, ListChecks, CalendarDays, User } from "lucide-react";

export default function AdminBottomNav() {
  return (
    <nav className="adminBottomNav" aria-label="Admin navigation">
      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
      >
        <Home size={22} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/admin/checklist"
        className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
      >
        <ListChecks size={22} />
        <span>Checklist</span>
      </NavLink>

      <NavLink
        to="/admin/calendar"
        className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
      >
        <CalendarDays size={22} />
        <span>Calendar</span>
      </NavLink>

      <NavLink
        to="/admin/profile"
        className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
      >
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
