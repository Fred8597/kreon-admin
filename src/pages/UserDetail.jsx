import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Users as UsersIcon,
  TrendingUp,
  Activity,
  Gift,
  Wallet,
  KeyRound,
  Copy,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  formatXAF,
  formatDateTime,
  getTransactionColor,
  getTransactionLabel,
} from "../utils/format";
import toast from "react-hot-toast";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("filleuls");

  // ===== Reset password =====
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [nouveauPassword, setNouveauPassword] = useState("");

  useEffect(() => {
    charger();
  }, [id]);

  const charger = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      setData(data);
    } catch (error) {
      toast.error("Erreur de chargement");
      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  // ===== RESET PASSWORD =====
  const confirmerReset = async () => {
    setResetting(true);
    try {
      const { data: result } = await api.put(
        `/admin/users/${id}/reset-password`
      );
      setNouveauPassword(result.nouveauPassword);
      toast.success("Mot de passe réinitialisé ✅");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setResetting(false);
    }
  };

  const copierPassword = () => {
    navigator.clipboard.writeText(nouveauPassword);
    toast.success("Mot de passe copié !");
  };

  const fermerModalReset = () => {
    setShowResetModal(false);
    setNouveauPassword("");
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#10b981" }}>Chargement...</div>;
  }

  if (!data) return null;

  const { user, filleuls, investissements, transactions } = data;

  const getRoleBadge = (role) => {
    const stylesB = {
      admin: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
      moderator: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
      user: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
    };
    const s = stylesB[role] || stylesB.user;
    return (
      <span style={{
        padding: "6px 14px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
      }}>
        {role}
      </span>
    );
  };

  return (
    <div>
      {/* Bouton retour + reset password */}
      <div style={styles.topRow}>
        <button onClick={() => navigate("/users")} style={styles.backBtn}>
          <ArrowLeft size={18} /> Retour à la liste
        </button>

        <button
          onClick={() => setShowResetModal(true)}
          style={styles.resetBtnTop}
        >
          <KeyRound size={16} /> Réinitialiser mot de passe
        </button>
      </div>

      {/* Header user */}
      <div style={styles.userHeader}>
        <div style={styles.avatarLarge}>
          {user.nom.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.nameRow}>
            <h1 style={styles.userName}>{user.nom}</h1>
            {getRoleBadge(user.role)}
            {user.estActif ? (
              <span style={styles.activeBadge}>● Actif</span>
            ) : (
              <span style={styles.inactiveBadge}>● Suspendu</span>
            )}
          </div>
          <div style={styles.contactRow}>
            <span style={styles.contactItem}>
              <Mail size={14} /> {user.email}
            </span>
            <span style={styles.contactItem}>
              <Phone size={14} /> {user.telephone}
            </span>
            <span style={styles.contactItem}>
              <Calendar size={14} /> Inscrit le {formatDateTime(user.createdAt)}
            </span>
          </div>
          <div style={styles.codeRow}>
            <span style={styles.codeLabel}>Code parrainage :</span>
            <span style={styles.codeValue}>{user.codeParrainage}</span>
            {user.parrainId && (
              <span style={styles.parrainInfo}>
                Parrainé par : <strong>{user.parrainId.nom}</strong> ({user.parrainId.codeParrainage})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderColor: "rgba(16,185,129,0.3)" }}>
          <div style={styles.kpiTop}>
            <Wallet size={20} color="#10b981" />
            <span style={styles.kpiLabel}>Solde principal</span>
          </div>
          <p style={{ ...styles.kpiValue, color: "#10b981" }}>
            {formatXAF(user.soldePrincipal)}
          </p>
        </div>

        <div style={{ ...styles.kpiCard, borderColor: "rgba(245,158,11,0.3)" }}>
          <div style={styles.kpiTop}>
            <Gift size={20} color="#f59e0b" />
            <span style={styles.kpiLabel}>Gains parrainage</span>
          </div>
          <p style={{ ...styles.kpiValue, color: "#f59e0b" }}>
            {formatXAF(user.totalGainsParrainage)}
          </p>
        </div>

        <div style={{ ...styles.kpiCard, borderColor: "rgba(6,182,212,0.3)" }}>
          <div style={styles.kpiTop}>
            <UsersIcon size={20} color="#06b6d4" />
            <span style={styles.kpiLabel}>Filleuls</span>
          </div>
          <p style={{ ...styles.kpiValue, color: "#06b6d4" }}>
            {user.totalInvites}
          </p>
        </div>

        <div style={{ ...styles.kpiCard, borderColor: "rgba(139,92,246,0.3)" }}>
          <div style={styles.kpiTop}>
            <TrendingUp size={20} color="#8b5cf6" />
            <span style={styles.kpiLabel}>Investissements</span>
          </div>
          <p style={{ ...styles.kpiValue, color: "#8b5cf6" }}>
            {investissements.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["filleuls", "investissements", "transactions"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.tab,
              ...(tab === t ? styles.tabActive : {}),
            }}
          >
            {t === "filleuls" && `👥 Filleuls (${filleuls.length})`}
            {t === "investissements" && `📊 Investissements (${investissements.length})`}
            {t === "transactions" && `💸 Transactions (${transactions.length})`}
          </button>
        ))}
      </div>

      {/* Contenu tab */}
      <div style={styles.tabContent}>
        {tab === "filleuls" && (
          <div>
            {filleuls.length === 0 ? (
              <div style={styles.empty}>Aucun filleul</div>
            ) : (
              filleuls.map((f) => (
                <div key={f._id} style={styles.row}>
                  <div style={styles.avatar}>{f.nom.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.rowName}>{f.nom}</p>
                    <p style={styles.rowSub}>{f.email} • {f.telephone}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={styles.rowDate}>{formatDateTime(f.createdAt)}</p>
                    <p style={styles.rowMeta}>{f.totalInvites} filleul(s)</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "investissements" && (
          <div>
            {investissements.length === 0 ? (
              <div style={styles.empty}>Aucun investissement</div>
            ) : (
              investissements.map((inv) => (
                <div key={inv._id} style={styles.investCard}>
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.investName}>{inv.nomProduit}</h3>
                    <div style={styles.investMeta}>
                      <span>📅 {inv.dureeJours} jours</span>
                      <span>📈 ROI {inv.roiPourcentage}%</span>
                      <span>🗓 Expire : {formatDateTime(inv.dateExpiration)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={styles.investInvest}>
                      Investi : <strong>{formatXAF(inv.montantInvesti)}</strong>
                    </p>
                    <p style={styles.investRecv}>
                      À recevoir : <strong style={{ color: "#10b981" }}>{formatXAF(inv.montantTotalARecevoir)}</strong>
                    </p>
                    <span style={{
                      ...styles.statutBadge,
                      background: inv.statut === "ACTIF" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                      color: inv.statut === "ACTIF" ? "#f59e0b" : "#10b981",
                    }}>
                      {inv.statut}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "transactions" && (
          <div>
            {transactions.length === 0 ? (
              <div style={styles.empty}>Aucune transaction</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx._id} style={styles.txRow}>
                  <div style={{
                    ...styles.txBadge,
                    background: getTransactionColor(tx.type) + "20",
                    color: getTransactionColor(tx.type),
                  }}>
                    {getTransactionLabel(tx.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.txDesc}>{tx.description}</p>
                    <p style={styles.txDate}>{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      ...styles.txAmount,
                      color: tx.montant >= 0 ? "#10b981" : "#ef4444",
                    }}>
                      {tx.montant >= 0 ? "+" : ""}{formatXAF(tx.montant)}
                    </p>
                    <p style={styles.txSolde}>Solde : {formatXAF(tx.soldeApres)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ===== MODAL RESET PASSWORD ===== */}
      {showResetModal && (
        <div style={styles.modalOverlay} onClick={fermerModalReset}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                🔐 Réinitialiser le mot de passe
              </h3>
              <button onClick={fermerModalReset} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {!nouveauPassword ? (
              <>
                <div style={styles.warningBox}>
                  <p style={styles.warningText}>
                    ⚠️ Vous êtes sur le point de réinitialiser le mot de passe de :
                  </p>
                  <p style={styles.userToReset}>{user.nom}</p>
                  <p style={styles.warningSubtext}>
                    📞 {user.telephone} • ✉️ {user.email}
                  </p>
                </div>

                <div style={styles.infoBox}>
                  <p style={styles.infoText}>
                    Un mot de passe temporaire sera généré. <strong>Notez-le et transmettez-le au user en sécurité.</strong>
                    Il devra le changer immédiatement après reconnexion.
                  </p>
                </div>

                <div style={styles.modalActions}>
                  <button onClick={fermerModalReset} style={styles.cancelBtn}>
                    Annuler
                  </button>
                  <button
                    onClick={confirmerReset}
                    disabled={resetting}
                    style={{
                      ...styles.resetBtnModal,
                      opacity: resetting ? 0.6 : 1,
                      cursor: resetting ? "not-allowed" : "pointer",
                    }}
                  >
                    {resetting ? "Réinitialisation..." : "🔐 Réinitialiser"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.successBox}>
                  <CheckCircle2 size={32} color="#10b981" />
                  <p style={styles.successTitle}>Mot de passe réinitialisé !</p>
                  <p style={styles.successSub}>
                    Transmettez ce mot de passe à {user.nom} :
                  </p>
                </div>

                <div style={styles.passwordDisplay}>
                  <span style={styles.passwordText}>{nouveauPassword}</span>
                  <button onClick={copierPassword} style={styles.copyBtn}>
                    <Copy size={16} color="#10b981" /> Copier
                  </button>
                </div>

                <div style={styles.instructionsBox}>
                  <p style={styles.instructionTitle}>📢 Message à envoyer :</p>
                  <div style={styles.messageBox}>
                    Bonjour {user.nom}, votre mot de passe a été réinitialisé.
                    <br />
                    Connectez-vous avec : <strong>{nouveauPassword}</strong>
                    <br />
                    Changez-le immédiatement depuis Profil → Mot de passe.
                  </div>
                </div>

                <div style={styles.warningBoxFinal}>
                  ⚠️ Ce mot de passe ne sera plus visible après fermeture. Notez-le bien !
                </div>

                <button
                  onClick={fermerModalReset}
                  style={{ ...styles.cancelBtn, width: "100%", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#0a0f0d" }}
                >
                  J'ai bien noté, fermer
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "8px",
    color: "#10b981",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  resetBtnTop: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 18px",
    background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    boxShadow: "0 4px 15px rgba(139,92,246,0.3)",
  },
  userHeader: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    padding: "24px",
    background: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "16px",
    marginBottom: "20px",
  },
  avatarLarge: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0a0f0d",
    fontSize: "32px",
    fontWeight: "bold",
    flexShrink: 0,
  },
  nameRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" },
  userName: { color: "#fff", fontSize: "26px", fontWeight: "bold" },
  activeBadge: { padding: "4px 10px", background: "rgba(16,185,129,0.15)", color: "#10b981", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
  inactiveBadge: { padding: "4px 10px", background: "rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
  contactRow: { display: "flex", gap: "16px", marginBottom: "8px", flexWrap: "wrap" },
  contactItem: { display: "flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "13px" },
  codeRow: { display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", flexWrap: "wrap" },
  codeLabel: { color: "#94a3b8", fontSize: "12px" },
  codeValue: { padding: "4px 10px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", fontSize: "12px", fontWeight: "bold", borderRadius: "6px", fontFamily: "monospace" },
  parrainInfo: { color: "#94a3b8", fontSize: "12px", marginLeft: "12px" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" },
  kpiCard: { padding: "20px", background: "rgba(17,26,20,0.6)", border: "1px solid", borderRadius: "12px" },
  kpiTop: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  kpiLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: "600" },
  kpiValue: { fontSize: "24px", fontWeight: "bold" },
  tabs: { display: "flex", gap: "8px", marginBottom: "16px" },
  tab: { padding: "10px 18px", background: "rgba(17,26,20,0.6)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  tabActive: { background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))", color: "#10b981", borderColor: "rgba(16,185,129,0.4)" },
  tabContent: { background: "rgba(17,26,20,0.6)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "16px", padding: "20px", minHeight: "200px" },
  empty: { padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" },
  row: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "10px", background: "rgba(10,15,13,0.4)", marginBottom: "8px" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #34d399)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0f0d", fontWeight: "bold" },
  rowName: { color: "#fff", fontSize: "14px", fontWeight: "600" },
  rowSub: { color: "#94a3b8", fontSize: "12px", marginTop: "2px" },
  rowDate: { color: "#94a3b8", fontSize: "11px" },
  rowMeta: { color: "#10b981", fontSize: "11px", marginTop: "2px" },
  investCard: { display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "rgba(10,15,13,0.4)", borderRadius: "12px", marginBottom: "10px" },
  investName: { color: "#fff", fontSize: "15px", fontWeight: "bold", marginBottom: "6px" },
  investMeta: { display: "flex", gap: "16px", color: "#94a3b8", fontSize: "12px" },
  investInvest: { color: "#fff", fontSize: "13px" },
  investRecv: { color: "#fff", fontSize: "13px", marginTop: "4px" },
  statutBadge: { display: "inline-block", marginTop: "6px", padding: "3px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" },
  txRow: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(10,15,13,0.4)", borderRadius: "10px", marginBottom: "8px" },
  txBadge: { padding: "5px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", flexShrink: 0 },
  txDesc: { color: "#fff", fontSize: "13px", fontWeight: "500" },
  txDate: { color: "#94a3b8", fontSize: "11px", marginTop: "2px" },
  txAmount: { fontSize: "14px", fontWeight: "bold" },
  txSolde: { color: "#94a3b8", fontSize: "10px", marginTop: "2px" },
  // ===== MODAL =====
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(8px)" },
  modal: { background: "rgba(17,26,20,0.95)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  modalTitle: { color: "#fff", fontSize: "18px", fontWeight: "bold" },
  closeBtn: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" },
  modalActions: { display: "flex", gap: "12px", marginTop: "20px" },
  cancelBtn: { flex: 1, padding: "12px", background: "rgba(100,116,139,0.2)", border: "1px solid rgba(100,116,139,0.3)", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600" },
  warningBox: { padding: "16px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", marginBottom: "14px", textAlign: "center" },
  warningText: { color: "#cbd5e1", fontSize: "13px", marginBottom: "10px" },
  userToReset: { color: "#8b5cf6", fontSize: "20px", fontWeight: "bold", marginBottom: "6px" },
  warningSubtext: { color: "#94a3b8", fontSize: "12px" },
  infoBox: { padding: "12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "10px", marginBottom: "14px" },
  infoText: { color: "#fbbf24", fontSize: "12px", lineHeight: 1.5 },
  resetBtnModal: { flex: 1, padding: "12px", background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: "bold" },
  successBox: { padding: "20px", background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.05))", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "14px", marginBottom: "16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  successTitle: { color: "#10b981", fontSize: "16px", fontWeight: "bold" },
  successSub: { color: "#86efac", fontSize: "12px" },
  passwordDisplay: { display: "flex", alignItems: "center", gap: "10px", padding: "16px", background: "rgba(16,185,129,0.1)", border: "2px dashed rgba(16,185,129,0.5)", borderRadius: "12px", marginBottom: "16px" },
  passwordText: { flex: 1, color: "#10b981", fontSize: "20px", fontWeight: "bold", fontFamily: "monospace", letterSpacing: "2px", textAlign: "center" },
  copyBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "8px", color: "#10b981", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },
  instructionsBox: { marginBottom: "16px" },
  instructionTitle: { color: "#86efac", fontSize: "12px", fontWeight: "bold", marginBottom: "8px" },
  messageBox: { padding: "12px", background: "rgba(10,15,13,0.5)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px", color: "#cbd5e1", fontSize: "12px", lineHeight: 1.6, fontStyle: "italic" },
  warningBoxFinal: { padding: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", fontSize: "11px", textAlign: "center", marginBottom: "14px" },
};