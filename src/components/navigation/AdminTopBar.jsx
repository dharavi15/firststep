import { Menu } from "lucide-react";

export default function AdminTopBar({ title = "Dashboard", userName = "User" }) {
  return (
    <header className="adminTopBar">
      <button className="iconBtn" type="button" aria-label="Open menu">
        <Menu size={22} />
      </button>

      <h1 className="adminTopTitle">{title}</h1>

      <div className="adminUser">
        <span className="adminUserName">{userName}</span>
        <div className="adminAvatar" aria-hidden="true" />
      </div>
    </header>
  );
}
