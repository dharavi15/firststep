import { Outlet, useLocation } from "react-router-dom";
import AdminTopBar from "../components/navigation/AdminTopBar";
import AdminBottomNav from "../components/navigation/AdminBottomNav";

function getTitle(pathname) {
  if (pathname.includes("/admin/checklist")) return "Checklist";
  if (pathname.includes("/admin/calendar")) return "Calendar";
  if (pathname.includes("/admin/profile")) return "Profile";
  return "Dashboard";
}

export default function AdminLayout() {
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="adminApp">
      <AdminTopBar title={title} userName="Miss ABC" />
      <main className="adminContent">
        <Outlet />
      </main>
      <AdminBottomNav />
    </div>
  );
}
