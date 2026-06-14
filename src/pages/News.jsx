import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Pin,
  X,
  Calendar,
} from "lucide-react";
import { formatDateTime } from "../utils/format";
import toast from "react-hot-toast";

const CATEGORIES = ["ANNONCE", "NOUVEAUTE", "TECH", "MARCHE", "PROMO"];
const BADGES = ["", "HOT", "NOUVEAU", "URGENT"];

const initialForm = {
  titre: "",
  contenu: "",
  extrait: "",
  image: "",
  categorie: "ANNONCE",
  badge: "",
  epingle: false,
  estPublie: true,
};

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/news");
      setNews(data);
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const ouvrirCreation = () => {
    setEditId(null);
    setForm(initialForm);
    setModal(true);
  };

  const ouvrirEdition = (n) => {
    setEditId(n._id);
    setForm({
      titre: n.titre,
      contenu: n.contenu,
      extrait: n.extrait || "",
      image: n.image || "",
      categorie: n.categorie,
      badge: n.badge || "",
      epingle: n.epingle || false,
      estPublie: n.estPublie ?? true,
    });
    setModal(true);
  };

  const sauvegarder = async () => {
    if (!form.titre || !form.contenu) {
      toast.error("Titre et contenu obligatoires");
      return;
    }

    const data = {
      ...form,
      badge: form.badge || null,
    };

    try {
      if (editId) {
        await api.put(`/news/${editId}`, data);
        toast.success("Actualité modifiée");
      } else {
        await api.post("/news", data);
        toast.success("Actualité créée");
      }
      setModal(false);
      charger();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const togglePublie = async (n) => {
    try {
      await api.put(`/news/${n._id}`, { estPublie: !n.estPublie });
      toast.success(n.estPublie ? "Mis en brouillon" : "Publié");
      charger();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const toggleEpingle = async (n) => {
    try {
      await api.put(`/news/${n._id}`, { epingle: !n.epingle });
      toast.success(n.epingle ? "Désépinglée" : "Épinglée");
      charger();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const supprimer = async (n) => {
    if (!confirm(`Supprimer "${n.titre}" ?`)) return;
    try {
      await api.delete(`/news/${n._id}`);
      toast.success("Actualité supprimée");
      charger();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const getBadgeColor = (badge) => {
    const c = {
      HOT: "#ef4444",
      NOUVEAU: "#10b981",
      URGENT: "#f59e0b",
    };
    return c[badge] || "#94a3b8";
  };

  const getCatColor = (cat) => {
    const c = {
      ANNONCE: "#8b5cf6",
      NOUVEAUTE: "#10b981",
      TECH: "#06b6d4",
      MARCHE: "#f59e0b",
      PROMO: "#ec4899",
    };
    return c[cat] || "#94a3b8";
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📰 Actualités</h1>
          <p style={styles.subtitle}>
            {news.length} actualité(s) — {news.filter((n) => n.estPublie).length} publiée(s)
          </p>
        </div>
        <button onClick={ouvrirCreation} style={styles.addBtn}>
          <Plus size={18} /> Nouvelle actualité
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : news.length === 0 ? (
        <div style={styles.empty}>
          <Newspaper size={48} color="#64748b" />
          <p>Aucune actualité. Crée-en une !</p>
        </div>
      ) : (
        <div style={styles.list}>
          {news.map((n) => (
            <div key={n._id} style={{
              ...styles.card,
              opacity: n.estPublie ? 1 : 0.5,
              borderColor: n.epingle ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.15)",
            }}>
              {n.epingle && (
                <div style={styles.epingleBadge}>
                  <Pin size={12} /> Épinglée
                </div>
              )}

              <div style={styles.cardLeft}>
                {n.image ? (
                  <img src={n.image} alt={n.titre} style={styles.cardImage} />
                ) : (
                  <div style={styles.cardImagePlaceholder}>
                    <Newspaper size={32} color="#10b981" />
                  </div>
                )}
              </div>

              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <div style={styles.cardTags}>
                    <span style={{
                      ...styles.catTag,
                      background: getCatColor(n.categorie) + "20",
                      color: getCatColor(n.categorie),
                    }}>
                      {n.categorie}
                    </span>
                    {n.badge && (
                      <span style={{
                        ...styles.badge,
                        background: getBadgeColor(n.badge),
                      }}>
                        {n.badge}
                      </span>
                    )}
                    {!n.estPublie && (
                      <span style={styles.draftBadge}>Brouillon</span>
                    )}
                  </div>
                  <div style={styles.cardMeta}>
                    <Calendar size={12} color="#94a3b8" />
                    <span style={styles.metaText}>
                      {formatDateTime(n.createdAt)}
                    </span>
                    <Eye size={12} color="#94a3b8" />
                    <span style={styles.metaText}>{n.vues || 0}</span>
                  </div>
                </div>

                <h3 style={styles.cardTitle}>{n.titre}</h3>
                {n.extrait && <p style={styles.cardExtrait}>{n.extrait}</p>}
                <p style={styles.cardContenu}>
                  {n.contenu.length > 150
                    ? n.contenu.substring(0, 150) + "..."
                    : n.contenu}
                </p>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => toggleEpingle(n)}
                    style={{
                      ...styles.actionBtn,
                      color: n.epingle ? "#f59e0b" : "#94a3b8",
                    }}
                    title={n.epingle ? "Désépingler" : "Épingler"}
                  >
                    <Pin size={14} />
                    {n.epingle ? "Désépingler" : "Épingler"}
                  </button>
                  <button
                    onClick={() => togglePublie(n)}
                    style={{
                      ...styles.actionBtn,
                      color: n.estPublie ? "#94a3b8" : "#10b981",
                    }}
                  >
                    {n.estPublie ? <EyeOff size={14} /> : <Eye size={14} />}
                    {n.estPublie ? "Brouillon" : "Publier"}
                  </button>
                  <button
                    onClick={() => ouvrirEdition(n)}
                    style={{ ...styles.actionBtn, color: "#06b6d4" }}
                  >
                    <Edit2 size={14} /> Modifier
                  </button>
                  <button
                    onClick={() => supprimer(n)}
                    style={{ ...styles.actionBtn, color: "#ef4444" }}
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div style={styles.modalOverlay} onClick={() => setModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editId ? "✏️ Modifier l'actualité" : "✨ Nouvelle actualité"}
              </h3>
              <button onClick={() => setModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.field}>
                <label style={styles.label}>Titre *</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="Titre de l'actualité"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Extrait (résumé court)</label>
                <input
                  type="text"
                  value={form.extrait}
                  onChange={(e) => setForm({ ...form, extrait: e.target.value })}
                  placeholder="Résumé en une phrase..."
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Contenu *</label>
                <textarea
                  value={form.contenu}
                  onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                  placeholder="Contenu complet de l'actualité..."
                  style={{ ...styles.input, minHeight: "150px" }}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Image (URL)</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  style={styles.input}
                />
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Catégorie</label>
                  <select
                    value={form.categorie}
                    onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                    style={styles.input}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    style={styles.input}
                  >
                    {BADGES.map((b) => (
                      <option key={b} value={b}>{b || "Aucun"}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.checkboxRow}>
                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.epingle}
                    onChange={(e) => setForm({ ...form, epingle: e.target.checked })}
                    style={styles.checkInput}
                  />
                  <Pin size={14} /> Épingler en haut
                </label>
                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.estPublie}
                    onChange={(e) => setForm({ ...form, estPublie: e.target.checked })}
                    style={styles.checkInput}
                  />
                  <Eye size={14} /> Publier immédiatement
                </label>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setModal(false)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button onClick={sauvegarder} style={styles.confirmBtn}>
                {editId ? "Modifier" : "Créer"}
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
    marginBottom: "24px",
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
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    border: "none",
    borderRadius: "10px",
    color: "#0a0f0d",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
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
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    display: "flex",
    gap: "20px",
    background: "rgba(17,26,20,0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "16px",
    padding: "20px",
    position: "relative",
    transition: "all 0.3s",
  },
  epingleBadge: {
    position: "absolute",
    top: "-8px",
    right: "20px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(245,158,11,0.4)",
  },
  cardLeft: {
    flexShrink: 0,
  },
  cardImage: {
    width: "120px",
    height: "120px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  cardImagePlaceholder: {
    width: "120px",
    height: "120px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(52,211,153,0.05))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  cardTags: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  catTag: {
    padding: "3px 8px",
    borderRadius: "5px",
    fontSize: "10px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  badge: {
    padding: "3px 8px",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "bold",
  },
  draftBadge: {
    padding: "3px 8px",
    background: "rgba(100,116,139,0.2)",
    border: "1px solid rgba(100,116,139,0.3)",
    borderRadius: "5px",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "bold",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  metaText: {
    color: "#94a3b8",
    fontSize: "11px",
    marginRight: "10px",
  },
  cardTitle: {
    color: "#fff",
    fontSize: "17px",
    fontWeight: "bold",
    marginBottom: "6px",
  },
  cardExtrait: {
    color: "#10b981",
    fontSize: "12px",
    marginBottom: "6px",
    fontStyle: "italic",
  },
  cardContenu: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.5,
    marginBottom: "14px",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid rgba(16,185,129,0.1)",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    background: "rgba(10,15,13,0.5)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },
  // Modal
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
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
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
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "6px",
    fontWeight: "600",
  },
  input: {
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
  row: {
    display: "flex",
    gap: "12px",
  },
  checkboxRow: {
    display: "flex",
    gap: "16px",
    marginTop: "8px",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    padding: "8px 12px",
    background: "rgba(10,15,13,0.5)",
    borderRadius: "8px",
    border: "1px solid rgba(16,185,129,0.15)",
  },
  checkInput: {
    cursor: "pointer",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
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
};