// ✅ src/pages/admin/AdminDashboard.jsx — FULL PREMIUM FINAL
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {
  const TRY = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [maint, setMaint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const [until, setUntil] = useState("");
  const [message, setMessage] = useState("Bakımdayız, en kısa sürede tekrar buradayız!");
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - 30);

    const { data: odRaw } = await supabase
  .from("orders")
  .select("*")
  .gte("created_at", since.toISOString());

const od = (odRaw || []).map(o => ({
  id: o.id,
total: o.final_amount ?? o.total_amount ?? 0,
  created_at: o.created_at ?? o.createdAt,
  status: o.status ?? o.order_status ?? "unknown",
}));

setOrders(od);


      const { data: st } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "maintenance")
        .maybeSingle();

      setOrders(od || []);

      // 📊 Günlük ciroyu hesapla
if (od?.length) {
  const grouped = {};
  od.forEach(o => {
    const day = new Date(o.created_at).toLocaleDateString("tr-TR");
  grouped[day] = (grouped[day] || 0) + Number(o.total || 0);
  });

  const chartArr = Object.entries(grouped).map(([date, total]) => ({
    date,
    total,
  }));

  setChartData(chartArr.reverse());
}



      if (st?.value) {
        setMaint(st.value.enabled);
        setMessage(st.value.message ?? message);
        setUntil(st.value.until ?? "");
      }
      setLoading(false);
    })();
  }, []);

  // ✅ Countdown Timer
  useEffect(() => {
    if (!maint || !until) return;
    const interval = setInterval(() => {
      const diff = new Date(until) - new Date();
      if (diff <= 0) {
        setCountdown("Süre doldu");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h} sa ${m} dk ${s} sn`);
    }, 1000);
    return () => clearInterval(interval);
  }, [maint, until]);

  const sums = useMemo(() => {
   const total = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    return {
      total,
      count: orders.length,
      avg: orders.length ? total / orders.length : 0,
    };
  }, [orders]);

  const applyMaintenance = async () => {
    const enabled = true;
    await supabase.from("settings").upsert({
      key: "maintenance",
      value: { enabled, until, message },
    });

    setMaint(true);
    setModal(false);
  };

  const disableMaintenance = async () => {
    await supabase.from("settings").upsert({
      key: "maintenance",
      value: { enabled: false, until: "", message: "" },
    });

    setMaint(false);
    setCountdown("");
  };

  if (loading) return <div className="text-white">Yükleniyor…</div>;

  return (
       <div className="space-y-6 text-white mt-24">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600 bg-clip-text text-transparent animate-pulse">
  ⚙️ Admin Dashboard
</h1>


      {/* 🔥 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Toplam Ciro" value={TRY.format(sums.total)} />
        <Card title="Sipariş Sayısı" value={sums.count} />
        <Card title="Ort. Sepet" value={TRY.format(sums.avg)} />
      </div>

{/* 📊 Günlük Ciro Grafiği */}
<div className="mt-10 bg-neutral-900/80 border border-yellow-600/30 rounded-2xl p-6 shadow-lg">
  <h2 className="text-xl font-bold text-yellow-400 mb-4">
    💹 Son 30 Günlük Ciro Grafiği
  </h2>

  {chartData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" tick={{ fill: "#ccc", fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#ccc" }} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #555", borderRadius: "8px" }}
          labelStyle={{ color: "#ffda6b" }}
          formatter={(v) => TRY.format(v)}
        />
        <Bar dataKey="total" fill="url(#goldGradient)" radius={[6, 6, 0, 0]} />
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD700" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#B8860B" stopOpacity={0.7}/>
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-gray-400 text-sm">Grafik verisi bulunamadı.</p>
  )}
</div>



      {/* 🛠 Bakım Kontrolleri */}
      <div className="mt-4 flex flex-wrap gap-3 items-center">
  <button
    onClick={() => setModal(true)}
    className="px-4 py-2 rounded-lg bg-yellow-600 text-black font-bold hover:bg-yellow-500"
  >
    🛑 Bakım Ayarları
  </button>

  {/* 🔄 Sıfırlama butonu HER ZAMAN görünür */}
  <button
    onClick={() => window.location.reload()}
    className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)] transition"
  >
    🔄 Sıfırla
  </button>

  {maint && (
    <>
      <button
        onClick={disableMaintenance}
        className="px-4 py-2 rounded-lg bg-green-600 font-bold hover:bg-green-700"
      >
        ✅ Bakım Kapalı
      </button>

      <div className="px-4 py-2 rounded-lg bg-neutral-800 border border-yellow-600 self-center">
        ⏳ {countdown || "Hesaplanıyor…"}
      </div>
    </>
  )}
</div>

      {/* 🪄 Maintenance Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4">
          <div className="bg-neutral-900 p-6 rounded-xl max-w-md w-full relative border border-yellow-600/30 shadow-2xl animate-slide-in">
            <button onClick={() => setModal(false)} className="absolute top-3 right-3 text-2xl">✕</button>

            <h3 className="text-lg font-bold text-yellow-400 mb-4">🔧 Bakım Ayarları</h3>

            <label className="text-sm text-gray-300">Mesaj</label>
            <textarea
              className="mt-1 w-full bg-neutral-800 rounded p-2 border border-neutral-700"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <label className="text-sm text-gray-300 mt-4">Bitiş Tarihi & Saati</label>
            <input
              type="datetime-local"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="mt-1 w-full bg-neutral-800 rounded p-2 border border-neutral-700"
            />

            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <Preset hours={1} setUntil={setUntil} />
              <Preset hours={6} setUntil={setUntil} />
              <Preset hours={24} setUntil={setUntil} />
              <Preset hours={72} setUntil={setUntil} />
            </div>

            <button
              onClick={applyMaintenance}
              className="mt-5 w-full py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
            >
              🚫 Bakımı Aç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Preset({ hours, setUntil }) {
  return (
    <button
      onClick={() => {
        const dt = new Date();
        dt.setHours(dt.getHours() + hours);
        setUntil(dt.toISOString().slice(0, 16));
      }}
      className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-yellow-500"
    >
      +{hours} Saat
    </button>
  );
}

function Card({ title, value }) {
  return (
    <div className="
      relative p-5 bg-gradient-to-br from-[#111] via-[#0a0a0a] to-[#151515]
      rounded-2xl border border-yellow-500/20 shadow-[0_0_20px_rgba(255,215,0,0.15)]
      hover:shadow-[0_0_35px_rgba(255,215,0,0.4)] transition-all duration-300 group overflow-hidden
    ">
      {/* ✨ Arka plan ışık efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
      
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
  );
}

