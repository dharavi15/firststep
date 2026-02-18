import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

export default function AdminTopBar({ title = "Dashboard", userName = "Miss ABC" }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
  await signOut(auth);
  navigate("/");
};

  return (
    <header className="adminTopBar">
      {/* Left hamburger */}
      <button className="iconBtn" type="button">
        <Menu size={22} />
      </button>

      {/* Page title */}
      <h1 className="adminTopTitle">{title}</h1>

      {/* Right side user + logout */}
      <div className="adminUser">
        <span className="adminUserName">{userName}</span>

        <button className="logoutBtn" onClick={handleLogout}>
          Logout
        </button>

        <div className="adminAvatar" />
      </div>
    </header>
  );
}
