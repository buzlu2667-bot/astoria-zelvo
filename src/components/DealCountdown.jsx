import { useEffect, useState } from "react";
import { Flame, Clock } from "lucide-react";

export default function DealCountdown({ endAt }) {
  const [left, setLeft] = useState(endAt - Date.now());

  useEffect(() => {
    const i = setInterval(() => {
      setLeft(endAt - Date.now());
    }, 1000);
    return () => clearInterval(i);
  }, [endAt]);

  if (left <= 0) return null;

  const h = Math.floor(left / 1000 / 60 / 60);
  const m = Math.floor((left / 1000 / 60) % 60);
  const s = Math.floor((left / 1000) % 60);

  return (
    <div
      className="
        inline-flex items-center gap-1.5
        rounded-full
        px-2.5 py-1
        text-[11px] font-semibold
        text-red-700
        bg-gradient-to-r from-red-50 to-orange-50
        border border-red-200
        shadow-sm
      "
    >
      <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />

      <span className="font-mono tracking-tight">
        {h.toString().padStart(2, "0")}:
        {m.toString().padStart(2, "0")}:
        {s.toString().padStart(2, "0")}
      </span>

      <Clock className="w-3 h-3 text-red-400" />
    </div>
  );
}
