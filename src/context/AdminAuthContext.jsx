import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement, vérifier si admin déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("kreon_admin_token");
    const adminData = localStorage.getItem("kreon_admin_user");

    if (token && adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  // Connexion (par téléphone)
  const login = async (telephone, password) => {
    try {
      const { data } = await api.post("/auth/login", { telephone, password });

      // Vérifier que c'est bien un admin
      if (data.role !== "admin" && data.role !== "moderator") {
        throw new Error("Accès refusé : vous n'êtes pas administrateur");
      }

      localStorage.setItem("kreon_admin_token", data.token);
      localStorage.setItem("kreon_admin_user", JSON.stringify(data));
      setAdmin(data);

      return { success: true, data };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erreur de connexion";
      return { success: false, message };
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem("kreon_admin_token");
    localStorage.removeItem("kreon_admin_user");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook pour utiliser le contexte facilement
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth doit être utilisé dans AdminAuthProvider");
  }
  return context;
};