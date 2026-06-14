import { useState, useEffect } from "react"
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  Crown,
  Users,
  Clock,
  Timer,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import api from "../services/api"
import { formatXAF, formatDateTime } from "../utils/format"

const CATEGORIES = [
  { value: "IA", label: "IA", color: "#10b981" },
  { value: "NVIP", label: "NVIP", color: "#eab308" },
  { value: "SUPER_IA", label: "Super IA", color: "#8b5cf6" },
  { value: "DUREE_LIMITEE", label: "Durée limitée", color: "#ec4899" },
]

const BADGES = [
  { value: "", label: "Aucun" },
  { value: "HOT", label: "HOT" },
  { value: "NOUVEAU", label: "NOUVEAU" },
  { value: "POPULAIRE", label: "POPULAIRE" },
  { value: "VIP", label: "VIP" },
]

const initialForm = {
  nom: "",
  description: "",
  image: "",
  categorie: "IA",
  prix: "",
  montantRetour: "",
  dureeJours: "",
  stock: "",
  limiteAchat: "0",
  niveauVIPRequis: "0",
  filleulsRequis: "0",
  dateDebut: "",
  dateFin: "",
  estActif: true,
  badge: "",
  ordre: "0",
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [filterCat, setFilterCat] = useState("ALL")

  // ===== FETCH =====
  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products")
      setProducts(data)
    } catch (error) {
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // ===== FORM HANDLERS =====
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const openCreate = () => {
    setEditId(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditId(product._id)
    setForm({
      nom: product.nom || "",
      description: product.description || "",
      image: product.image || "",
      categorie: product.categorie || "IA",
      prix: product.prix?.toString() || "",
      montantRetour: product.montantRetour?.toString() || "",
      dureeJours: product.dureeJours?.toString() || "",
      stock: product.stock?.toString() || "0",
      limiteAchat: product.limiteAchat?.toString() || "0",
      niveauVIPRequis: product.niveauVIPRequis?.toString() || "0",
      filleulsRequis: product.filleulsRequis?.toString() || "0",
      dateDebut: product.dateDebut
        ? new Date(product.dateDebut).toISOString().slice(0, 16)
        : "",
      dateFin: product.dateFin
        ? new Date(product.dateFin).toISOString().slice(0, 16)
        : "",
      estActif: product.estActif,
      badge: product.badge || "",
      ordre: product.ordre?.toString() || "0",
    })
    setShowModal(true)
  }

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nom || !form.prix || !form.montantRetour || !form.dureeJours) {
      toast.error("Nom, prix, montant retour et durée sont obligatoires")
      return
    }

    const body = {
      nom: form.nom,
      description: form.description,
      image: form.image,
      categorie: form.categorie,
      prix: parseInt(form.prix),
      montantRetour: parseInt(form.montantRetour),
      dureeJours: parseInt(form.dureeJours),
      stock: parseInt(form.stock) || 0,
      limiteAchat: parseInt(form.limiteAchat) || 0,
      niveauVIPRequis: parseInt(form.niveauVIPRequis) || 0,
      filleulsRequis: parseInt(form.filleulsRequis) || 0,
      dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : null,
      dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
      estActif: form.estActif,
      badge: form.badge || null,
      ordre: parseInt(form.ordre) || 0,
    }

    setSaving(true)
    try {
      if (editId) {
        await api.put(`/products/${editId}`, body)
        toast.success("Produit modifié ✅")
      } else {
        await api.post("/products", body)
        toast.success("Produit créé ✅")
      }
      setShowModal(false)
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur")
    } finally {
      setSaving(false)
    }
  }

  // ===== DELETE =====
  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer "${nom}" ?`)) return
    try {
      await api.delete(`/products/${id}`)
      toast.success("Supprimé")
      fetchProducts()
    } catch (error) {
      toast.error("Erreur")
    }
  }

  // ===== TOGGLE ACTIF =====
  const handleToggle = async (id, current) => {
    try {
      await api.put(`/products/${id}`, { estActif: !current })
      toast.success(current ? "Produit désactivé" : "Produit activé")
      fetchProducts()
    } catch (error) {
      toast.error("Erreur")
    }
  }

  // ===== FILTRAGE =====
  const filteredProducts =
    filterCat === "ALL"
      ? products
      : products.filter((p) => p.categorie === filterCat)

  // ===== RENDEMENT CALCULÉ =====
  const calcRendement = () => {
    const p = parseInt(form.prix) || 0
    const r = parseInt(form.montantRetour) || 0
    if (p <= 0) return 0
    return Math.round((r / p) * 100)
  }

  const calcTotal = () => {
    return (parseInt(form.prix) || 0) + (parseInt(form.montantRetour) || 0)
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Package size={28} color="#10b981" /> Produits
          </h1>
          <p style={styles.subtitle}>
            {products.length} produit{products.length > 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreate} style={styles.createBtn}>
          <Plus size={18} />
          Nouveau produit
        </button>
      </div>

      {/* FILTRES CATÉGORIES */}
      <div style={styles.filterRow}>
        <button
          onClick={() => setFilterCat("ALL")}
          style={{
            ...styles.filterBtn,
            ...(filterCat === "ALL" ? styles.filterBtnActive : {}),
          }}
        >
          Tous ({products.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = products.filter((p) => p.categorie === cat.value).length
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              style={{
                ...styles.filterBtn,
                ...(filterCat === cat.value
                  ? { ...styles.filterBtnActive, borderColor: cat.color }
                  : {}),
              }}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* LISTE */}
      {loading ? (
        <p style={{ color: "#86efac", textAlign: "center", padding: 40 }}>
          Chargement...
        </p>
      ) : filteredProducts.length === 0 ? (
        <div style={styles.empty}>
          <Package size={50} color="#6b7280" />
          <p style={styles.emptyText}>Aucun produit</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredProducts.map((p) => {
            const catConfig = CATEGORIES.find((c) => c.value === p.categorie)
            const rendement = p.prix > 0 ? Math.round((p.montantRetour / p.prix) * 100) : 0
            const total = p.prix + p.montantRetour

            return (
              <div
                key={p._id}
                style={{
                  ...styles.card,
                  ...(p.estActif ? {} : styles.cardInactive),
                }}
              >
                {/* Badge catégorie */}
                <div style={styles.cardTop}>
                  <span
                    style={{
                      ...styles.catBadge,
                      backgroundColor: `${catConfig?.color || "#6b7280"}20`,
                      color: catConfig?.color || "#6b7280",
                      borderColor: `${catConfig?.color || "#6b7280"}50`,
                    }}
                  >
                    {catConfig?.label || p.categorie}
                  </span>
                  {p.badge && <span style={styles.marketBadge}>{p.badge}</span>}
                  {!p.estActif && <span style={styles.inactiveBadge}>INACTIF</span>}
                </div>

                {/* Image */}
                {p.image && (
                  <div style={styles.cardImage}>
                    <img
                      src={p.image}
                      alt={p.nom}
                      style={styles.img}
                      onError={(e) => (e.target.parentElement.style.display = "none")}
                    />
                  </div>
                )}

                {/* Nom + durée */}
                <h3 style={styles.cardName}>{p.nom}</h3>
                <p style={styles.cardDuree}>
                  <Clock size={12} /> {p.dureeJours} jour{p.dureeJours > 1 ? "s" : ""}
                </p>

                {/* Prix & rendement */}
                <div style={styles.priceRow}>
                  <div>
                    <span style={styles.priceLabel}>Prix</span>
                    <p style={styles.priceValue}>{formatXAF(p.prix)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={styles.priceLabel}>Retour</span>
                    <p style={styles.returnValue}>{formatXAF(p.montantRetour)}</p>
                  </div>
                </div>

                <div style={styles.totalRow}>
                  <span>Total reçu</span>
                  <span style={styles.totalValue}>{formatXAF(total)}</span>
                  <span style={styles.rendementBadge}>+{rendement}%</span>
                </div>

                {/* Meta */}
                <div style={styles.metaRow}>
                  <span style={styles.metaItem}>Stock: <strong>{p.stock}</strong></span>
                  <span style={styles.metaItem}>Limite: <strong>{p.limiteAchat || "∞"}</strong></span>
                  {p.niveauVIPRequis > 0 && (
                    <span style={styles.metaVip}>
                      <Crown size={11} /> NVIP{p.niveauVIPRequis}+
                    </span>
                  )}
                  {p.filleulsRequis > 0 && (
                    <span style={styles.metaFilleuls}>
                      <Users size={11} /> {p.filleulsRequis} filleuls
                    </span>
                  )}
                </div>

                {/* Dates durée limitée */}
                {p.categorie === "DUREE_LIMITEE" && (
                  <div style={styles.datesBox}>
                    <Timer size={12} color="#ec4899" />
                    <span style={styles.datesText}>
                      {p.dateDebut && formatDateTime(p.dateDebut)} → {p.dateFin && formatDateTime(p.dateFin)}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div style={styles.cardActions}>
                  <button onClick={() => handleToggle(p._id, p.estActif)} style={styles.toggleBtn}>
                    {p.estActif ? <EyeOff size={14} /> : <Eye size={14} />}
                    {p.estActif ? "Désactiver" : "Activer"}
                  </button>
                  <button onClick={() => openEdit(p)} style={styles.editBtn}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(p._id, p.nom)} style={styles.deleteBtn}>
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== MODAL CRÉATION/ÉDITION ===== */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editId ? "✏️ Modifier le produit" : "➕ Nouveau produit"}
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                <X size={20} color="#86efac" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* NOM */}
              <Field label="Nom du produit *">
                <input
                  type="text"
                  placeholder="Ex: NVIDIA RTX A4000"
                  value={form.nom}
                  onChange={(e) => handleChange("nom", e.target.value)}
                  style={styles.input}
                  required
                />
              </Field>

              {/* CATÉGORIE */}
              <Field label="Catégorie *">
                <div style={styles.catGrid}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleChange("categorie", cat.value)}
                      style={{
                        ...styles.catOption,
                        ...(form.categorie === cat.value
                          ? {
                              borderColor: cat.color,
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }
                          : {}),
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* PRIX + RETOUR */}
              <div style={styles.row2}>
                <Field label="Prix (XAF) *">
                  <input
                    type="number"
                    placeholder="Ex: 30000"
                    value={form.prix}
                    onChange={(e) => handleChange("prix", e.target.value)}
                    style={styles.input}
                    required
                  />
                </Field>
                <Field label="Montant retour (XAF) *">
                  <input
                    type="number"
                    placeholder="Ex: 45084"
                    value={form.montantRetour}
                    onChange={(e) => handleChange("montantRetour", e.target.value)}
                    style={styles.input}
                    required
                  />
                </Field>
              </div>

              {/* CALCUL AUTO */}
              {(form.prix && form.montantRetour) && (
                <div style={styles.calcBox}>
                  <p style={styles.calcText}>
                    Mise: <strong>{formatXAF(parseInt(form.prix) || 0)}</strong>
                    {" + "}
                    Retour: <strong style={{ color: "#10b981" }}>{formatXAF(parseInt(form.montantRetour) || 0)}</strong>
                    {" = "}
                    <strong style={{ color: "#f59e0b" }}>{formatXAF(calcTotal())}</strong>
                    {" "}
                    <span style={styles.calcRendement}>({calcRendement()}%)</span>
                  </p>
                </div>
              )}

              {/* DURÉE + STOCK */}
              <div style={styles.row2}>
                <Field label="Durée (jours) *">
                  <input
                    type="number"
                    placeholder="Ex: 7"
                    value={form.dureeJours}
                    onChange={(e) => handleChange("dureeJours", e.target.value)}
                    style={styles.input}
                    required
                  />
                </Field>
                <Field label="Stock disponible">
                  <input
                    type="number"
                    placeholder="Ex: 100"
                    value={form.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    style={styles.input}
                  />
                </Field>
              </div>

              {/* LIMITE + ORDRE */}
              <div style={styles.row2}>
                <Field label="Limite d'achat (0=illimité)">
                  <input
                    type="number"
                    placeholder="Ex: 3"
                    value={form.limiteAchat}
                    onChange={(e) => handleChange("limiteAchat", e.target.value)}
                    style={styles.input}
                  />
                </Field>
                <Field label="Ordre affichage">
                  <input
                    type="number"
                    placeholder="Ex: 1"
                    value={form.ordre}
                    onChange={(e) => handleChange("ordre", e.target.value)}
                    style={styles.input}
                  />
                </Field>
              </div>

              {/* CONDITIONNEL : NVIP */}
              {form.categorie === "NVIP" && (
                <Field label="Niveau VIP minimum requis (1-10) *">
                  <select
                    value={form.niveauVIPRequis}
                    onChange={(e) => handleChange("niveauVIPRequis", e.target.value)}
                    style={styles.select}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        NVIP{n}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {/* CONDITIONNEL : SUPER_IA */}
              {form.categorie === "SUPER_IA" && (
                <Field label="Nombre de filleuls requis *">
                  <input
                    type="number"
                    placeholder="Ex: 5"
                    value={form.filleulsRequis}
                    onChange={(e) => handleChange("filleulsRequis", e.target.value)}
                    style={styles.input}
                  />
                </Field>
              )}

              {/* CONDITIONNEL : DURÉE LIMITÉE */}
              {form.categorie === "DUREE_LIMITEE" && (
                <div style={styles.row2}>
                  <Field label="Date début *">
                    <input
                      type="datetime-local"
                      value={form.dateDebut}
                      onChange={(e) => handleChange("dateDebut", e.target.value)}
                      style={styles.input}
                    />
                  </Field>
                  <Field label="Date fin *">
                    <input
                      type="datetime-local"
                      value={form.dateFin}
                      onChange={(e) => handleChange("dateFin", e.target.value)}
                      style={styles.input}
                    />
                  </Field>
                </div>
              )}

              {/* IMAGE */}
              <Field label="URL image (optionnel)">
                <input
                  type="text"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  style={styles.input}
                />
              </Field>

              {/* DESCRIPTION */}
              <Field label="Description (optionnel)">
                <textarea
                  placeholder="Description du produit..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  style={{ ...styles.input, height: "80px", resize: "vertical" }}
                />
              </Field>

              {/* BADGE */}
              <Field label="Badge marketing (optionnel)">
                <select
                  value={form.badge}
                  onChange={(e) => handleChange("badge", e.target.value)}
                  style={styles.select}
                >
                  {BADGES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* ACTIF */}
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.estActif}
                  onChange={(e) => handleChange("estActif", e.target.checked)}
                  style={{ accentColor: "#10b981" }}
                />
                Produit actif (visible par les utilisateurs)
              </label>

              {/* SUBMIT */}
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving
                  ? "Enregistrement..."
                  : editId
                  ? "Modifier le produit"
                  : "Créer le produit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Sous-composant =====
const Field = ({ label, children }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
)

const styles = {
  page: { padding: "24px", color: "#f0fdf4" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
  },
  // FILTRES
  filterRow: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  filterBtn: {
    padding: "8px 16px",
    backgroundColor: "rgba(17,26,20,0.7)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "10px",
    color: "#86efac",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  filterBtnActive: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "1px solid #10b981",
  },
  // GRID
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "14px",
  },
  card: {
    backgroundColor: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardInactive: { opacity: 0.5 },
  cardTop: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" },
  catBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: 700,
    border: "1px solid",
  },
  marketBadge: {
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "0.65rem",
    fontWeight: 700,
    backgroundColor: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.4)",
  },
  inactiveBadge: {
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "0.65rem",
    fontWeight: 700,
    backgroundColor: "rgba(107,114,128,0.15)",
    color: "#6b7280",
  },
  cardImage: { width: "100%", height: "120px", borderRadius: "10px", overflow: "hidden", backgroundColor: "rgba(10,15,13,0.5)" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  cardName: { fontSize: "1rem", fontWeight: 700, color: "#f0fdf4" },
  cardDuree: { fontSize: "0.75rem", color: "#86efac", display: "flex", alignItems: "center", gap: "4px" },
  priceRow: { display: "flex", justifyContent: "space-between", padding: "8px", backgroundColor: "rgba(10,15,13,0.5)", borderRadius: "8px" },
  priceLabel: { fontSize: "0.65rem", color: "#6b7280", display: "block" },
  priceValue: { fontSize: "0.95rem", fontWeight: 800, color: "#f0fdf4" },
  returnValue: { fontSize: "0.95rem", fontWeight: 800, color: "#10b981" },
  totalRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: "#86efac", padding: "4px 0" },
  totalValue: { fontWeight: 800, color: "#f59e0b", marginLeft: "auto" },
  rendementBadge: { padding: "2px 8px", borderRadius: "20px", backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "0.7rem", fontWeight: 700 },
  metaRow: { display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "0.72rem" },
  metaItem: { color: "#86efac" },
  metaVip: { color: "#eab308", display: "flex", alignItems: "center", gap: "3px" },
  metaFilleuls: { color: "#8b5cf6", display: "flex", alignItems: "center", gap: "3px" },
  datesBox: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px", backgroundColor: "rgba(236,72,153,0.08)", borderRadius: "6px" },
  datesText: { fontSize: "0.7rem", color: "#ec4899" },
  cardActions: { display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid rgba(16,185,129,0.1)" },
  toggleBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", backgroundColor: "rgba(10,15,13,0.5)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px", color: "#86efac", fontSize: "0.72rem", cursor: "pointer" },
  editBtn: { padding: "8px 12px", backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", color: "#3b82f6", cursor: "pointer" },
  deleteBtn: { padding: "8px 12px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", cursor: "pointer" },
  empty: { padding: "60px 20px", textAlign: "center", backgroundColor: "rgba(17,26,20,0.6)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  emptyText: { fontSize: "1rem", color: "#86efac" },
  // MODAL
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modal: { width: "100%", maxWidth: "600px", backgroundColor: "#111a14", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "20px", padding: "24px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  modalTitle: { fontSize: "1.2rem", fontWeight: 800 },
  closeBtn: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(16,185,129,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.8rem", color: "#86efac", fontWeight: 600 },
  input: { padding: "12px 14px", backgroundColor: "rgba(10,15,13,0.6)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", color: "#fff", fontSize: "0.9rem", outline: "none" },
  select: { padding: "12px 14px", backgroundColor: "rgba(10,15,13,0.6)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", color: "#fff", fontSize: "0.9rem", outline: "none" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" },
  catOption: { padding: "10px 4px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.15)", backgroundColor: "rgba(17,26,20,0.7)", color: "#86efac", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", textAlign: "center" },
  calcBox: { padding: "10px 14px", backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px" },
  calcText: { fontSize: "0.82rem", color: "#94a3b8" },
  calcRendement: { color: "#10b981", fontWeight: 700, fontSize: "0.85rem" },
  checkLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#86efac", cursor: "pointer" },
  submitBtn: { padding: "14px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#0a0f0d", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", marginTop: "6px" },
}