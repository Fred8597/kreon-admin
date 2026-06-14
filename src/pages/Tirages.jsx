import { useState, useEffect } from "react"
import {
  Sparkles,
  Plus,
  X,
  Trash2,
  Ban,
  User as UserIcon,
  Trophy,
  Search,
} from "lucide-react"
import toast from "react-hot-toast"
import api from "../services/api"
import { formatXAF, formatDateTime } from "../utils/format"

export default function Tirages() {
  const [grants, setGrants] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [montantsInput, setMontantsInput] = useState("") // ex : "1000, 2500, 500"
  const [note, setNote] = useState("")

  // ===== FETCH =====
  const fetchGrants = async () => {
    try {
      const { data } = await api.get("/tirage/admin/grants")
      setGrants(data)
    } catch (error) {
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users?limit=200")
      setUsers(data.users || [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchGrants()
    fetchUsers()
  }, [])

  // ===== Filtre users =====
  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      u.nom?.toLowerCase().includes(s) ||
      u.telephone?.includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.codeParrainage?.toLowerCase().includes(s)
    )
  })

  // ===== CRÉER =====
  const handleCreate = async (e) => {
    e.preventDefault()

    if (!selectedUser) {
      toast.error("Sélectionnez un utilisateur")
      return
    }

    // Parser les montants
    const montants = montantsInput
      .split(",")
      .map((m) => parseInt(m.trim()))
      .filter((m) => Number.isFinite(m) && m > 0)

    if (montants.length === 0) {
      toast.error("Entrez au moins un montant valide")
      return
    }

    setCreating(true)
    try {
      await api.post("/tirage/admin/accorder", {
        userId: selectedUser._id,
        montants,
        note,
      })
      toast.success(
        `${montants.length} tour(s) accordé(s) à ${selectedUser.nom}`
      )
      setShowModal(false)
      setSelectedUser(null)
      setMontantsInput("")
      setNote("")
      setSearch("")
      fetchGrants()
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur")
    } finally {
      setCreating(false)
    }
  }

  // ===== ANNULER =====
  const handleAnnuler = async (id, nomUser) => {
    if (!window.confirm(`Annuler les tours restants de ${nomUser} ?`)) return
    try {
      await api.put(`/tirage/admin/grants/${id}/annuler`)
      toast.success("Grant annulé")
      fetchGrants()
    } catch (error) {
      toast.error("Erreur")
    }
  }

  // ===== DELETE =====
  const handleDelete = async (id, nomUser) => {
    if (!window.confirm(`Supprimer définitivement ce grant ${nomUser} ?`)) return
    try {
      await api.delete(`/tirage/admin/grants/${id}`)
      toast.success("Grant supprimé")
      fetchGrants()
    } catch (error) {
      toast.error("Erreur")
    }
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Sparkles size={28} color="#eab308" /> Tirages Roue Fortune
          </h1>
          <p style={styles.subtitle}>
            {grants.length} grant{grants.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.createBtn}>
          <Plus size={18} />
          Accorder des tours
        </button>
      </div>

      {/* LISTE */}
      {loading ? (
        <p style={{ color: "#86efac", textAlign: "center", padding: 40 }}>
          Chargement...
        </p>
      ) : grants.length === 0 ? (
        <div style={styles.empty}>
          <Sparkles size={50} color="#6b7280" />
          <p style={styles.emptyText}>Aucun tirage accordé pour l'instant</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {grants.map((g) => {
            const toursRestants = g.montants.length - g.indexCourant
            const isActif = g.statut === "ACTIF"
            const isTermine = g.statut === "TERMINE"
            const isAnnule = g.statut === "ANNULE"

            return (
              <div
                key={g._id}
                style={{
                  ...styles.card,
                  ...(isAnnule || isTermine ? styles.cardInactive : {}),
                }}
              >
                {/* Header */}
                <div style={styles.cardTop}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(isActif && styles.statusActive),
                      ...(isTermine && styles.statusFini),
                      ...(isAnnule && styles.statusAnnule),
                    }}
                  >
                    {isActif && "✅ Actif"}
                    {isTermine && "🏁 Terminé"}
                    {isAnnule && "❌ Annulé"}
                  </span>
                  <span style={styles.toursBadge}>
                    {toursRestants} / {g.montants.length} tours
                  </span>
                </div>

                {/* User */}
                <div style={styles.userBox}>
                  <UserIcon size={16} color="#86efac" />
                  <div>
                    <p style={styles.userName}>{g.userId?.nom}</p>
                    <p style={styles.userPhone}>{g.userId?.telephone}</p>
                  </div>
                </div>

                {/* Montants prévus */}
                <div style={styles.montantsBox}>
                  <p style={styles.montantsLabel}>Montants prévus :</p>
                  <div style={styles.montantsRow}>
                    {g.montants.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          ...styles.montantPill,
                          ...(idx < g.indexCourant
                            ? styles.montantUsed
                            : styles.montantTodo),
                        }}
                      >
                        {idx < g.indexCourant && "✓ "}
                        {formatXAF(m)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Note */}
                {g.note && (
                  <p style={styles.note}>📝 "{g.note}"</p>
                )}

                {/* Créateur + date */}
                <p style={styles.meta}>
                  Créé par {g.creePar?.nom || "Admin"} •{" "}
                  {formatDateTime(g.createdAt)}
                </p>

                {/* Actions */}
                <div style={styles.actions}>
                  {isActif && (
                    <button
                      onClick={() => handleAnnuler(g._id, g.userId?.nom)}
                      style={styles.cancelBtn}
                    >
                      <Ban size={14} />
                      Annuler
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(g._id, g.userId?.nom)}
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

      {/* ===== MODAL ===== */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Trophy size={22} color="#eab308" /> Accorder des tours
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeBtn}
              >
                <X size={20} color="#86efac" />
              </button>
            </div>

            <form onSubmit={handleCreate} style={styles.form}>
              {/* Sélectionner user */}
              <div style={styles.field}>
                <label style={styles.label}>Utilisateur cible *</label>

                {selectedUser ? (
                  <div style={styles.selectedUserBox}>
                    <div>
                      <p style={styles.userName}>{selectedUser.nom}</p>
                      <p style={styles.userPhone}>
                        {selectedUser.telephone} • {selectedUser.codeParrainage}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      style={styles.changeBtn}
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={styles.searchBox}>
                      <Search size={16} color="#86efac" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom, téléphone, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.searchInput}
                      />
                    </div>

                    {search && (
                      <div style={styles.userList}>
                        {filteredUsers.slice(0, 10).map((u) => (
                          <button
                            key={u._id}
                            type="button"
                            onClick={() => {
                              setSelectedUser(u)
                              setSearch("")
                            }}
                            style={styles.userItem}
                          >
                            <div>
                              <p style={styles.userItemName}>{u.nom}</p>
                              <p style={styles.userItemPhone}>
                                {u.telephone} • {u.codeParrainage}
                              </p>
                            </div>
                          </button>
                        ))}
                        {filteredUsers.length === 0 && (
                          <p style={styles.noResult}>Aucun utilisateur trouvé</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Montants */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Montants (XAF) - séparés par des virgules *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1000, 2500, 5000, 800"
                  value={montantsInput}
                  onChange={(e) => setMontantsInput(e.target.value)}
                  style={styles.input}
                  required
                />
                <p style={styles.hint}>
                  Chaque montant = 1 tour. Ex : "1000, 2500, 800" = 3 tours
                </p>
              </div>

              {/* Note */}
              <div style={styles.field}>
                <label style={styles.label}>Note interne (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Récompense fidélité"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.submitBtn} disabled={creating}>
                {creating ? "Création..." : "Accorder les tours"}
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
    background: "linear-gradient(135deg, #eab308, #d97706)",
    color: "#0a0f0d",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(234,179,8,0.3)",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "14px",
  },
  card: {
    backgroundColor: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardInactive: { opacity: 0.6 },
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
  statusFini: {
    backgroundColor: "rgba(107,114,128,0.15)",
    color: "#6b7280",
    border: "1px solid rgba(107,114,128,0.4)",
  },
  statusAnnule: {
    backgroundColor: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.4)",
  },
  toursBadge: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#f59e0b",
  },
  userBox: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "rgba(16,185,129,0.05)",
    borderRadius: "10px",
  },
  userName: { fontSize: "0.9rem", fontWeight: 700, color: "#f0fdf4" },
  userPhone: { fontSize: "0.72rem", color: "#86efac", marginTop: "2px" },
  montantsBox: { display: "flex", flexDirection: "column", gap: "6px" },
  montantsLabel: { fontSize: "0.72rem", color: "#86efac" },
  montantsRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
  montantPill: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.72rem",
    fontWeight: 700,
  },
  montantTodo: {
    backgroundColor: "rgba(245,158,11,0.15)",
    color: "#f59e0b",
    border: "1px solid rgba(245,158,11,0.4)",
  },
  montantUsed: {
    backgroundColor: "rgba(107,114,128,0.15)",
    color: "#6b7280",
    border: "1px solid rgba(107,114,128,0.4)",
    textDecoration: "line-through",
  },
  note: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    fontStyle: "italic",
    padding: "6px 10px",
    backgroundColor: "rgba(10,15,13,0.5)",
    borderRadius: "8px",
  },
  meta: { fontSize: "0.7rem", color: "#6b7280" },
  actions: {
    display: "flex",
    gap: "8px",
    paddingTop: "10px",
    borderTop: "1px solid rgba(16,185,129,0.1)",
  },
  cancelBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px",
    backgroundColor: "rgba(245,158,11,0.1)",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "8px",
    color: "#f59e0b",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 12px",
    backgroundColor: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "8px",
    cursor: "pointer",
  },
  // MODAL
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
    maxWidth: "520px",
    backgroundColor: "#111a14",
    border: "1px solid rgba(234,179,8,0.3)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    maxHeight: "90vh",
    overflowY: "auto",
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
  label: { fontSize: "0.8rem", color: "#86efac", fontWeight: 600 },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#f0fdf4",
    fontSize: "0.85rem",
    outline: "none",
  },
  userList: {
    marginTop: "8px",
    maxHeight: "200px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  userItem: {
    padding: "10px 12px",
    backgroundColor: "rgba(17,26,20,0.5)",
    border: "1px solid rgba(16,185,129,0.1)",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    color: "#f0fdf4",
  },
  userItemName: { fontSize: "0.85rem", fontWeight: 600 },
  userItemPhone: { fontSize: "0.7rem", color: "#86efac", marginTop: "2px" },
  noResult: {
    fontSize: "0.78rem",
    color: "#6b7280",
    textAlign: "center",
    padding: "14px",
  },
  selectedUserBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "10px",
  },
  changeBtn: {
    padding: "6px 12px",
    backgroundColor: "rgba(245,158,11,0.1)",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "8px",
    color: "#f59e0b",
    fontSize: "0.72rem",
    fontWeight: 600,
    cursor: "pointer",
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
  hint: { fontSize: "0.7rem", color: "#6b7280" },
  submitBtn: {
    padding: "14px",
    background: "linear-gradient(135deg, #eab308, #d97706)",
    color: "#0a0f0d",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "6px",
  },
}