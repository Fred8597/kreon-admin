import { useEffect, useState } from "react";
import api from "../services/api";
import {
  CreditCard,
  Check,
  X,
  Eye,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import { formatXAF, formatDateTime } from "../utils/format";
import toast from "react-hot-toast";

export default function Recharges() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("EN_ATTENTE");

  // Modal refus
  const [modalRefus, setModalRefus] = useState(null);
  const [commentaire, setCommentaire] = useState("");

  // Modal preuve
  const [modalPreuve, setModalPreuve] = useState(null);

  useEffect(() => {
    charger();
  }, [filtre]);

  const charger = async () => {
    setLoading(true);
    try {
      const params = filtre ? { statut: filtre } : {};
      const { data } = await api.get("/admin/recharges", { params });
      setRecharges(data);
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const valider = async (r) => {
    if (!confirm(`Valider la recharge de ${formatXAF(r.montant)} de ${r.userId.nom} ?`))
      return;
    try {
      await api.put(`/admin/recharges/${r._id}/valider`);
      toast.success("Recharge validée et solde crédité");
      charger();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const ouvrirRefus = (r) => {
    setModalRefus(r);
    setCommentaire("");
  };

  const refuser = async () => {
    try {
      await api.put(`/admin/recharges/${modalRefus._id}/refuser`, {
        commentaire,
      });
      toast.success("Recharge refusée");
      setModalRefus(null);
      charger();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const getStatutBadge = (statut) => {
    const c = {
      EN_ATTENTE: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "En attente" },
      VALIDEE: { bg: "rgba(16,185,129,0.15)", color: "#10b981", label: "Validée" },
      REFUSEE: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Refusée" },
    };
    const s = c[statut] || c.EN_ATTENTE;
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "bold",
        background: s.bg,
        color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  const getMethodeBadge = (methode) => {
    const c = {
      MTN: { bg: "#FFCC00", color: "#000" },
      ORANGE: { bg: "#FF6600", color: "#fff" },
      AUTRE: { bg: "#94a3b8", color: "#fff" },
    };
    const s = c[methode] || c.AUTRE;
    return (
      <span style={{
        padding: "3px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: "bold",
        background: s.bg,
        color: s.color,
      }}>
        {methode}
      </span>
    );
  };

  // Stats rapides
  const stats = {
    enAttente: recharges.filter((r) => r.statut === "EN_ATTENTE").length,
    montantEnAttente: recharges
      .filter((r) => r.statut === "EN_ATTENTE")
      .reduce((sum, r) => sum + r.montant, 0),
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>💵 Recharges</h1>
          <p style={styles.subtitle}>
            {recharges.length} recharge(s) affichée(s)
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, borderColor: "rgba(245,158,11,0.3)" }}>
          <p style={styles.statLabel}>⏳ En attente</p>
          <p style={{ ...styles.statValue, color: "#f59e0b" }}>{stats.enAttente}</p>
          <p style={styles.statSub}>{formatXAF(stats.montantEnAttente)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={styles.filters}>
        <Filter size={16} color="#94a3b8" />
        <button
          onClick={() => setFiltre("EN_ATTENTE")}
          style={{
            ...styles.filterBtn,
            ...(filtre === "EN_ATTENTE" ? styles.filterBtnActive : {}),
          }}
        >
          En attente
        </button>
        <button
          onClick={() => setFiltre("VALIDEE")}
          style={{
            ...styles.filterBtn,
            ...(filtre === "VALIDEE" ? styles.filterBtnActive : {}),
          }}
        >
          Validées
        </button>
        <button
          onClick={() => setFiltre("REFUSEE")}
          style={{
            ...styles.filterBtn,
            ...(filtre === "REFUSEE" ? styles.filterBtnActive : {}),
          }}
        >
          Refusées
        </button>
        <button
          onClick={() => setFiltre("")}
          style={{
            ...styles.filterBtn,
            ...(filtre === "" ? styles.filterBtnActive : {}),
          }}
        >
          Toutes
        </button>
      </div>

      {/* Tableau */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loading}>Chargement...</div>
        ) : recharges.length === 0 ? (
          <div style={styles.empty}>
            <CreditCard size={48} color="#64748b" />
            <p>Aucune recharge</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Utilisateur</th>
                <th style={styles.th}>Montant</th>
                <th style={styles.th}>Méthode</th>
                <th style={styles.th}>Numéro / Réf</th>
                <th style={styles.th}>Preuve</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recharges.map((r) => (
                <tr key={r._id} style={styles.tr}>
                  <td style={styles.td}>
                    <p style={styles.userName}>{r.userId?.nom || "—"}</p>
                    <p style={styles.userSub}>{r.userId?.email}</p>
                  </td>
                  <td style={styles.td}>
                    <p style={{ ...styles.text, color: "#10b981", fontWeight: "bold", fontSize: "14px" }}>
                      {formatXAF(r.montant)}
                    </p>
                  </td>
                  <td style={styles.td}>{getMethodeBadge(r.methode)}</td>
                  <td style={styles.td}>
                    <p style={styles.text}>{r.numeroPayeur}</p>
                    <p style={styles.textSmall}>{r.referencePaiement || "—"}</p>
                  </td>
                  <td style={styles.td}>
                    {r.preuvePaiement ? (
                      <button
                        onClick={() => setModalPreuve(r.preuvePaiement)}
                        style={styles.preuveBtn}
                      >
                        <ImageIcon size={14} />
                        Voir
                      </button>
                    ) : (
                      <span style={styles.textSmall}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>{getStatutBadge(r.statut)}</td>
                  <td style={styles.td}>
                    <p style={styles.textSmall}>{formatDateTime(r.createdAt)}</p>
                  </td>
                  <td style={styles.td}>
                    {r.statut === "EN_ATTENTE" ? (
                      <div style={styles.actions}>
                        <button
                          onClick={() => valider(r)}
                          style={{ ...styles.actionBtn, ...styles.validerBtn }}
                          title="Valider"
                        >
                          <Check size={14} /> Valider
                        </button>
                        <button
                          onClick={() => ouvrirRefus(r)}
                          style={{ ...styles.actionBtn, ...styles.refuserBtn }}
                          title="Refuser"
                        >
                          <X size={14} /> Refuser
                        </button>
                      </div>
                    ) : (
                      <span style={styles.textSmall}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL Preuve de paiement */}
      {modalPreuve && (
        <div style={styles.modalOverlay} onClick={() => setModalPreuve(null)}>
          <div style={styles.modalImage} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModalPreuve(null)} style={styles.closeImageBtn}>
              <X size={24} />
            </button>
            <img src={modalPreuve} alt="Preuve" style={styles.preuveImage} />
            <p style={styles.preuveCaption}>Preuve de paiement</p>
          </div>
        </div>
      )}

      {/* MODAL Refus */}
      {modalRefus && (
        <div style={styles.modalOverlay} onClick={() => setModalRefus(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>❌ Refuser la recharge</h3>
              <button onClick={() => setModalRefus(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <p style={styles.modalInfo}>
              Recharge de <strong>{formatXAF(modalRefus.montant)}</strong> par{" "}
              <strong>{modalRefus.userId.nom}</strong>
            </p>

            <div style={styles.field}>
              <label style={styles.label}>Raison du refus</label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ex: Preuve illisible, montant incorrect..."
                style={{ ...styles.input, minHeight: "80px" }}
              />
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setModalRefus(null)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button onClick={refuser} style={styles.refuserBtnLarge}>
                Refuser la recharge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
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
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    padding: "16px 20px",
    background: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "12px",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  statSub: {
    color: "#94a3b8",
    fontSize: "11px",
  },
  filters: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  filterBtn: {
    padding: "8px 14px",
    background: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "8px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  filterBtnActive: {
    background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))",
    color: "#10b981",
    borderColor: "rgba(16,185,129,0.4)",
  },
  tableCard: {
    background: "rgba(17,26,20,0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "rgba(10,15,13,0.5)",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  tr: {
    borderTop: "1px solid rgba(16,185,129,0.05)",
  },
  td: {
    padding: "14px 16px",
    color: "#fff",
    fontSize: "13px",
  },
  text: {
    color: "#fff",
    fontSize: "13px",
  },
  textSmall: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },
  userName: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  userSub: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },
  preuveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    background: "rgba(6,182,212,0.1)",
    border: "1px solid rgba(6,182,212,0.3)",
    borderRadius: "6px",
    color: "#06b6d4",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },
  actions: {
    display: "flex",
    gap: "6px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "bold",
  },
  validerBtn: {
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#0a0f0d",
  },
  refuserBtn: {
    background: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.3)",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#10b981",
  },
  empty: {
    padding: "60px",
    textAlign: "center",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(8px)",
    padding: "20px",
  },
  modal: {
    background: "rgba(17,26,20,0.95)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "20px",
    padding: "28px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
  },
  modalImage: {
    position: "relative",
    maxWidth: "90vw",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  closeImageBtn: {
    position: "absolute",
    top: "-40px",
    right: "0",
    background: "rgba(239,68,68,0.9)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  preuveImage: {
    maxWidth: "100%",
    maxHeight: "80vh",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  preuveCaption: {
    color: "#fff",
    marginTop: "12px",
    fontSize: "14px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  modalTitle: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
  },
  modalInfo: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "20px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "rgba(100,116,139,0.2)",
    border: "1px solid rgba(100,116,139,0.3)",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  refuserBtnLarge: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};