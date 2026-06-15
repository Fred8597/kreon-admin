import { useState, useEffect } from "react"
import { Settings as SettingsIcon, Save, Smartphone } from "lucide-react"
import toast from "react-hot-toast"
import api from "../services/api"

export default function Settings() {
  const [settings, setSettings] = useState({
    numeroAgentMTN: "",
    numeroAgentORANGE: "",
    nomAgentMTN: "",
    nomAgentORANGE: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/settings")
        setSettings({
          numeroAgentMTN: data.numeroAgentMTN || "",
          numeroAgentORANGE: data.numeroAgentORANGE || "",
          nomAgentMTN: data.nomAgentMTN || "KREON",
          nomAgentORANGE: data.nomAgentORANGE || "KREON",
        })
      } catch (error) {
        toast.error("Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put("/settings", settings)
      toast.success("Paramètres sauvegardés ✅")
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#86efac", padding: 40 }}>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <SettingsIcon size={28} color="#10b981" /> Paramètres
        </h1>
        <p style={styles.subtitle}>Configuration des numéros agents Mobile Money</p>
      </div>

      <form onSubmit={handleSave} style={styles.form}>
        {/* MTN */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <Smartphone size={20} color="#fbbf24" /> MTN Money
          </h2>

          <div style={styles.field}>
            <label style={styles.label}>Numéro agent MTN *</label>
            <input
              type="tel"
              placeholder="672599783"
              value={settings.numeroAgentMTN}
              onChange={(e) =>
                setSettings({ ...settings, numeroAgentMTN: e.target.value })
              }
              style={styles.input}
              required
            />
            <p style={styles.hint}>
              Numéro vers lequel les users feront leurs paiements MTN
            </p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nom du destinataire MTN</label>
            <input
              type="text"
              placeholder="KREON"
              value={settings.nomAgentMTN}
              onChange={(e) =>
                setSettings({ ...settings, nomAgentMTN: e.target.value })
              }
              style={styles.input}
            />
          </div>
        </div>

        {/* ORANGE */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <Smartphone size={20} color="#fb923c" /> Orange Money
          </h2>

          <div style={styles.field}>
            <label style={styles.label}>Numéro agent Orange *</label>
            <input
              type="tel"
              placeholder="696554872"
              value={settings.numeroAgentORANGE}
              onChange={(e) =>
                setSettings({ ...settings, numeroAgentORANGE: e.target.value })
              }
              style={styles.input}
              required
            />
            <p style={styles.hint}>
              Numéro vers lequel les users feront leurs paiements Orange
            </p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nom du destinataire Orange</label>
            <input
              type="text"
              placeholder="KREON"
              value={settings.nomAgentORANGE}
              onChange={(e) =>
                setSettings({ ...settings, nomAgentORANGE: e.target.value })
              }
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" disabled={saving} style={styles.saveBtn}>
          <Save size={16} />
          {saving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
        </button>
      </form>
    </div>
  )
}

const styles = {
  page: { padding: "24px", color: "#f0fdf4" },
  header: { marginBottom: "24px" },
  title: { fontSize: "1.8rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" },
  subtitle: { fontSize: "0.85rem", color: "#86efac" },
  form: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px" },
  card: {
    padding: "20px",
    backgroundColor: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "16px",
  },
  cardTitle: { fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" },
  label: { fontSize: "0.82rem", color: "#86efac", fontWeight: 600 },
  input: {
    padding: "12px 14px",
    backgroundColor: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
  },
  hint: { fontSize: "0.7rem", color: "#6b7280", marginTop: "4px" },
  saveBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#0a0f0d",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
  },
}