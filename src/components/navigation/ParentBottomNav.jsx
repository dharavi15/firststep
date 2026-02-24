import { NavLink } from "react-router-dom";
import { Home, ListChecks, CalendarDays, User } from "lucide-react";

export default function ParentBottomNav() {
  return (
    <nav className="parentBottomNav" aria-label="Parent navigation">
      <NavLink to="/parent/dashboard" className={({ isActive }) => `parentNavItem ${isActive ? "active" : ""}`}>
        <Home className="parentNavIcon" />
        <span className="parentNavLabel">Dashboard</span>
      </NavLink>

      <NavLink to="/parent/checklist" className={({ isActive }) => `parentNavItem ${isActive ? "active" : ""}`}>
        <ListChecks className="parentNavIcon" />
        <span className="parentNavLabel">Checklist</span>
      </NavLink>

      <NavLink to="/parent/calendar" className={({ isActive }) => `parentNavItem ${isActive ? "active" : ""}`}>
        <CalendarDays className="parentNavIcon" />
        <span className="parentNavLabel">Calendar</span>
      </NavLink>

      <NavLink to="/parent/profile" className={({ isActive }) => `parentNavItem ${isActive ? "active" : ""}`}>
        <User className="parentNavIcon" />
        <span className="parentNavLabel">Profile</span>
      </NavLink>
    </nav>
  );
}