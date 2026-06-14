import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Wallet,
  Newspaper,
  Shield,
  Gift,
} from "lucide-react";
import { Sparkles } from "lucide-react"

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "Utilisateurs", icon: Users },
  { path: "/products", label: "Produits", icon: Package },
  { path: "/recharges", label: "Recharges", icon: CreditCard },
  { path: "/withdrawals", label: "Retraits", icon: Wallet },
  { path: "/news", label: "Actualités", icon: Newspaper },
  { path: "/giftcodes", label: "Codes Cadeaux", icon: Gift },
  { path: "/tirages", label: "Tirages", icon: Sparkles },
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoWrapper}>
        <div style={styles.logoIcon}>
          <Shield size={22} color="#0a0f0d" strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={styles.logoText}>KREON</h1>
          <p style={styles.logoSub}>Admin Panel</p>
        </div>
      </div>

      {/* Menu */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>KREON Admin v1.0</p>
        <p style={styles.footerCopy}>© 2026</p>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    minHeight: "100vh",
    background: "rgba(17, 26, 20, 0.6)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(16,185,129,0.2)",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 8px 24px",
    borderBottom: "1px solid rgba(16,185,129,0.1)",
    marginBottom: "24px",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #10b981, #f59e0b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "1px",
  },
  logoSub: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  navItemActive: {
    background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))",
    color: "#10b981",
    boxShadow: "0 0 20px rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.3)",
  },
  footer: {
    padding: "16px 8px",
    borderTop: "1px solid rgba(16,185,129,0.1)",
    textAlign: "center",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "11px",
    marginBottom: "4px",
  },
  footerCopy: {
    color: "#64748b",
    fontSize: "10px",
  },
};