/*import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, ListChecks, CalendarDays, User, LogOut } from "lucide-react";

export default function ParentTopBar({ title = "Dashboard", userName = "Mock Parent" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // This controls dropdown open state
  const [isOpen, setIsOpen] = useState(false);

  // This is used to detect click outside the dropdown
  const wrapRef = useRef(null);

  // These are menu items for the dropdown
  const items = useMemo(() => {
    return [
      { label: "Dashboard", path: "/parent/dashboard", Icon: Home },
      { label: "Checklist", path: "/parent/checklist", Icon: ListChecks },
      { label: "Calendar", path: "/parent/calendar", Icon: CalendarDays },
      { label: "Profile", path: "/parent/profile", Icon: User },
    ];
  }, []);

  // This checks if the current path matches the menu item
  const isActive = (path) => location.pathname === path;

  // This opens or closes the dropdown
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // This navigates and closes the dropdown
  const goTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // This is mock logout for now
  // Later replace with Firebase signOut
  const handleLogout = () => {
    setIsOpen(false);
    navigate("/");
  };

  // This closes dropdown when clicking outside
  useEffect(() => {
    const onMouseDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // This closes dropdown when pressing Escape
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="parentTopBar">
      <div className="parentMenuWrap" ref={wrapRef}>
        <button className="iconBtn" type="button" onClick={toggleMenu} aria-label="Open menu">
          <Menu size={22} />
        </button>

        {isOpen && (
          <div className="parentHamburgerDropdown" role="menu" aria-label="Parent menu">
            {items.map((item) => {
              const ItemIcon = item.Icon;

              return (
                <button
                  key={item.path}
                  type="button"
                  className={`parentHamburgerItem ${isActive(item.path) ? "isActive" : ""}`}
                  onClick={() => goTo(item.path)}
                  role="menuitem"
                >
                  <span className="parentHamburgerIcon" aria-hidden="true">
                    <ItemIcon size={20} />
                  </span>
                  <span className="parentHamburgerLabel">{item.label}</span>
                </button>
              );
            })}

            <button type="button" className="parentHamburgerItem" onClick={handleLogout} role="menuitem">
              <span className="parentHamburgerIcon" aria-hidden="true">
                <LogOut size={20} />
              </span>
              <span className="parentHamburgerLabel">Logout</span>
            </button>
          </div>
        )}
      </div>

      <h1 className="parentTopTitle">{title}</h1>

      <div className="parentUser">
        <span className="parentUserName">{userName}</span>
        <div className="parentAvatar" />
      </div>
    </header>
  );
}*/