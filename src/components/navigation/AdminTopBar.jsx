import { Menu, Home, ListChecks, Calendar, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useEffect, useMemo, useRef, useState } from "react";

import useAuthStore from "../../store/useAuthStore";
import { getUserProfile } from "../../firebase/userProfile";
import adminAvatar from "../../assets/admin.png";

export default function AdminTopBar({ title = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // state for open or close dropdown
  const [isOpen, setIsOpen] = useState(false);

  // ref for click outside
  const wrapRef = useRef(null);

  // auth store
  const storeUser = useAuthStore((s) => s.user);
  const uid = storeUser?.uid || auth.currentUser?.uid || "";

  // user display (name + photo)
  const [displayName, setDisplayName] = useState(storeUser?.fullName || "Miss ABC");
  const [photoURL, setPhotoURL] = useState(storeUser?.photoURL || "");

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

  // load profile (same owner as ProfilePage) to get photoURL + fullName
  useEffect(() => {
    let alive = true;

    async function loadTopbarProfile() {
      try {
        if (!uid) return;

        // 1) quick set from store (if any)
        if (storeUser?.fullName) setDisplayName(storeUser.fullName);
        if (storeUser?.photoURL) setPhotoURL(storeUser.photoURL);

        // 2) fetch from Firestore via existing helper
        const profile = await getUserProfile(uid);
        if (!alive) return;

        const nextName = profile?.fullName || storeUser?.fullName || "Miss ABC";
        const nextPhoto = profile?.photoURL || storeUser?.photoURL || "";

        setDisplayName(nextName);
        setPhotoURL(nextPhoto);
      } catch (err) {
        console.error("AdminTopBar load profile error:", err);
      }
    }

    loadTopbarProfile();
    return () => {
      alive = false;
    };
  }, [uid, storeUser?.fullName, storeUser?.photoURL]);

  const avatarSrc = photoURL || adminAvatar;

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
        <img className="adminUserAvatar" src={avatarSrc} alt="User avatar" />
        <span className="adminUserName">{displayName}</span>

        <button className="adminLogoutBtn" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}