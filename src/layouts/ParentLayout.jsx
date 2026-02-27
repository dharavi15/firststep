import { Outlet, useLocation } from "react-router-dom";
import ParentTopBar from "../components/navigation/ParentTopBar";
import ParentBottomNav from "../components/navigation/ParentBottomNav";

function getParentTitle(pathname) {
  if (pathname.startsWith("/parent/checklist")) return "Checklist";
  if (pathname.startsWith("/parent/calendar")) return "Calendar";
  if (pathname.startsWith("/parent/profile")) return "Profile";
  return "Dashboard";
}

export default function ParentLayout() {
  const location = useLocation();

  // This is mock user info for now
  // Later replace with real auth user data
  const userName = "Miss ABC";
  const title = getParentTitle(location.pathname);

  return (
    <div className="parentApp">
      <ParentTopBar title={title} userName={userName} />

      <main className="parentContent">
        <Outlet />
      </main>

      <ParentBottomNav />
    </div>
  );
}