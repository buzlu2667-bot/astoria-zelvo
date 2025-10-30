// ✅ ULTRA PREMIUM Maintenance Page + Neon Countdown
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import { supabase } from "../lib/supabaseClient";

export default function MaintenancePage() {
  const [until, setUntil] = useState(null);
  const [message, setMessage] = useState(
    "🛠 ELITEMART bakımda! En kısa sürede geliyoruz 💛"
  );
  const [timer, setTimer] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: st } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "maintenance")
        .maybeSingle();

      if (!alive) return;
      if (st?.value?.message) setMessage(st.value.message);
      if (st?.value?.until) setUntil(st.value.until);
    })();
    return () => (alive = false);
  }, []);

  useEffect(() => {
    if (!until) return;
    const fn = () => {
      const now = new Date();
      const end = new Date(until);
      const diff = end - now;
      if (diff <= 0) return;

      setTimer({
        h: String(Math.floor(diff / 3600000)).padStart(2, "0"),
        m: String(Math.floor(diff / 60000) % 60).padStart(2, "0"),
        s: String(Math.floor(diff / 1000) % 60).padStart(2, "0"),
      });
    };
    fn();
    const int = setInterval(fn, 1000);
    return () => clearInterval(int);
  }, [until]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-white relative overflow-hidden px-6">

      {/* 🔷 Arka Plan Grid Animasyonu */}
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-[0.12] animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-black to-neutral-900 opacity-90" />

      {/* 🛠 svg karakter */}
      <div className="relative w-56 h-56 z-10 mb-6">
       <img
  src="/assets/maintenance-bot.png"
  className="w-72 mx-auto animate-bounce drop-shadow-[0_0_40px_rgba(255,215,0,0.4)]"
  alt="Maintenance Bot"
/>
      </div>

      {/* Mesaj */}
      <h1 className="relative text-2xl md:text-3xl font-extrabold text-yellow-400 drop-shadow-[0_0_15px_rgba(255,214,0,.5)] text-center max-w-xl z-10">
        {message}
      </h1>

      {/* Sayaç */}
      {until && (
        <div className="relative flex gap-4 mt-8 z-10">
          <TimeBox label="SAAT" value={timer.h} />
          <TimeBox label="DAKİKA" value={timer.m} />
          <TimeBox label="SANİYE" value={timer.s} />
        </div>
      )}

      {/* ✅ Admin için gizli geçit */}
      <Link
        to="/admin"
        className="relative mt-10 text-xs opacity-40 hover:opacity-100 hover:text-yellow-300 transition z-10"
      >
        👑
      </Link>

      <p className="relative mt-8 text-gray-500 text-xs z-10 tracking-widest">
        © {new Date().getFullYear()} ASTORIA ZELVO
      </p>
    </div>
  );
}

function TimeBox({ label, value }) {
  return (
    <div className="
      bg-black/50 backdrop-blur-md border border-yellow-500/20
      px-6 py-4 rounded-2xl shadow-[0_0_25px_rgba(255,234,0,.35)]
      flex flex-col items-center
      min-w-[90px]
    ">
      <span className="text-4xl font-extrabold text-yellow-300 drop-shadow">
        {value}
      </span>
      <span className="text-[0.65rem] opacity-60 mt-1 tracking-wider">{label}</span>
    </div>
  );
}
