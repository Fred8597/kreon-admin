import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Shield, Phone, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!telephone || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    const result = await login(telephone, password);
    setLoading(false);

    if (result.success) {
      toast.success(`Bienvenue ${result.data.nom} !`);
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={styles.container}>
      {/* Effets décoratifs en background */}
      <div style={styles.bgGlow1}></div>
      <div style={styles.bgGlow2}></div>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <div style={styles.logoIcon}>
            <Shield size={32} color="#0a0f0d" strokeWidth={2.5} />
          </div>
          <h1 style={styles.title}>KREON ADMIN</h1>
          <p style={styles.subtitle}>Espace administrateur sécurisé</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Téléphone */}
          <div style={styles.inputGroup}>
            <Phone size={18} color="#10b981" style={styles.inputIcon} />
            <input
              type="tel"
              placeholder="Numéro de téléphone (ex: 699999998)"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              style={styles.input}
              autoComplete="tel"
            />
          </div>

          {/* Mot de passe */}
          <div style={styles.inputGroup}>
            <Lock size={18} color="#10b981" style={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={styles.footer}>
          🔒 Connexion réservée aux administrateurs autorisés
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0f0d",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  bgGlow1: {
    position: "absolute",
    top: "-100px",
    left: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(16,185,129,0.15), transparent)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    bottom: "-100px",
    right: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(245,158,11,0.1), transparent)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(17, 26, 20, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "24px",
    padding: "40px",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.1)",
  },
  logoWrapper: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logoIcon: {
    width: "70px",
    height: "70px",
    margin: "0 auto 16px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 30px rgba(16,185,129,0.4)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #10b981, #f59e0b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
    letterSpacing: "2px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "16px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "16px 48px",
    background: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.3s",
  },
  eyeBtn: {
    position: "absolute",
    right: "16px",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "4px",
  },
  submitBtn: {
    padding: "16px",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    border: "none",
    borderRadius: "12px",
    color: "#0a0f0d",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s",
    marginTop: "8px",
  },
  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "12px",
    marginTop: "24px",
  },
};