export const STATUS = {
  awaiting_payment: {
    text: "Bekleyen Ödeme",
    icon: "⚠️",
    cls: "text-yellow-400 bg-yellow-500/20 border-yellow-400",
  },
  processing: {
    text: "Hazırlanıyor",
    icon: "⚙️",
    cls: "text-purple-300 bg-purple-500/20 border-purple-400",
  },
  shipped: {
    text: "Kargoda",
    icon: "🚚",
    cls: "text-blue-300 bg-blue-500/20 border-blue-400",
  },
  delivered: {
    text: "Teslim Edildi",
    icon: "✅",
    cls: "text-green-300 bg-green-500/20 border-green-400",
  },
  cancelled: {
    text: "İptal Edildi",
    icon: "❌",
    cls: "text-red-400 bg-red-500/20 border-red-400",
  },

  // ✅ Ekledik: eksik statüler
  pending: {
    text: "Bekleyen Ödeme",
    icon: "⏳",
    cls: "text-yellow-400 bg-yellow-500/20 border-yellow-400",
  },
  unknown: {
    text: "Durum Yok",
    icon: "❔",
    cls: "text-gray-400 bg-neutral-700/40 border-neutral-600",
  },
};

export const STATUS_BADGE = STATUS;
