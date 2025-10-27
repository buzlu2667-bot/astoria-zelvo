// ✅ src/pages/admin/AdminDashboard.jsx — FULL PREMIUM FINAL
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {
  const TRY = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

  const [orders, setOrders] = useState([]);
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

      const { data: od } = await supabase
        .from("orders")
        .select("id,total_amount,created_at,status")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });

      const { data: st } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "maintenance")
        .maybeSingle();

      setOrders(od || []);

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
    const total = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
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
    <div className="space-y-6 text-white">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* 🔥 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Toplam Ciro" value={TRY.format(sums.total)} />
        <Card title="Sipariş Sayısı" value={sums.count} />
        <Card title="Ort. Sepet" value={TRY.format(sums.avg)} />
      </div>

      {/* 🛠 Bakım Kontrolleri */}
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 rounded-lg bg-yellow-600 text-black font-bold hover:bg-yellow-500"
        >
          🛑 Bakım Ayarları
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
    <div className="p-4 bg-neutral-900 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
