import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

// ₺ format
const TRY = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

// Sadakat Bar
function LoyaltyBar({ points }) {
  const STEP = 20000;
  const tier = Math.floor(points / STEP);
  const currentBase = tier * STEP;
  const nextBase = (tier + 1) * STEP;
  const inTier = points - currentBase;
  const remaining = Math.max(0, nextBase - points);
  const pct = Math.min(100, Math.max(0, (inTier / STEP) * 100));

  return (
    <>
      <div className="flex justify-between text-sm mb-1 opacity-75">
        <span>🎁 Hediye Seviyesi</span>
        <span>{inTier.toLocaleString("tr-TR")} / 20.000</span>
      </div>

      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-rose-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-xs opacity-70">
        {remaining === 0 ? (
          <span className="text-emerald-400 font-semibold">
            🎉 Yeni ödül kazandın!
          </span>
        ) : (
          <>Bir sonraki ödül için{" "}
            <span className="text-yellow-300 font-semibold">
              {remaining.toLocaleString("tr-TR")} puan
            </span>{" "}
            kaldı.</>
        )}
      </p>
    </>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const { favorites } = useFavorites?.() || { favorites: [] };

  useEffect(() => {
    async function run() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return navigate("/", { replace: true });
      setUser(data.user);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", data.user.id);

      setOrders(ordersData || []);
    }
    run();
  }, [navigate]);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  const points = Math.max(0, Math.floor(totalSpent));
  const favCount = Array.isArray(favorites) ? favorites.length : 0;

  const STEP = 20000;
  const tier = Math.floor(points / STEP);
  const remaining = Math.max(0, (tier + 1) * STEP - points);

  return (
    <div className="min-h-screen bg-black text-white">

      <div className="py-5 px-6 flex justify-between border-b border-yellow-500/20">
        <h1 className="text-xl font-bold">🧍‍♀️ Müşteri Paneli</h1>
        <span className="text-yellow-300">{user?.email}</span>
      </div>

      <div className="max-w-4xl mx-auto p-8 mt-10 bg-[#0d0d0d] rounded-2xl border border-yellow-400/20 shadow-xl">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
          <StatCard label="Harcama" value={TRY.format(totalSpent)} />
          <StatCard label="Puan" value={points.toLocaleString("tr-TR")} />
          <StatCard label="Sipariş" value={orders.length} />
          <StatCard label="Favori" value={favCount} />
        </div>

        {/* Sadakat */}
        <LoyaltyBar points={points} />

        {/* 🏆 Ödül Bilgisi */}
        <div className="mt-6 bg-[#151515] border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="text-sm opacity-70">Kazanılan Hediye</p>
              <p className="text-lg font-bold">{tier} adet</p>
            </div>
          </div>

          <div className="text-right">
            {remaining === 0 ? (
              <p className="text-emerald-400 font-semibold">🎉 Yeni ödül kazandın!</p>
            ) : (
              <>
                <p className="text-xs opacity-60">Bir sonraki ödül:</p>
                <p className="font-bold text-yellow-300">
                  {remaining.toLocaleString("tr-TR")} puan
                </p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* Küçük kart */
function StatCard({ label, value }) {
  return (
    <div className="bg-[#111] border border-gray-700 rounded-xl py-4 shadow flex flex-col items-center">
      {/* label (TEK KEZ) */}
      <div className="text-xs opacity-60">{label}</div>

      {/* Değer: esneyen, taşmayan, ortalı pill */}
      <div className="mt-2 w-full flex justify-center">
  <span
    className="
      inline-block px-3 py-1 bg-black border border-yellow-500/30 rounded-lg 
      font-bold tabular-nums text-sm sm:text-base md:text-lg 
      max-w-[100px] sm:max-w-none 
      text-center truncate
    "
    title={String(value)}
  >
    {value}
  </span>
</div>

    </div>
  );
}

