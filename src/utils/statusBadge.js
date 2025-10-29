export const STATUS = {
  awaiting_payment: {
    txt: "Bekleyen Ödeme",
    icon: "⚠️",
    cls: "text-yellow-400 bg-yellow-500/20 border-yellow-400",
  },
  processing: {
    txt: "Hazırlanıyor",
    icon: "⚙️",
    cls: "text-purple-300 bg-purple-500/20 border-purple-400",
  },
  shipped: {
    txt: "Kargoda",
    icon: "🚚",
    cls: "text-blue-300 bg-blue-500/20 border-blue-400",
  },
  delivered: {
    txt: "Teslim Edildi",
    icon: "✅",
    cls: "text-green-300 bg-green-500/20 border-green-400",
  },
  cancelled: {
    txt: "İptal Edildi",
    icon: "❌",
    cls: "text-red-400 bg-red-500/20 border-red-400",
  },
};

export const STATUS_BADGE = STATUS;
