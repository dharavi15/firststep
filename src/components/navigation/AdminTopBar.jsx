import { Menu, Home, ListChecks, Calendar, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useEffect, useMemo, useRef, useState } from "react";

export default function AdminTopBar({ title = "Dashboard", userName = "Miss ABC" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // state for open or close dropdown
  const [isOpen, setIsOpen] = useState(false);

  // ref for click outside
  const wrapRef = useRef(null);

  // menu items for dropdown
  const items = useMemo(() => {
    return [
      { label: "Dashboard", path: "/admin/dashboard", icon: Home },
      { label: "Student ", path: "/admin/checklist", icon: ListChecks },
      { label: "Calendar", path: "/admin/calendar", icon: Calendar },
      { label: "Profile", path: "/admin/profile", icon: User },
    ];
  }, []);

  // check active route
  const isActive = (path) => location.pathname === path;

  // toggle dropdown
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // go to page and close dropdown
  const goTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // logout user
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // close dropdown when click outside
  useEffect(() => {
    const onMouseDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // close dropdown when press Escape
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="adminTopBar">
      <div className="adminMenuWrap" ref={wrapRef}>
        <button
          className="iconBtn"
          type="button"
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {isOpen && (
          <div className="adminHamburgerDropdown" role="menu" aria-label="Admin menu">
            {items.map((item) => {
              const ItemIcon = item.icon;

              return (
                <button
                  key={item.path}
                  type="button"
                  className={`adminHamburgerItem ${isActive(item.path) ? "isActive" : ""}`}
                  onClick={() => goTo(item.path)}
                  role="menuitem"
                >
                  <span className="adminHamburgerIcon" aria-hidden="true">
                    <ItemIcon size={20} />
                  </span>

                  <span className="adminHamburgerLabel">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <h1 className="adminTopTitle">{title}</h1>

      <div className="adminUser">
        <span className="adminUserName">{userName}</span>

        <button className="logoutBtn" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}