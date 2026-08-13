import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";
import {
  IconAppointments,
  IconCalendar,
  IconDashboard,
  IconChevronRight,
  IconLogout,
  IconPayments,
  IconSettings,
} from "./icons";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = [
  { to: "/admin", end: true, label: "Dashboard", icon: IconDashboard, crumb: "Dashboard" },
  { to: "/admin/calendar", label: "Calendar", icon: IconCalendar, crumb: "Calendar" },
  { to: "/admin/appointments", label: "Appointments", icon: IconAppointments, crumb: "Appointments" },
  { to: "/admin/payments", label: "Payments", icon: IconPayments, crumb: "Payments" },
  { to: "/admin/settings", label: "Settings", icon: IconSettings, crumb: "Settings" },
];

function breadcrumbFor(pathname) {
  if (pathname.startsWith("/admin/dates/")) {
    const date = pathname.split("/admin/dates/")[1];
    return ["Admin", "Calendar", date];
  }
  const match = NAV_ITEMS.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));
  return ["Admin", match ? match.crumb : "Dashboard"];
}

export default function Layout() {
  const { session, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (session === undefined) {
    return <div className="admin-container">Loading...</div>;
  }
  if (session === null) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  const email = session?.user?.email || "Admin";
  const initial = email.charAt(0).toUpperCase();
  const crumbs = breadcrumbFor(location.pathname);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-mark">KC</div>
          <div>
            <strong>KC Hospital</strong>
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="admin-sidenav">
          {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-sidenav-link${isActive ? " active" : ""}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="admin-sidenav-logout" onClick={handleLogout}>
          <IconLogout size={18} />
          <span>Log out</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-breadcrumb">
            {crumbs.map((crumb, index) => (
              <span key={crumb} className="admin-breadcrumb-item">
                {index > 0 && <IconChevronRight size={13} />}
                <span className={index === crumbs.length - 1 ? "current" : ""}>{crumb}</span>
              </span>
            ))}
          </div>

          <div className="admin-header-actions">
            <NotificationBell />
            <div className="admin-avatar" title={email}>
              {initial}
            </div>
          </div>
        </header>

        <div className="admin-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
