import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  Gift,
  ArrowUp,
  Activity,
} from "lucide-react";
import { formatXAF, formatDateTime, getTransactionColor, getTransactionLabel } from "../utils/format";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerDashboard();
  }, []);

  const chargerDashboard = async () => {
    try {
      const { data } = await api.get("/admin/dashboard");
      setStats(data);
    } catch (error) {
      toast.error("Erreur de chargement du dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: "#10b981", textAlign: "center", padding: "40px" }}>
        Chargement des statistiques...
      </div>
    );
  }

  if (!stats) {
    return <div style={{ color: "#ef4444" }}>Erreur de chargement</div>;
  }

  // 6 KPIs principaux
  const kpis = [
    {
      label: "Utilisateurs",
      value: stats.utilisateurs.total,
      sub: `+${stats.utilisateurs.nouveaux24h} aujourd'hui`,
      icon: Users,
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
    },
    {
      label: "Total investi",
      value: formatXAF(stats.investissements.montantTotalInvesti),
      sub: `${stats.investissements.actifs} actifs`,
      icon: TrendingUp,
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    },
    {
      label: "ROI distribué",
      value: formatXAF(stats.investissements.roiTotalDistribue),
      sub: `${stats.investissements.termines} terminés`,
      icon: DollarSign,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    {
      label: "Recharges en attente",
      value: stats.recharges.enAttente,
      sub: `${formatXAF(stats.recharges.montantTotalValide)} validées`,
      icon: CreditCard,
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    },
    {
      label: "Retraits en attente",
      value: stats.retraits.enAttente,
      sub: `${formatXAF(stats.retraits.montantTotalPaye)} payés`,
      icon: Wallet,
      color: "#ef4444",
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    },
    {
      label: "Commissions",
      value: formatXAF(stats.commissions.totalDistribuees),
      sub: "Parrainage 4 niveaux",
      icon: Gift,
      color: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899, #db2777)",
    },
  ];

  return (
    <div>
      {/* Titre */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Dashboard</h1>
          <p style={styles.subtitle}>
            Vue d'ensemble de la plateforme KREON
          </p>
        </div>
        <button onClick={chargerDashboard} style={styles.refreshBtn}>
          🔄 Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div style={styles.kpiGrid}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} style={styles.kpiCard}>
              <div style={styles.kpiTop}>
                <div style={{ ...styles.kpiIconBox, background: kpi.gradient }}>
                  <Icon size={22} color="#0a0f0d" />
                </div>
                <span style={{ ...styles.kpiBadge, color: kpi.color }}>
                  <ArrowUp size={12} /> Live
                </span>
              </div>
              <p style={styles.kpiLabel}>{kpi.label}</p>
              <h2 style={styles.kpiValue}>{kpi.value}</h2>
              <p style={{ ...styles.kpiSub, color: kpi.color }}>{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Tableaux */}
      <div style={styles.twoCols}>
        {/* Derniers inscrits */}
        <div style={styles.tableCard}>
          <h3 style={styles.tableTitle}>
            <Users size={18} color="#10b981" /> Derniers inscrits
          </h3>
          <div style={styles.tableList}>
            {stats.recents.inscrits.length === 0 ? (
              <p style={styles.empty}>Aucun inscrit récent</p>
            ) : (
              stats.recents.inscrits.map((u) => (
                <div key={u._id} style={styles.userRow}>
                  <div style={styles.userAvatar}>
                    {u.nom.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.userName}>{u.nom}</p>
                    <p style={styles.userEmail}>{u.email}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={styles.userDate}>{formatDateTime(u.createdAt)}</p>
                    {u.totalInvites > 0 && (
                      <span style={styles.invitesBadge}>
                        {u.totalInvites} filleul(s)
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dernières transactions */}
        <div style={styles.tableCard}>
          <h3 style={styles.tableTitle}>
            <Activity size={18} color="#10b981" /> Dernières transactions
          </h3>
          <div style={styles.tableList}>
            {stats.recents.transactions.length === 0 ? (
              <p style={styles.empty}>Aucune transaction récente</p>
            ) : (
              stats.recents.transactions.map((tx) => (
                <div key={tx._id} style={styles.txRow}>
                  <div
                    style={{
                      ...styles.txTypeBadge,
                      background: getTransactionColor(tx.type) + "20",
                      color: getTransactionColor(tx.type),
                    }}
                  >
                    {getTransactionLabel(tx.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.txUser}>{tx.userId?.nom || "Inconnu"}</p>
                    <p style={styles.txDate}>{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <p
                    style={{
                      ...styles.txAmount,
                      color: tx.montant >= 0 ? "#10b981" : "#ef4444",
                    }}
                  >
                    {tx.montant >= 0 ? "+" : ""}
                    {formatXAF(tx.montant)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "4px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
  },
  refreshBtn: {
    padding: "10px 20px",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "10px",
    color: "#10b981",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  kpiCard: {
    background: "rgba(17,26,20,0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "16px",
    padding: "20px",
    transition: "all 0.3s",
  },
  kpiTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  kpiIconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiBadge: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    fontSize: "11px",
    fontWeight: "bold",
    background: "rgba(255,255,255,0.05)",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  kpiLabel: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px",
  },
  kpiValue: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "4px",
  },
  kpiSub: {
    fontSize: "12px",
    fontWeight: "500",
  },
  twoCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  tableCard: {
    background: "rgba(17,26,20,0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "16px",
    padding: "24px",
  },
  tableTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tableList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  empty: {
    color: "#64748b",
    fontSize: "13px",
    textAlign: "center",
    padding: "20px",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(10,15,13,0.4)",
    transition: "all 0.2s",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0a0f0d",
    fontWeight: "bold",
    fontSize: "14px",
  },
  userName: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  userEmail: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },
  userDate: {
    color: "#94a3b8",
    fontSize: "11px",
  },
  invitesBadge: {
    display: "inline-block",
    marginTop: "4px",
    fontSize: "10px",
    color: "#10b981",
    background: "rgba(16,185,129,0.1)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  txRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(10,15,13,0.4)",
  },
  txTypeBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  txUser: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  txDate: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },
  txAmount: {
    fontSize: "14px",
    fontWeight: "bold",
  },
};