import { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { LogOut, Bell, ChevronDown, User } from "lucide-react";

export default function Topbar() {
  const { admin, logout } = useAdminAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header style={styles.topbar}>
      <div style={styles.left}>
        <h2 style={styles.welcome}>Espace Administrateur</h2>
        <p style={styles.date}>
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div style={styles.right}>
        {/* Notifications */}
        <button style={styles.iconBtn}>
          <Bell size={20} color="#94a3b8" />
          <span style={styles.notifBadge}>3</span>
        </button>

        {/* Profil admin */}
        <div style={styles.profilWrapper}>
          <button
            style={styles.profilBtn}
            onClick={() => setMenuOuvert(!menuOuvert)}
          >
            <div style={styles.avatar}>
              <User size={18} color="#0a0f0d" />
            </div>
            <div style={styles.profilInfo}>
              <p style={styles.profilNom}>{admin?.nom}</p>
              <p style={styles.profilRole}>{admin?.role}</p>
            </div>
            <ChevronDown size={16} color="#94a3b8" />
          </button>

          {menuOuvert && (
            <div style={styles.dropdown}>
              <button onClick={logout} style={styles.dropdownItem}>
                <LogOut size={16} />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  topbar: {
    height: "70px",
    background: "rgba(17, 26, 20, 0.6)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(16,185,129,0.2)",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  left: {
    display: "flex",
    flexDirection: "column",
  },
  welcome: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
  },
  date: {
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "capitalize",
    marginTop: "2px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  iconBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.2s",
  },
  notifBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#ef4444",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profilWrapper: {
    position: "relative",
  },
  profilBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px",
    background: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profilInfo: {
    textAlign: "left",
  },
  profilNom: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#fff",
  },
  profilRole: {
    fontSize: "11px",
    color: "#10b981",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  dropdown: {
    position: "absolute",
    top: "110%",
    right: 0,
    minWidth: "180px",
    background: "rgba(17,26,20,0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    padding: "8px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  dropdownItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};