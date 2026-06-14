import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Users as UsersIcon,
  Search,
  Eye,
  Shield,
  UserX,
  UserCheck,
  DollarSign,
  X,
} from "lucide-react";
import { formatXAF, formatDateTime } from "../utils/format";
import toast from "react-hot-toast";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal solde
  const [modalSolde, setModalSolde] = useState(null);
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    chargerUsers();
  }, [page, roleFilter]);

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      chargerUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const chargerUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const { data } = await api.get("/admin/users", { params });
      setUsers(data.users);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  // Changer le rôle
  const changerRole = async (userId, nouveauRole) => {
    if (!confirm(`Changer le rôle en "${nouveauRole}" ?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nouveauRole });
      toast.success(`Rôle changé en ${nouveauRole}`);
      chargerUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  // Suspendre / Réactiver
  const toggleStatut = async (userId, estActif) => {
    const action = estActif ? "suspendre" : "réactiver";
    if (!confirm(`Voulez-vous ${action} cet utilisateur ?`)) return;
    try {
      await api.put(`/admin/users/${userId}/statut`);
      toast.success(`Utilisateur ${estActif ? "suspendu" : "réactivé"}`);
      chargerUsers();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  // Modifier solde
  const ouvrirModalSolde = (user) => {
    setModalSolde(user);
    setMontant("");
    setDescription("");
  };

  const modifierSolde = async () => {
    if (!montant) {
      toast.error("Saisis un montant");
      return;
    }
    try {
      await api.put(`/admin/users/${modalSolde._id}/solde`, {
        montant: parseInt(montant),
        description,
      });
      toast.success("Solde modifié avec succès");
      setModalSolde(null);
      chargerUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  // Badge rôle
  const getRoleBadge = (role) => {
    const styles = {
      admin: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
      moderator: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
      user: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
    };
    const s = styles[role] || styles.user;
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "bold",
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
      }}>
        {role}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 Utilisateurs</h1>
          <p style={styles.subtitle}>{total} utilisateur(s) au total</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <Search size={18} color="#10b981" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher (nom, email, téléphone, code...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value);
          }}
          style={styles.select}
        >
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateurs</option>
          <option value="moderator">Modérateurs</option>
          <option value="admin">Administrateurs</option>
        </select>
      </div>

      {/* Tableau */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loading}>Chargement...</div>
        ) : users.length === 0 ? (
          <div style={styles.empty}>Aucun utilisateur trouvé</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Utilisateur</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Solde</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Inscrit</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.avatar}>
                        {u.nom.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={styles.userName}>{u.nom}</p>
                        <p style={styles.userInvites}>
                          {u.totalInvites} filleul(s)
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <p style={styles.text}>{u.email}</p>
                    <p style={styles.textSmall}>{u.telephone}</p>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.codeBadge}>{u.codeParrainage}</span>
                  </td>
                  <td style={styles.td}>
                    <p style={{ ...styles.text, color: "#10b981", fontWeight: "bold" }}>
                      {formatXAF(u.soldePrincipal)}
                    </p>
                  </td>
                  <td style={styles.td}>{getRoleBadge(u.role)}</td>
                  <td style={styles.td}>
                    {u.estActif ? (
                      <span style={{ ...styles.statutBadge, color: "#10b981", background: "rgba(16,185,129,0.1)" }}>
                        ● Actif
                      </span>
                    ) : (
                      <span style={{ ...styles.statutBadge, color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
                        ● Suspendu
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <p style={styles.textSmall}>{formatDateTime(u.createdAt)}</p>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => navigate(`/users/${u._id}`)}
                        style={{ ...styles.actionBtn, color: "#06b6d4" }}
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => ouvrirModalSolde(u)}
                        style={{ ...styles.actionBtn, color: "#f59e0b" }}
                        title="Modifier solde"
                      >
                        <DollarSign size={16} />
                      </button>
                      <select
                        value={u.role}
                        onChange={(e) => changerRole(u._id, e.target.value)}
                        style={styles.miniSelect}
                        title="Changer rôle"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Modérateur</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => toggleStatut(u._id, u.estActif)}
                        style={{ ...styles.actionBtn, color: u.estActif ? "#ef4444" : "#10b981" }}
                        title={u.estActif ? "Suspendre" : "Réactiver"}
                      >
                        {u.estActif ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.pageBtn}
            >
              ← Précédent
            </button>
            <span style={styles.pageInfo}>
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={styles.pageBtn}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* MODAL Modifier Solde */}
      {modalSolde && (
        <div style={styles.modalOverlay} onClick={() => setModalSolde(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                💰 Modifier le solde de {modalSolde.nom}
              </h3>
              <button onClick={() => setModalSolde(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <p style={styles.modalInfo}>
              Solde actuel :{" "}
              <strong style={{ color: "#10b981" }}>
                {formatXAF(modalSolde.soldePrincipal)}
              </strong>
            </p>

            <div style={styles.modalField}>
              <label style={styles.label}>
                Montant (positif = créditer, négatif = débiter)
              </label>
              <input
                type="number"
                placeholder="Ex: 5000 ou -2000"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                style={styles.modalInput}
              />
            </div>

            <div style={styles.modalField}>
              <label style={styles.label}>Description (optionnel)</label>
              <input
                type="text"
                placeholder="Raison de la modification..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.modalInput}
              />
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setModalSolde(null)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button onClick={modifierSolde} style={styles.confirmBtn}>
                Confirmer
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
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  searchBox: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    background: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    padding: "12px 14px",
    background: "rgba(17,26,20,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  tableCard: {
    background: "rgba(17,26,20,0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "rgba(10,15,13,0.5)",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: {
    borderTop: "1px solid rgba(16,185,129,0.05)",
  },
  td: {
    padding: "14px 16px",
    color: "#fff",
    fontSize: "13px",
  },
  text: {
    color: "#fff",
    fontSize: "13px",
  },
  textSmall: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #34d399)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0a0f0d",
    fontWeight: "bold",
  },
  userName: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  userInvites: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },
  codeBadge: {
    padding: "4px 8px",
    background: "rgba(6,182,212,0.1)",
    border: "1px solid rgba(6,182,212,0.3)",
    color: "#06b6d4",
    fontSize: "11px",
    fontWeight: "bold",
    borderRadius: "6px",
    fontFamily: "monospace",
  },
  statutBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  actions: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  actionBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    background: "rgba(10,15,13,0.5)",
    border: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  miniSelect: {
    padding: "6px 8px",
    background: "rgba(10,15,13,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "11px",
    cursor: "pointer",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#10b981",
  },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
  },
  pagination: {
    padding: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    borderTop: "1px solid rgba(16,185,129,0.1)",
  },
  pageBtn: {
    padding: "8px 16px",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "8px",
    color: "#10b981",
    cursor: "pointer",
    fontSize: "13px",
  },
  pageInfo: {
    color: "#fff",
    fontSize: "13px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(8px)",
  },
  modal: {
    background: "rgba(17,26,20,0.95)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "20px",
    padding: "28px",
    width: "100%",
    maxWidth: "480px",
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
  modalInfo: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "20px",
  },
  modalField: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "6px",
  },
  modalInput: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(10,15,13,0.6)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
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