import { useState, useEffect } from "react"
import {
  Gift,
  Plus,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Users,
  Coins,
  X,
} from "lucide-react"
import toast from "react-hot-toast"
import api from "../services/api"
import { formatXAF, formatDateTime } from "../utils/format"

export default function GiftCodes() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form
  const [montant, setMontant] = useState("")
  const [description, setDescription] = useState("")
  const [utilisationsMax, setUtilisationsMax] = useState("")
  const [codePersonnalise, setCodePersonnalise] = useState("")

  // ===== FETCH =====
  const fetchCodes = async () => {
    try {
      const { data } = await api.get("/giftcodes")
      setCodes(data)
    } catch (error) {
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [])

  // ===== CRÉER =====
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!montant || parseInt(montant) <= 0) {
      toast.error("Montant requis (>0)")
      return
    }

    setCreating(true)
    try {
      await api.post("/giftcodes", {
        montant: parseInt(montant),
        description,
        utilisationsMax: utilisationsMax ? parseInt(utilisationsMax) : 0,
        codePersonnalise: codePersonnalise || undefined,
      })
      toast.success("Code créé avec succès !")
      setMontant("")
      setDescription("")
      setUtilisationsMax("")
      setCodePersonnalise("")
      setShowModal(false)
      fetchCodes()
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur")
    } finally {
      setCreating(false)
    }
  }

  // ===== TOGGLE =====
  const handleToggle = async (id) => {
    try {
      await api.put(`/giftcodes/${id}/toggle`)
      toast.success("Statut modifié")
      fetchCodes()
    } catch (error) {
      toast.error("Erreur")
    }
  }

  // ===== DELETE =====
  const handleDelete = async (id, code) => {
    if (!window.confirm(`Supprimer le code ${code} ?`)) return
    try {
      await api.delete(`/giftcodes/${id}`)
      toast.success("Code supprimé")
      fetchCodes()
    } catch (error) {
      toast.error("Erreur")
    }
  }

  // ===== COPY =====
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    toast.success("Code copié !")
  }

  // ===== HELPER : check si expiré =====
  const isExpire = (date) => new Date(date) < new Date()

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Gift size={28} color="#10b981" /> Codes Cadeaux
          </h1>
          <p style={styles.subtitle}>
            {codes.length} code{codes.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.createBtn}>
          <Plus size={18} />
          Créer un code
        </button>
      </div>

      {/* LISTE */}
      {loading ? (
        <p style={{ color: "#86efac", textAlign: "center", padding: 40 }}>
          Chargement...
        </p>
      ) : codes.length === 0 ? (
        <div style={styles.empty}>
          <Gift size={50} color="#6b7280" />
          <p style={styles.emptyText}>Aucun code cadeau pour l'instant</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {codes.map((c) => {
            const expire = isExpire(c.dateExpiration)
            const epuise =
              c.utilisationsMax > 0 &&
              c.utilisationsActuelles >= c.utilisationsMax
            const inactif = !c.estActif || expire || epuise

            return (
              <div
                key={c._id}
                style={{
                  ...styles.card,
                  ...(inactif ? styles.cardInactive : {}),
                }}
              >
                {/* Badge statut */}
                <div style={styles.cardTop}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(inactif
                        ? styles.statusInactive
                        : styles.statusActive),
                    }}
                  >
                    {expire
                      ? "⏰ Expiré"
                      : epuise
                      ? "🔒 Épuisé"
                      : !c.estActif
                      ? "❌ Désactivé"
                      : "✅ Actif"}
                  </span>
                  <span style={styles.montantBig}>{formatXAF(c.montant)}</span>
                </div>

                {/* Code */}
                <button onClick={() => handleCopy(c.code)} style={styles.codeBox}>
                  <span style={styles.codeText}>{c.code}</span>
                  <Copy size={14} color="#10b981" />
                </button>

                {/* Description */}
                {c.description && (
                  <p style={styles.description}>"{c.description}"</p>
                )}

                {/* Stats */}
                <div style={styles.statsRow}>
                  <div style={styles.statItem}>
                    <Users size={12} color="#86efac" />
                    <span style={styles.statText}>
                      {c.utilisationsActuelles}
                      {c.utilisationsMax > 0 && `/${c.utilisationsMax}`}
                    </span>
                  </div>
                  <div style={styles.statItem}>
                    <Calendar size={12} color="#f59e0b" />
                    <span style={styles.statText}>
                      {formatDateTime(c.dateExpiration)}
                    </span>
                  </div>
                </div>

                {/* Créé par */}
                <p style={styles.creator}>
                  Créé par {c.creePar?.nom || "Admin"} •{" "}
                  {formatDateTime(c.createdAt)}
                </p>

                {/* Actions */}
                <div style={styles.actions}>
                  <button
                    onClick={() => handleToggle(c._id)}
                    style={styles.toggleBtn}
                  >
                    {c.estActif ? (
                      <>
                        <ToggleRight size={16} color="#10b981" /> Actif
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} color="#6b7280" /> Inactif
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(c._id, c.code)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL CRÉER */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Gift size={22} color="#10b981" /> Nouveau code cadeau
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                <X size={20} color="#86efac" />
              </button>
            </div>

            <form onSubmit={handleCreate} style={styles.form}>
              {/* Montant */}
              <div style={styles.field}>
                <label style={styles.label}>
                  <Coins size={14} /> Montant (XAF) *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1000"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              {/* Description */}
              <div style={styles.field}>
                <label style={styles.label}>Description (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Promo de lancement"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={styles.input}
                />
              </div>

              {/* Utilisations max */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Nb max d'utilisations (0 = illimité)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 100"
                  value={utilisationsMax}
                  onChange={(e) => setUtilisationsMax(e.target.value)}
                  style={styles.input}
                />
              </div>

              {/* Code personnalisé */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Code personnalisé (optionnel - auto si vide)
                </label>
                <input
                  type="text"
                  placeholder="Ex: KRN-NOEL2026"
                  value={codePersonnalise}
                  onChange={(e) =>
                    setCodePersonnalise(e.target.value.toUpperCase())
                  }
                  style={{ ...styles.input, letterSpacing: "0.1em" }}
                />
              </div>

              {/* Info */}
              <div style={styles.infoBox}>
                ⏰ Le code expirera automatiquement à <strong>minuit</strong>
              </div>

              <button type="submit" style={styles.submitBtn} disabled={creating}>
                {creating ? "Création..." : "Créer le code"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: "24px", color: "#f0fdf4" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  subtitle: { fontSize: "0.9rem", color: "#86efac" },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#0a0f0d",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(16,185,129,0.3)",
  },
  empty: {
    padding: "60px 20px",
    textAlign: "center",
    backgroundColor: "rgba(17,26,20,0.6)",
    border: "1px dashed rgba(16,185,129,0.2)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  emptyText: { fontSize: "1rem", color: "#86efac" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "14px",
  },
  card: {
    backgroundColor: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardInactive: { opacity: 0.55 },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: 700,
  },
  statusActive: {
    backgroundColor: "rgba(16,185,129,0.15)",
    color: "#10b981",
    border: "1px solid rgba(16,185,129,0.4)",
  },
  statusInactive: {
    backgroundColor: "rgba(107,114,128,0.15)",
    color: "#6b7280",
    border: "1px solid rgba(107,114,128,0.4)",
  },
  montantBig: { fontSize: "1.1rem", fontWeight: 800, color: "#f59e0b" },
  codeBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
  },
  codeText: {
    fontSize: "0.95rem",
    fontWeight: 800,
    color: "#10b981",
    letterSpacing: "0.1em",
  },
  description: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    fontStyle: "italic",
    paddingLeft: "4px",
  },
  statsRow: { display: "flex", gap: "12px", flexWrap: "wrap" },
  statItem: { display: "flex", alignItems: "center", gap: "4px" },
  statText: { fontSize: "0.75rem", color: "#86efac" },
  creator: { fontSize: "0.7rem", color: "#6b7280" },
  actions: {
    display: "flex",
    gap: "8px",
    paddingTop: "10px",
    borderTop: "1px solid rgba(16,185,129,0.1)",
  },
  toggleBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px",
    backgroundColor: "rgba(10,15,13,0.5)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "8px",
    color: "#f0fdf4",
    fontSize: "0.78rem",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 12px",
    backgroundColor: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "8px",
    cursor: "pointer",
  },
  // ===== MODAL =====
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(8px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "480px",
    backgroundColor: "#111a14",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(16,185,129,0.1)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "0.8rem",
    color: "#86efac",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  input: {
    padding: "12px 14px",
    backgroundColor: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "0.9rem",
    outline: "none",
  },
  infoBox: {
    padding: "10px 12px",
    backgroundColor: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.25)",
    borderRadius: "10px",
    fontSize: "0.78rem",
    color: "#f59e0b",
  },
  submitBtn: {
    padding: "14px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#0a0f0d",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "6px",
  },
}