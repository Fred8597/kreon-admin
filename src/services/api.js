import axios from "axios";

// URL de base du backend
const API_URL = "http://localhost:5000/api";

// Instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur : ajoute automatiquement le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kreon_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur : si erreur 401 → déconnexion auto
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("kreon_admin_token");
      localStorage.removeItem("kreon_admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;