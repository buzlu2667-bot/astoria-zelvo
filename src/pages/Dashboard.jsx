import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

// ₺ Format
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
      <div className="flex justify-between text-sm mb-1 text-gray-600">
        <span>🎁 Hediye Seviyesi</span>
        <span>{inTier.toLocaleString("tr-TR")} / 20.000</span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#f27a1a] to-yellow-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {remaining === 0 ? (
          <span className="text-green-600 font-semibold">
            🎉 Yeni ödül kazandın!
          </span>
        ) : (
          <>Sonraki ödül için{" "}
            <span className="text-[#f27a1a] font-semibold">
              {remaining.toLocaleString("tr-TR")} puan
            </span>{" "}
            kaldı.</>
        )}
      </p>
    </>
  );
}

// MAIN COMPONENT
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const { favorites } = useFavorites?.() || { favorites: [] };

  // USER + PROFILE LOAD
  useEffect(() => {
    async function run() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return navigate("/", { replace: true });

      setUser(data.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();

      if (profile?.username) {
        setUser((prev) => ({
          ...prev,
          profile_username: profile.username,
        }));
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", data.user.id);

      setOrders(ordersData || []);
    }
    run();
  }, [navigate]);

  // Toplam harcama
  const totalSpent = useMemo(() => {
    return orders.reduce(
      (sum, o) => sum + (Number(o.final_amount ?? o.total_amount ?? 0) || 0),
      0
    );
  }, [orders]);

  const points = Math.max(0, Math.floor(totalSpent));
  const favCount = Array.isArray(favorites) ? favorites.length : 0;
  const STEP = 20000;
  const tier = Math.floor(points / STEP);
  const remaining = Math.max(0, (tier + 1) * STEP - points);

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Müşteri Paneli</h1>
          <p className="text-gray-500 text-sm mt-1">{user?.email}</p>

          {user?.profile_username && (
            <p className="text-sm mt-1 text-[#f27a1a] font-semibold">
              @{user.profile_username}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-gray-500 text-sm">Harcama</p>
          <p className="text-xl font-bold text-gray-800">
            {TRY.format(totalSpent)}
          </p>
        </div>
      </div>

      {/* PANEL */}
      <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
          <StatCard label="Sipariş" value={orders.length} />
          <StatCard label="Favori" value={favCount} />
          <StatCard label="Puan" value={points.toLocaleString("tr-TR")} />
          <StatCard label="Hediye" value={tier} />
        </div>

        {/* Loyalty */}
        <LoyaltyBar points={points} />

        {/* Ödül Kartı */}
        <div className="mt-6 bg-gray-50 border border-gray-300 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Kazanılan Hediye</p>
            <p className="text-xl font-bold text-gray-800">{tier} adet</p>
          </div>

          <div className="text-right">
            {remaining === 0 ? (
              <p className="text-green-600 font-semibold">
                🎉 Yeni ödül kazandın!
              </p>
            ) : (
              <>
                <p className="text-xs text-gray-500">Sonraki ödül:</p>
                <p className="text-lg font-bold text-[#f27a1a]">
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

// Stat Box
function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-300 rounded-xl py-4 shadow-sm flex flex-col items-center">
      <span className="text-xs text-gray-500">{label}</span>

      <span
        className="mt-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg font-bold text-gray-800 text-base"
        title={String(value)}
      >
        {value}
      </span>
    </div>
  );
}
