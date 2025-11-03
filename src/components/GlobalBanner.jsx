import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { X } from "lucide-react";

function GlobalBanner() {
  const [banner, setBanner] = useState(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data, error } = await supabase
        .from("notifications") // tablo adın
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) setBanner(data);
    };

    fetchBanner();
  }, []);

  if (!banner || closed) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999]">
      <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-black font-semibold text-center py-2 shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-pulse">
        <div className="flex items-center justify-center gap-2 px-10">
          <span className="text-sm sm:text-base truncate max-w-[90%]">
            🔔 {banner.title} — {banner.message}
          </span>
        </div>

        {/* ✅ sadece X butonu kaldı */}
        <button
          onClick={() => setClosed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-red-600 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default GlobalBanner;
