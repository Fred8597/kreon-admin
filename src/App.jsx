import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Recharges from "./pages/Recharges";
import Withdrawals from "./pages/Withdrawals";
import News from "./pages/News";
import UserDetail from "./pages/UserDetail";
import GiftCodes from "./pages/GiftCodes";
import Tirages from "./pages/Tirages";
import TransactionReferences from "./pages/TransactionReferences";
import Settings from "./pages/Settings";

// Composant qui protège les routes
function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#10b981",
        }}
      >
        Chargement...
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function App() {
  // ===== PING ANTI-VEILLE RENDER (toutes les 14 min) =====
  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const pingURL = baseURL.replace("/api", "/");

    const ping = () => {
      fetch(pingURL).catch(() => {});
    };

    ping();
    const interval = setInterval(ping, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111a14",
              color: "#fff",
              border: "1px solid rgba(16,185,129,0.3)",
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/recharges" element={<ProtectedRoute><Recharges /></ProtectedRoute>} />
          <Route path="/withdrawals" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
          <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
          <Route path="/giftcodes" element={<ProtectedRoute><GiftCodes /></ProtectedRoute>} />
          <Route path="/tirages" element={<ProtectedRoute><Tirages /></ProtectedRoute>} />
          <Route path="/transaction-references" element={<ProtectedRoute><TransactionReferences /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;