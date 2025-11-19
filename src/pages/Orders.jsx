import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { STATUS } from "../utils/statusBadge";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

export default function Orders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [itemsByOrder, setItemsByOrder] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;
      if (!user) return navigate("/dashboard");

      const { data: od } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (!alive) return;
      setOrders(od || []);

      const ids = (od || []).map((o) => o.id);
      if (ids.length > 0) {
      const { data: its } = await supabase
  .from("order_items")
  .select("id, order_id, product_id, quantity, unit_price, delivered_code, products:product_id(image_url,name)")
  .in("order_id", ids)
  .order("id", { ascending: false });


        const grouped = {};
        (its || []).forEach((it) => {
          (grouped[it.order_id] ||= []).push(it);
        });

        if (alive) setItemsByOrder(grouped);
      }
      // ♻️ Realtime dinleme: kod teslim edildiğinde anında yenile
supabase
  .channel("realtime:order_items")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "order_items" },
    (payload) => {
      console.log("🟢 order_items değişti → refreshOrders()");
      setTimeout(() => window.location.reload(), 1000); // taze veri gelsin
    }
  )
  .subscribe();

      setLoading(false);
    })();
    return () => (alive = false);
  }, [navigate]);

  const totals = useMemo(() => {
    const m = {};
    for (const o of orders) {
      const arr = itemsByOrder[o.id] || [];
      m[o.id] = arr.reduce(
        (s, it) =>
          s +
          (Number(it.unit_price) || 0) * (Number(it.quantity) || 1),
        0
      );
    }
    return m;
  }, [orders, itemsByOrder]);

  async function handleDelete(id) {
    if (!window.confirm("Bu siparişi silmek istediğine emin misin?")) return;
    try {
      await supabase.from("order_items").delete().eq("order_id", id);
      await supabase.from("orders").delete().eq("id", id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Sipariş silinemedi!");
    }
  }

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        ⏳ Sipariş bilgileri yükleniyor...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>

     {orders.length === 0 ? (
  <div className="flex flex-col items-center justify-center text-center py-16 animate-fadeIn">
    {/* 👜 Premium Illustration */}
    <img
      src="/assets/empty-orders-elegant.png"
      alt="Henüz sipariş yok"
      className="w-52 sm:w-72 opacity-90 drop-shadow-[0_0_20px_rgba(255,215,0,0.25)] mb-6"
    />

    <h2 className="text-2xl font-bold text-yellow-400 mb-2">
      Henüz siparişin yok 💛
    </h2>
    <p className="text-gray-400 mb-6">
      Alışverişin ışıltısını keşfet, seni bekleyen premium ürünler var.
    </p>

    <Link
      to="/"
      className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-lg text-black font-semibold hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,215,0,0.35)]"
    >
      🛍️ Alışverişe Başla
    </Link>
  </div>
) : (
  // mevcut kodun (sipariş listesi)
  <div className="space-y-4">
    {orders.map((o) => {
      const b = STATUS[o.status] ?? STATUS.pending ?? { cls: "", txt: "" };
      const created = new Date(o.created_at).toLocaleString("tr-TR");

           return (
 <div
  key={o.id}
  className="
    orders-card
    bg-neutral-900
    border border-neutral-800
    rounded-2xl
    p-5
    shadow-[0_0_15px_rgba(255,215,0,0.08)]
    transition-all
  "
>

    <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div>
        <p className="font-semibold">Sipariş #{o.id}</p>
        <p className="text-gray-400 text-sm">{created}</p>
      </div>

      <div className="flex items-center gap-3">

     <span
  className={`px-3 py-1 rounded-full text-xs font-bold border ${
    b?.cls || "text-yellow-400 border-yellow-400"
  } shadow-[0_0_12px_rgba(168,85,247,0.7)] border-purple-400/50 status-blink`}
>
  {/* 🟣 Durum ismi (txt veya text fark etmez) */}
  {b?.txt || b?.text || "Bekleyen Ödeme"}

  {/* ⚠️ Bekleyen ödeme */}
  {["pending", "awaiting_payment"].includes(o.status) && (
    <span className="ml-2 text-yellow-400">⚠️</span>
  )}

  {/* ⚙️ Hazırlanıyor */}
  {o.status === "processing" && (
    <span className="ml-2 text-purple-400">⚙️</span>
  )}

  {/* 🚚 Kargoda */}
  {o.status === "shipped" && <span className="truck-anim ml-2">🚚</span>}

  {/* ✅ Teslim edildi */}
  {o.status === "delivered" && <span className="ml-2">✅</span>}

  {/* ❌ İptal edildi */}
  {o.status === "cancelled" && <span className="ml-2">❌</span>}
</span>





        {/* ✅ Final Tutar eğer varsa göster */}
<span className="text-lg font-bold text-green-400">
  {TRY(o.final_amount ?? o.total_amount)}
</span>
{/* ✅ Kupon bilgisi */}
{o.discount_amount > 0 && (
  <p className="text-xs text-blue-400 font-semibold">
    Kupon: {o.coupon} — İndirim: -{TRY(o.discount_amount)}
  </p>
)}

      </div>

    </header>


                {/* Ürünler */}
              <div className="orders-items grid sm:grid-cols-2 md:grid-cols-3 gap-3">
  {(itemsByOrder[o.id] || []).map((it) => {
    // 🎨 Görsel fallback (Epin ürünleri dahil)
    const p = it.products || {};
    const imageSrc =
      p.image_url?.startsWith?.("http")
        ? p.image_url
        : p.image_url
        ? `/products/${p.image_url}`
        : p.name?.toLowerCase()?.includes("knight")
        ? "/products/knight3.png"
        : p.name?.toLowerCase()?.includes("valorant")
        ? "/products/valorant3.png"
        : p.name?.toLowerCase()?.includes("pubg")
        ? "/products/pubg3.png"
        : p.name?.toLowerCase()?.includes("steam")
        ? "/products/steam3.png"
        : "/products/default.png";

    return (
      <div
        key={it.id}
      className="
  order-item-card
  flex flex-row items-center gap-3 
  bg-neutral-800 
  rounded-xl 
  p-3 
  border border-neutral-700/40
"


      >
        {/* 🖼️ Görsel kutusu biraz büyütüldü */}
       <div className="order-image-box">

          <img
            src={imageSrc}
            className="w-full h-full object-cover object-center"
            alt={p.name || ""}
          />
        </div>

       {/* 🧾 Ürün bilgileri */}
<div className="flex flex-col justify-center flex-1 min-w-0">
  <div className="font-semibold text-yellow-300 text-sm leading-tight line-clamp-2 break-words">
    {p.name}
  </div>

  <div className="text-gray-400">× {it.quantity}</div>

  <div className="font-semibold text-green-400 mt-1">
    {TRY(it.unit_price)}
  </div>

          
        </div>
      </div>
    );
  })}
</div>


                {/* Sil & Detay */}
                <footer className="mt-4 flex justify-end gap-3">
                 

                  <Link
                    to={`/orders/${o.id}`}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
                  >
                    Detaya Git →
                  </Link>
                </footer>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


