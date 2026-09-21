import { NavLink, Outlet } from "react-router-dom";
import { Button } from "antd";
import agrobankLogo from "@/assets/logos/agrobank-logo.png";
import { strings } from "@/shared/strings";
import { useAuth } from "@/features/auth/context/AuthContext";
import "./AppLayout.css";

const navItems = [
  { to: "/monitoring", label: strings.nav.monitoring },
  { to: "/employees", label: strings.nav.employees },
  { to: "/reference-data", label: strings.nav.referenceData },
  { to: "/reports", label: strings.nav.reports },
];

export function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-layout__nav">
        <div className="app-layout__brand">
          <img src={agrobankLogo} alt={strings.app.title} className="app-layout__logo" />
        </div>
        <nav className="app-layout__tabs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `app-layout__tab ${isActive ? "app-layout__tab--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button type="text" className="app-layout__logout" onClick={logout}>
          {strings.auth.logout}
        </Button>
      </header>
      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}