import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { X } from "lucide-react";


function GlobalBanner() {
  const [banner, setBanner] = useState(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const dismissedId = localStorage.getItem("dismissedBannerId");
    if (dismissedId) return; // ✅ Daha önce kapatıldıysa gösterme

    const fetchBanner = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) setBanner(data);
    };

    fetchBanner();
  }, []);

  const handleClose = () => {
    setClosed(true);
    if (banner?.id) {
      localStorage.setItem("dismissedBannerId", banner.id);
    }
   window.dispatchEvent(
  new CustomEvent("toast", {
    detail: { type: "info", text: "🔕 Duyuru kapatıldı " }
  })
);

  };

  if (!banner || closed) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full z-[9999] animate-fadeIn"
      style={{ animation: "fadeIn 0.5s ease" }}
    >
      <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-black font-semibold text-center py-3 shadow-[0_0_15px_rgba(255,215,0,0.6)]">
        <div className="flex items-center justify-center px-4">
          <span className="text-sm sm:text-base break-words text-center leading-snug">
            🔔 {banner.title} — {banner.message}
          </span>
        </div>

        {/* ✅ X tuşu */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-red-600 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default GlobalBanner;
