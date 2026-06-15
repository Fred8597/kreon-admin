import { useState, useEffect } from "react"
import {
  Hash,
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  Smartphone,
  TrendingUp,
  FileText,
  Search,
} from "lucide-react"
import toast from "react-hot-toast"
import api from "../services/api"
import { formatDateTime } from "../utils/format"

export default function TransactionReferences() {
  const [refs, setRefs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)

  const [methodeImport, setMethodeImport] = useState("MTN")
  const [textareaContent, setTextareaContent] = useState("")
  const [filterMethode, setFilterMethode] = useState("ALL")
  const [filterUsed, setFilterUsed] = useState("ALL")
  const [search, setSearch] = useState("")

  const fetchData = async () => {
    try {
      const [refsRes, statsRes] = await Promise.all([
        api.get("/admin/transaction-references"),
        api.get("/admin/transaction-references/stats"),
      ])
      setRefs(refsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleImport = async () => {
    if (!textareaContent.trim()) {
      toast.error("Collez d'abord les numéros de transaction")
      return
    }

    // Parser : split par lignes, virgules, espaces
    const references = textareaContent
      .split(/[\n,\s]+/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0)

    if (references.length === 0) {
      toast.error("Aucune référence valide trouvée")
      return
    }

    setImporting(true)
    try {
      const { data } = await api.post("/admin/transaction-references/import", {
        references,
        methode: methodeImport,
      })

      toast.success(data.message, { duration: 5000 })

      if (data.stats.matches > 0) {
        toast.success(`⚡ ${data.stats.matches} recharge(s) auto-validée(s) !`, {
          duration: 6000,
        })
      }

      setTextareaContent("")
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur")
    } finally {
      setImporting(false)
    }
  }

  const handleDelete = async (id, ref) => {
    if (!window.confirm(`Supprimer la référence ${ref} ?`)) return
    try {
      await api.delete(`/admin/transaction-references/${id}`)
      toast.success("Supprimée")
      fetchData()
    } catch (error) {
      toast.error("Erreur")
    }
  }

  // FILTRAGE
  const filteredRefs = refs.filter((r) => {
    if (filterMethode !== "ALL" && r.methode !== filterMethode) return false
    if (filterUsed === "USED" && !r.utilise) return false
    if (filterUsed === "AVAILABLE" && r.utilise) return false
    if (search && !r.referencePaiement.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Hash size={28} color="#10b981" /> Inventaire Transactions
          </h1>
          <p style={styles.subtitle}>
            Importez les numéros de transaction reçus pour matcher avec les recharges
          </p>
        </div>
      </div>

      {/* STATS */}
      {stats && (
        <div style={styles.statsGrid}>
          <StatCard
            color="#fbbf24"
            label="MTN total"
            value={stats.MTN.total}
            sub={`${stats.MTN.disponibles} disponibles`}
          />
          <StatCard
            color="#fb923c"
            label="Orange total"
            value={stats.ORANGE.total}
            sub={`${stats.ORANGE.disponibles} disponibles`}
          />
          <StatCard
            color="#10b981"
            label="MTN utilisées"
            value={stats.MTN.utilisees}
            sub="Matchées avec recharges"
          />
          <StatCard
            color="#ec4899"
            label="Orange utilisées"
            value={stats.ORANGE.utilisees}
            sub="Matchées avec recharges"
          />
        </div>
      )}

      {/* IMPORT BOX */}
      <div style={styles.importBox}>
        <h2 style={styles.importTitle}>
          <Upload size={20} color="#10b981" /> Importer un inventaire
        </h2>

        <div style={styles.field}>
          <label style={styles.label}>Opérateur</label>
          <div style={styles.opGrid}>
            <button
              type="button"
              onClick={() => setMethodeImport("MTN")}
              style={{
                ...styles.opBtn,
                ...(methodeImport === "MTN" ? styles.opBtnActive : {}),
              }}
            >
              <Smartphone size={18} color="#fbbf24" /> MTN Money
            </button>
            <button
              type="button"
              onClick={() => setMethodeImport("ORANGE")}
              style={{
                ...styles.opBtn,
                ...(methodeImport === "ORANGE" ? styles.opBtnActive : {}),
              }}
            >
              <Smartphone size={18} color="#fb923c" /> Orange Money
            </button>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            Numéros de transaction (un par ligne, ou séparés par virgules/espaces)
          </label>
          <textarea
            value={textareaContent}
            onChange={(e) => setTextareaContent(e.target.value)}
            placeholder={
              methodeImport === "MTN"
                ? "17381367485\n17381367486\n17381367487\n..."
                : "CI230612.1234.B12345\nCI230612.1234.B12346\n..."
            }
            style={styles.textarea}
          />
          <p style={styles.hint}>
            💡 Astuce : copiez-collez directement votre liste, le système trie automatiquement.
          </p>
        </div>

        <button
          onClick={handleImport}
          disabled={importing}
          style={{
            ...styles.importBtn,
            opacity: importing ? 0.6 : 1,
            cursor: importing ? "not-allowed" : "pointer",
          }}
        >
          <FileText size={16} />
          {importing ? "Import en cours..." : "Importer & matcher"}
        </button>
      </div>

      {/* FILTRES */}
      <div style={styles.filtersRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#86efac" />
          <input
            type="text"
            placeholder="Rechercher une référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={filterMethode}
          onChange={(e) => setFilterMethode(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">Toutes méthodes</option>
          <option value="MTN">MTN</option>
          <option value="ORANGE">Orange</option>
        </select>

        <select
          value={filterUsed}
          onChange={(e) => setFilterUsed(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">Tous</option>
          <option value="USED">Utilisées</option>
          <option value="AVAILABLE">Disponibles</option>
        </select>
      </div>

      {/* LISTE */}
      {loading ? (
        <p style={{ color: "#86efac", textAlign: "center", padding: 40 }}>
          Chargement...
        </p>
      ) : filteredRefs.length === 0 ? (
        <div style={styles.empty}>
          <Hash size={50} color="#6b7280" />
          <p style={styles.emptyText}>Aucune référence pour ces filtres</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredRefs.map((r) => (
            <div
              key={r._id}
              style={{
                ...styles.refCard,
                ...(r.utilise ? styles.refCardUsed : {}),
              }}
            >
              <div style={styles.refLeft}>
                <div
                  style={{
                    ...styles.statusIcon,
                    ...(r.utilise ? styles.statusIconUsed : styles.statusIconAvailable),
                  }}
                >
                  {r.utilise ? (
                    <CheckCircle2 size={16} color="#10b981" />
                  ) : (
                    <XCircle size={16} color="#f59e0b" />
                  )}
                </div>
                <div>
                  <p style={styles.refNumber}>{r.referencePaiement}</p>
                  <p style={styles.refMeta}>
                    {r.methode} • {formatDateTime(r.createdAt)}
                  </p>
                  {r.utilise && (
                    <p style={styles.refUsed}>
                      ✓ Matché avec une recharge
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(r._id, r.referencePaiement)}
                style={styles.deleteBtn}
              >
                <Trash2 size={14} color="#ef4444" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const StatCard = ({ color, label, value, sub }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statDot, backgroundColor: color }} />
    <div>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
      <p style={styles.statSub}>{sub}</p>
    </div>
  </div>
)

const styles = {
  page: { padding: "24px", color: "#f0fdf4" },
  header: { marginBottom: "20px" },
  title: { fontSize: "1.8rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" },
  subtitle: { fontSize: "0.85rem", color: "#86efac" },
  // STATS
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  statCard: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "14px",
    backgroundColor: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "12px",
  },
  statDot: { width: "10px", height: "40px", borderRadius: "4px" },
  statLabel: { fontSize: "0.72rem", color: "#86efac" },
  statValue: { fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 },
  statSub: { fontSize: "0.65rem", color: "#6b7280", marginTop: "2px" },
  // IMPORT
  importBox: {
    padding: "20px",
    backgroundColor: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "16px",
    marginBottom: "20px",
  },
  importTitle: { fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" },
  label: { fontSize: "0.82rem", color: "#86efac", fontWeight: 600 },
  opGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  opBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "10px",
    color: "#f0fdf4",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  opBtnActive: {
    borderColor: "rgba(16,185,129,0.5)",
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  textarea: {
    minHeight: "150px",
    padding: "12px 14px",
    backgroundColor: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "0.85rem",
    fontFamily: "monospace",
    outline: "none",
    resize: "vertical",
  },
  hint: { fontSize: "0.72rem", color: "#6b7280" },
  importBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#0a0f0d",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.92rem",
    fontWeight: 700,
    boxShadow: "0 4px 15px rgba(16,185,129,0.3)",
  },
  // FILTRES
  filtersRow: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" },
  searchBox: {
    flex: 1,
    minWidth: "200px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "rgba(17,26,20,0.7)",
    border: "1px solid rgba(16,185,129,0.15)",
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
  filterSelect: {
    padding: "10px 14px",
    backgroundColor: "rgba(17,26,20,0.7)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "10px",
    color: "#f0fdf4",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  // LISTE
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  refCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    backgroundColor: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "10px",
  },
  refCardUsed: { opacity: 0.7 },
  refLeft: { display: "flex", gap: "10px", alignItems: "center", flex: 1 },
  statusIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconAvailable: {
    backgroundColor: "rgba(245,158,11,0.15)",
    border: "1px solid rgba(245,158,11,0.4)",
  },
  statusIconUsed: {
    backgroundColor: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.4)",
  },
  refNumber: {
    fontSize: "0.92rem",
    fontWeight: 700,
    color: "#f0fdf4",
    fontFamily: "monospace",
  },
  refMeta: { fontSize: "0.7rem", color: "#86efac", marginTop: "2px" },
  refUsed: { fontSize: "0.7rem", color: "#10b981", marginTop: "2px" },
  deleteBtn: {
    padding: "8px 12px",
    backgroundColor: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "8px",
    cursor: "pointer",
  },
  empty: {
    padding: "60px 20px",
    textAlign: "center",
    backgroundColor: "rgba(17,26,20,0.5)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  emptyText: { color: "#86efac" },
}