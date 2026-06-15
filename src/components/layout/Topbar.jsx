import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  LogOut,
  Bell,
  ChevronDown,
  User,
  CreditCard,
  ArrowDownToLine,
  X,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import { formatXAF, formatDateTime } from "../../utils/format";

export default function Topbar() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  // ===== NOTIFICATIONS =====
  const [compteur, setCompteur] = useState({
    total: 0,
    rechargesEnAttente: 0,
    retraitsEnAttente: 0,
  });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [apercu, setApercu] = useState({ recharges: [], retraits: [] });
  const [loadingApercu, setLoadingApercu] = useState(false);
  const notifRef = useRef(null);

  // Fetch compteur (toutes les 30s)
  const fetchCompteur = async () => {
    try {
      const { data } = await api.get("/admin/notifications/compteur");
      setCompteur(data);
    } catch (error) {
      // silencieux
    }
  };

  useEffect(() => {
    fetchCompteur();
    const interval = setInterval(fetchCompteur, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fermer dropdown au clic hors zone
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch aperçu au clic
  const handleToggleNotif = async () => {
    if (!showNotifDropdown) {
      setLoadingApercu(true);
      try {
        const { data } = await api.get("/admin/notifications/apercu");
        setApercu(data);
      } catch (error) {
        // silencieux
      } finally {
        setLoadingApercu(false);
      }
    }
    setShowNotifDropdown(!showNotifDropdown);
  };

  const handleNavigate = (path) => {
    setShowNotifDropdown(false);
    navigate(path);
  };

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
        {/* ===== NOTIFICATIONS ===== */}
        <div ref={notifRef} style={styles.notifWrapper}>
          <button onClick={handleToggleNotif} style={styles.iconBtn}>
            <Bell
              size={20}
              color={compteur.total > 0 ? "#10b981" : "#94a3b8"}
              strokeWidth={compteur.total > 0 ? 2.5 : 2}
            />
            {compteur.total > 0 && (
              <span style={styles.notifBadge}>
                {compteur.total > 99 ? "99+" : compteur.total}
              </span>
            )}
          </button>

          {/* DROPDOWN NOTIFICATIONS */}
          {showNotifDropdown && (
            <div style={styles.notifDropdown}>
              <div style={styles.notifHeader}>
                <h3 style={styles.notifTitle}>Tâches en attente</h3>
                <button
                  onClick={() => setShowNotifDropdown(false)}
                  style={styles.closeBtn}
                >
                  <X size={16} color="#86efac" />
                </button>
              </div>

              {compteur.total === 0 ? (
                <div style={styles.emptyState}>
                  <CheckCircle2 size={32} color="#10b981" />
                  <p style={styles.emptyText}>Tout est à jour ! ✨</p>
                  <p style={styles.emptySub}>Aucune tâche en attente</p>
                </div>
              ) : (
                <>
                  {/* Stats rapides */}
                  <div style={styles.statsRow}>
                    <div
                      onClick={() => handleNavigate("/recharges")}
                      style={styles.statCard}
                    >
                      <CreditCard size={18} color="#10b981" />
                      <div>
                        <p style={styles.statLabel}>Recharges</p>
                        <p style={styles.statValue}>
                          {compteur.rechargesEnAttente}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => handleNavigate("/withdrawals")}
                      style={styles.statCard}
                    >
                      <ArrowDownToLine size={18} color="#f59e0b" />
                      <div>
                        <p style={styles.statLabel}>Retraits</p>
                        <p style={styles.statValue}>
                          {compteur.retraitsEnAttente}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu recharges */}
                  {apercu.recharges?.length > 0 && (
                    <div style={styles.section}>
                      <h4 style={styles.sectionTitle}>📥 Recharges récentes</h4>
                      {apercu.recharges.slice(0, 3).map((r) => (
                        <div
                          key={r._id}
                          onClick={() => handleNavigate("/recharges")}
                          style={styles.item}
                        >
                          <div style={styles.itemLeft}>
                            <p style={styles.itemName}>
                              {r.userId?.nom || "?"}
                            </p>
                            <p style={styles.itemMeta}>
                              {r.methode} • {formatDateTime(r.createdAt)}
                            </p>
                          </div>
                          <span style={styles.itemAmount}>
                            +{formatXAF(r.montant)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Aperçu retraits */}
                  {apercu.retraits?.length > 0 && (
                    <div style={styles.section}>
                      <h4 style={styles.sectionTitle}>📤 Retraits récents</h4>
                      {apercu.retraits.slice(0, 3).map((r) => (
                        <div
                          key={r._id}
                          onClick={() => handleNavigate("/withdrawals")}
                          style={styles.item}
                        >
                          <div style={styles.itemLeft}>
                            <p style={styles.itemName}>
                              {r.userId?.nom || "?"}
                            </p>
                            <p style={styles.itemMeta}>
                              {r.methode} • {formatDateTime(r.createdAt)}
                            </p>
                          </div>
                          <span style={styles.itemAmountRed}>
                            -{formatXAF(r.montant)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {loadingApercu && (
                    <p style={styles.loading}>Chargement...</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ===== PROFIL ADMIN ===== */}
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
  left: { display: "flex", flexDirection: "column" },
  welcome: { fontSize: "18px", fontWeight: "bold", color: "#fff" },
  date: {
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "capitalize",
    marginTop: "2px",
  },
  right: { display: "flex", alignItems: "center", gap: "16px" },

  // ===== NOTIFICATIONS =====
  notifWrapper: { position: "relative" },
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
    minWidth: "18px",
    height: "18px",
    borderRadius: "10px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    border: "2px solid rgba(17,26,20,0.95)",
    boxShadow: "0 0 8px rgba(239,68,68,0.5)",
  },
  notifDropdown: {
    position: "absolute",
    top: "110%",
    right: 0,
    width: "360px",
    maxHeight: "500px",
    background: "rgba(17,26,20,0.98)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "14px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
  },
  notifHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(16,185,129,0.15)",
  },
  notifTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#f0fdf4" },
  closeBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(16,185,129,0.1)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  emptyState: {
    padding: "30px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  emptyText: { fontSize: "0.95rem", fontWeight: 700, color: "#10b981" },
  emptySub: { fontSize: "0.78rem", color: "#86efac" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    padding: "12px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    background: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  statLabel: { fontSize: "0.7rem", color: "#86efac" },
  statValue: { fontSize: "1.2rem", fontWeight: 800, color: "#f0fdf4" },
  section: {
    padding: "12px",
    borderTop: "1px solid rgba(16,185,129,0.1)",
    maxHeight: "200px",
    overflowY: "auto",
  },
  sectionTitle: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#10b981",
    marginBottom: "8px",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "rgba(10,15,13,0.5)",
    borderRadius: "8px",
    marginBottom: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  itemLeft: { flex: 1, minWidth: 0 },
  itemName: { fontSize: "0.82rem", fontWeight: 600, color: "#f0fdf4" },
  itemMeta: { fontSize: "0.68rem", color: "#86efac", marginTop: "2px" },
  itemAmount: { fontSize: "0.85rem", fontWeight: 700, color: "#10b981" },
  itemAmountRed: { fontSize: "0.85rem", fontWeight: 700, color: "#f59e0b" },
  loading: {
    padding: "16px",
    textAlign: "center",
    color: "#86efac",
    fontSize: "0.78rem",
  },

  // ===== PROFIL =====
  profilWrapper: { position: "relative" },
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
  profilInfo: { textAlign: "left" },
  profilNom: { fontSize: "13px", fontWeight: "bold", color: "#fff" },
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