// Formater un montant en XAF
export const formatXAF = (montant) => {
  if (montant === null || montant === undefined) return "0 XAF";
  return new Intl.NumberFormat("fr-FR").format(montant) + " XAF";
};

// Formater une date
export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Formater une date avec heure
export const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Couleur selon le type de transaction
export const getTransactionColor = (type) => {
  const colors = {
    RECHARGE: "#10b981",
    RETRAIT: "#ef4444",
    INVESTISSEMENT: "#06b6d4",
    GAIN_ROI: "#f59e0b",
    COMMISSION: "#ec4899",
    BONUS: "#8b5cf6",
    REMBOURSEMENT: "#94a3b8",
  };
  return colors[type] || "#94a3b8";
};

// Label friendly pour les types
export const getTransactionLabel = (type) => {
  const labels = {
    RECHARGE: "Recharge",
    RETRAIT: "Retrait",
    INVESTISSEMENT: "Investissement",
    GAIN_ROI: "Gain ROI",
    COMMISSION: "Commission",
    BONUS: "Bonus",
    REMBOURSEMENT: "Remboursement",
  };
  return labels[type] || type;
};