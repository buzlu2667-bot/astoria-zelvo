export const STATUS_BADGE = {
  awaiting_payment: {
    text: "Bekleyen Ödeme",
    icon: "⚠️",
    cls: "text-amber-300 font-bold animate-pulseSlow drop-shadow-[0_0_10px_rgba(255,193,7,0.9)] tracking-wide"
  },
  pending: {
    text: "Hazırlanıyor",
    icon: "🟣",
    cls: "bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent font-bold animate-pulseSlow drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] tracking-wide"
  },
  shipped: {
    text: "Kargoda",
    icon: "🚚",
    cls: "bg-gradient-to-r from-purple-300 to-rose-300 bg-clip-text text-transparent font-bold animate-truckMove drop-shadow-[0_0_12px_rgba(244,114,182,0.8)] tracking-wide"
  },
  delivered: {
    text: "Teslim Edildi",
    icon: "✅",
    cls: "text-emerald-300 font-bold animate-bounceCheck drop-shadow-[0_0_14px_rgba(16,185,129,0.85)] tracking-wide"
  },
  cancelled: {
    text: "İptal",
    icon: "❌",
    cls: "text-red-400 font-bold drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] tracking-wide opacity-80"
  },
};
