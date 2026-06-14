import { useEffect, useState } from "react";
import api from "../services/api";
import { Wallet, Check, X, Filter } from "lucide-react";
import { formatXAF, formatDateTime } from "../utils/format";
import toast from "react-hot-toast";

export default function Withdrawals() {
  const [retraits, setRetraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("EN_ATTENTE");

  // Modals
  const [modalValider, setModalValider] = useState(null);
  const [referencePaiement, setReferencePaiement] = useState("");

  const [modalRefus, setModalRefus] = useState(null);
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    charger();
  }, [filtre]);

  const charger = async () => {
    setLoading(true);
    try {
      const params = filtre ? { statut: filtre } : {};
      const { data } = await api.get("/admin/withdrawals", { params });
      setRetraits(data);
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const ouvrirValidation = (r) => {
    setModalValider(r);
    setReferencePaiement("");
  };

  const valider = async () => {
    try {
      await api.put(`/admin/withdrawals/${modalValider._id}/valider`, {
        referencePaiement,
      });
      toast.success("Retrait validé et marqué comme payé");
      setModalValider(null);
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
      await api.put(`/admin/withdrawals/${modalRefus._id}/refuser`, {
        commentaire,
      });
      toast.success("Retrait refusé et utilisateur remboursé");
      setModalRefus(null);
      charger();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const getStatutBadge = (statut) => {
    const c = {
      EN_ATTENTE: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "En attente" },
      VALIDEE: { bg: "rgba(6,182,212,0.15)", color: "#06b6d4", label: "Validée" },
      PAYEE: { bg: "rgba(16,185,129,0.15)", color: "#10b981", label: "Payée" },
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
    };
    const s = c[methode] || { bg: "#94a3b8", color: "#fff" };
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

  const stats = {
    enAttente: retraits.filter((r) => r.statut === "EN_ATTENTE").length,
    montantEnAttente: retraits
      .filter((r) => r.statut === "EN_ATTENTE")
      .reduce((sum, r) => sum + r.montant, 0),
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>💸 Retraits</h1>
          <p style={styles.subtitle}>
            {retraits.length} retrait(s) affiché(s)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, borderColor: "rgba(245,158,11,0.3)" }}>
          <p style={styles.statLabel}>⏳ À traiter</p>
          <p style={{ ...styles.statValue, color: "#f59e0b" }}>{stats.enAttente}</p>
          <p style={styles.statSub}>{formatXAF(stats.montantEnAttente)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={styles.filters}>
        <Filter size={16} color="#94a3b8" />
        {["EN_ATTENTE", "PAYEE", "REFUSEE", ""].map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            style={{
              ...styles.filterBtn,
              ...(filtre === f ? styles.filterBtnActive : {}),
            }}
          >
            {f === "EN_ATTENTE" ? "En attente" :
             f === "PAYEE" ? "Payés" :
             f === "REFUSEE" ? "Refusés" : "Tous"}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loading}>Chargement...</div>
        ) : retraits.length === 0 ? (
          <div style={styles.empty}>
            <Wallet size={48} color="#64748b" />
            <p>Aucun retrait</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Utilisateur</th>
                <th style={styles.th}>Montant</th>
                <th style={styles.th}>Méthode</th>
                <th style={styles.th}>Bénéficiaire</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Référence</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {retraits.map((r) => (
                <tr key={r._id} style={styles.tr}>
                  <td style={styles.td}>
                    <p style={styles.userName}>{r.userId?.nom || "—"}</p>
                    <p style={styles.userSub}>{r.userId?.telephone}</p>
                  </td>
                  <td style={styles.td}>
                    <p style={{ color: "#ef4444", fontWeight: "bold", fontSize: "14px" }}>
                      -{formatXAF(r.montant)}
                    </p>
                  </td>
                  <td style={styles.td}>{getMethodeBadge(r.methode)}</td>
                  <td style={styles.td}>
                    <p style={styles.numeroBenef}>{r.numeroBeneficiaire}</p>
                  </td>
                  <td style={styles.td}>{getStatutBadge(r.statut)}</td>
                  <td style={styles.td}>
                    {r.referencePaiement ? (
                      <span style={styles.refTag}>{r.referencePaiement}</span>
                    ) : (
                      <span style={styles.textSmall}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <p style={styles.textSmall}>{formatDateTime(r.createdAt)}</p>
                  </td>
                  <td style={styles.td}>
                    {r.statut === "EN_ATTENTE" ? (
                      <div style={styles.actions}>
                        <button
                          onClick={() => ouvrirValidation(r)}
                          style={{ ...styles.actionBtn, ...styles.validerBtn }}
                        >
                          <Check size={14} /> Payer
                        </button>
                        <button
                          onClick={() => ouvrirRefus(r)}
                          style={{ ...styles.actionBtn, ...styles.refuserBtn }}
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

      {/* MODAL Validation */}
      {modalValider && (
        <div style={styles.modalOverlay} onClick={() => setModalValider(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>✅ Valider le retrait</h3>
              <button onClick={() => setModalValider(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.infoBox}>
              <p style={styles.infoLine}>
                <strong>Utilisateur :</strong> {modalValider.userId.nom}
              </p>
              <p style={styles.infoLine}>
                <strong>Montant :</strong>{" "}
                <span style={{ color: "#10b981", fontWeight: "bold" }}>
                  {formatXAF(modalValider.montant)}
                </span>
              </p>
              <p style={styles.infoLine}>
                <strong>Numéro à payer :</strong>{" "}
                <span style={styles.numeroHighlight}>
                  {modalValider.numeroBeneficiaire}
                </span>
              </p>
              <p style={styles.infoLine}>
                <strong>Méthode :</strong> {modalValider.methode}
              </p>
            </div>

            <div style={styles.warning}>
              ⚠️ Effectue le paiement Mobile Money manuellement, puis renseigne la référence ci-dessous.
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Référence du paiement</label>
              <input
                type="text"
                value={referencePaiement}
                onChange={(e) => setReferencePaiement(e.target.value)}
                placeholder="Ex: MP251212.0001.A12345"
                style={styles.input}
              />
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setModalValider(null)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button onClick={valider} style={styles.confirmBtn}>
                Marquer comme payé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL Refus */}
      {modalRefus && (
        <div style={styles.modalOverlay} onClick={() => setModalRefus(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>❌ Refuser le retrait</h3>
              <button onClick={() => setModalRefus(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.infoBox}>
              <p style={styles.infoLine}>
                Retrait de <strong>{formatXAF(modalRefus.montant)}</strong> par{" "}
                <strong>{modalRefus.userId.nom}</strong>
              </p>
              <p style={{ ...styles.infoLine, color: "#10b981", marginTop: "8px" }}>
                ℹ️ L'utilisateur sera automatiquement remboursé.
              </p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Raison du refus</label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ex: Numéro incorrect, fonds suspects..."
                style={{ ...styles.input, minHeight: "80px" }}
              />
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setModalRefus(null)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button onClick={refuser} style={styles.refuserBtnLarge}>
                Refuser et rembourser
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
  textSmall: {
    color: "#94a3b8",
    fontSize: "11px",
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
  numeroBenef: {
    color: "#06b6d4",
    fontFamily: "monospace",
    fontSize: "13px",
    fontWeight: "600",
  },
  refTag: {
    padding: "3px 8px",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "4px",
    color: "#10b981",
    fontSize: "10px",
    fontFamily: "monospace",
    fontWeight: "bold",
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
  loading: { padding: "40px", textAlign: "center", color: "#10b981" },
  empty: {
    padding: "60px",
    textAlign: "center",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(8px)",
    padding: "20px",
  },
  modal: {
    background: "rgba(17,26,20,0.95)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "20px",
    padding: "28px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
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
  infoBox: {
    padding: "16px",
    background: "rgba(10,15,13,0.5)",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  infoLine: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "6px",
  },
  numeroHighlight: {
    color: "#06b6d4",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "15px",
  },
  warning: {
    padding: "12px",
    background: "rgba(245,158,11,0.1)",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "10px",
    color: "#f59e0b",
    fontSize: "12px",
    marginBottom: "16px",
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
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
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
  confirmBtn: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    border: "none",
    borderRadius: "10px",
    color: "#0a0f0d",
    cursor: "pointer",
    fontWeight: "bold",
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