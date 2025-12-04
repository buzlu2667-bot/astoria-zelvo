import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { STATUS } from "../utils/statusBadge";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

 const STATUS_FILTER_MAP = {
  pending: ["awaiting_payment"],   // Bekliyor
  preparing: ["processing"],       // Hazırlanıyor
  cargo: ["shipped"],              // Kargoda
  completed: ["delivered"],        // Teslim Edildi
  cancelled: ["cancelled"],        // İptal Edildi
};


async function fetchAllOrders(setOrders, setItemsByOrder, setLoading) {
  setLoading && setLoading(true); // reload durumlarında da loading aç

  const { data: ud } = await supabase.auth.getUser();
  const user = ud?.user;

  if (!user) {
    setOrders([]);
    setItemsByOrder({});
    setLoading && setLoading(false);
    return;
  }

  // ORDER LISTESİ
  const { data: od } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  setOrders(od || []);

  // ORDER ITEMS
  const ids = (od || []).map((o) => o.id);

  if (ids.length > 0) {
    const { data: its } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", ids)
      .order("id", { ascending: false });

    const grouped = {};
    (its || []).forEach((it) => {
      (grouped[it.order_id] ||= []).push(it);
    });

    setItemsByOrder(grouped);
  } else {
    setItemsByOrder({});
  }

  setLoading && setLoading(false);
}



export default function Orders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
    const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [itemsByOrder, setItemsByOrder] = useState({});
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("");

// SAYFA İLK AÇILDIĞINDA + ROUTE DEĞİŞİNCE YÜKLE
useEffect(() => {
  fetchAllOrders(setOrders, setItemsByOrder, setLoading);
}, [location.pathname]);




// 4) Supabase session yenilenirse (CRITICAL FIX)
useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(() => {
    fetchAllOrders(setOrders, setItemsByOrder, setLoading);
  });

  return () => listener.subscription.unsubscribe();
}, []);


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

  // 🔎 Arama + Durum filtreleme
const filteredOrders = useMemo(() => {
  // 🛑 itemsByOrder boşken filtreleme yapma!
  if (orders.length > 0 && Object.keys(itemsByOrder).length === 0) {
    return orders;
  }

  return orders.filter((o) => {
    const items = itemsByOrder[o.id] || [];
    const text = (search || "").toLowerCase();

    const matchProduct = items.some((it) =>
      ((it.product_name || "") + "").toLowerCase().includes(text)
    );

    const matchId = String(o.id || "").includes(text);

    const matchPrice = TRY(o.total_amount || 0).includes(text);

    let matchStatus = true;
    if (statusFilter) {
      const validList = STATUS_FILTER_MAP[statusFilter] || [];
      matchStatus = validList.includes(o.status);
    }

    return (matchProduct || matchId || matchPrice) && matchStatus;
  });
}, [orders, itemsByOrder, search, statusFilter]);


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
    <h1
  className="
    text-3xl font-extrabold mb-10 text-center
    bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400
    bg-clip-text text-transparent
    drop-shadow-[0_0_15px_rgba(250,204,21,0.45)]
    animate-pulse
  "
>
  ⌁ Siparişlerim ⌁
</h1>
{/* 🔍 ARAMA & DURUM FİLTRELERİ */}
<div className="
  w-full mb-8 
  flex flex-col sm:flex-row 
  items-center sm:items-end 
  gap-4
">

  {/* Arama Kutusu */}
  <div className="flex-1 w-full">
    <input
      type="text"
      placeholder="Ürün adı, sipariş no veya tutar ile ara..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        w-full px-4 py-3 rounded-xl 
        bg-black/40 border border-yellow-500/20 
        text-yellow-200 placeholder-yellow-300/40
        focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30
        outline-none transition
      "
    />
  </div>

  {/* Durum Filtresi */}
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="
      px-4 py-3 rounded-xl bg-black/40 
      border border-yellow-500/20 text-yellow-200
      focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30
      outline-none transition
    "
  >
    <option value="">Tüm Durumlar</option>
    <option value="pending">Bekliyor</option>
    <option value="preparing">Hazırlanıyor</option>
    <option value="cargo">Kargoda</option>
    <option value="completed">Teslim Edildi</option>
    <option value="cancelled">İptal Edildi</option>
  </select>
</div>


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
    {filteredOrders.map((o) => {
      const b = STATUS[o.status] ?? STATUS.pending ?? { cls: "", txt: "" };
      const created = new Date(o.created_at).toLocaleString("tr-TR");

           return (
<div key={o.id} className="w-full space-y-4 py-4">


    <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div>
        <p className="font-semibold">Sipariş #{o.id}</p>
        <p className="text-gray-400 text-sm">{created}</p>
      </div>

      <div className="flex items-center gap-3">

  
      </div>

    </header>


           {/* Ürünler + Mesaj Alanı */}
<div
  className="
    flex flex-col items-center gap-4     /* 📱 Mobil: kartlar ortaya hizalanır ve genişleyebilir */
    sm:grid sm:grid-cols-2 lg:grid-cols-3 /* 💻 PC: eski grid sistemi */
  "
>


  {/* SOL — Ürün Kartları (SABİT GENİŞLİK) */}
<div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-2">

    {(itemsByOrder[o.id] || []).map((it) => {
      const productName = it.product_name || "Ürün";

      const imageSrc = it.image_url?.startsWith("http")
        ? it.image_url
        : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${it.image_url}`;

      const statusInfo = STATUS[o.status] || {
        text: "Bekleyen",
        cls: "text-yellow-300 border-yellow-300",
      };

      return (
 <div
  key={it.id}
  onClick={() => navigate(`/orders/${o.id}`)}
  className="
    cursor-pointer 
    bg-[#0e0e0e] 
    rounded-2xl 
    border border-[#1b1b1b]
    hover:border-[#00ffcc80]
    transition-all duration-300
    hover:shadow-[0_0_18px_rgba(0,255,200,0.25)]
    p-3
    flex flex-col

    w-full           
    max-w-[450px]     /* 📱 Mobilde yanlamasına büyür */

    sm:w-[480px]
    sm:min-w-[480px]
  "
>



          {/* FOTO */}
          <div className="relative w-full h-[280px] rounded-xl overflow-hidden bg-black group">
            <img
              src={imageSrc}
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
            />
          </div>

          {/* BAŞLIK */}
          <p className="text-white font-semibold text-[16px] mt-3 truncate">
            {productName}
          </p>

          {/* Adet */}
          <div className="text-[14px] text-gray-300 mt-1">× {it.quantity}</div>

          {/* Renk Bilgisi */}
{it.color && (
  <div className="text-[14px] text-yellow-300 mt-1">
    Renk: <span className="font-bold">{it.color}</span>
  </div>
)}


          {/* Fiyat + Durum */}
          <div className="mt-4 flex items-center justify-between bg-black/40 border border-yellow-500/30 rounded-xl px-3 py-2">
            <span className="text-yellow-300 font-extrabold text-xl drop-shadow-[0_0_6px_rgba(255,220,0,0.4)]">
              ₺{TRY(it.unit_price)}
            </span>

            <span
  className={`
    text-xs px-2 py-[4px]
    rounded-md font-bold flex items-center gap-1
    border ${statusInfo.cls}
    bg-black/40
    status-glow
  `}
>

              {statusInfo.icon} {statusInfo.text}
            </span>
          </div>

          {/* 💎 SİPARİŞ ÖZET KUTUSU — PREMIUM MOR GLOW */}
<div className="
  mt-4 p-4 rounded-xl 
  bg-[#0f0017] 
  border border-purple-700
  shadow-[0_0_20px_rgba(120,0,150,0.35)]
  text-sm flex flex-col gap-2
  w-full max-w-[450px]
">

  {/* TOPLAM TUTAR */}
  <div className="flex justify-between">
    <span className="text-gray-300 font-semibold">Toplam Tutar:</span>
    <span className="text-green-400 font-bold">
      {TRY(o.final_amount ?? o.total_amount)}
    </span>
  </div>

  {/* KUPON */}
  {o.coupon && (
    <div className="flex justify-between">
      <span className="text-gray-300 font-semibold">Kupon:</span>
      <span className="text-purple-300 font-bold">{o.coupon}</span>
    </div>
  )}

  {/* İNDİRİM */}
  {o.discount_amount > 0 && (
    <div className="flex justify-between">
      <span className="text-gray-300 font-semibold">İndirim:</span>
      <span className="text-emerald-400 font-bold">
        -{TRY(o.discount_amount)}
      </span>
    </div>
  )}
</div>

        </div>
      );
    })}
  </div>

  {/* SAĞ — Mesaj Alanı */}
  <div className="w-full lg:flex-1">
    <div className="p-6 bg-black/30 border border-yellow-500/20 rounded-2xl shadow-[0_0_25px_rgba(255,200,0,0.2)] max-w-[450px]">

      <h3 className="text-yellow-300 font-bold text-lg">
        ✨ Bizi tercih ettiğiniz için teşekkür ederiz
      </h3>

      <p className="text-gray-300 text-sm mt-2">
        Siparişiniz özenle hazırlanıyor. Güvenli ödeme, hızlı teslimat
        ve premium alışveriş deneyimi için buradayız.
      </p>

      <p className="text-green-400 font-semibold text-sm mt-4">
        ☑ %100 Güvenli Ödeme
      </p>

      <p className="text-blue-400 font-semibold text-sm mt-1">
        🚚 Kargoya verilme süreci anlık takip edilir
      </p>
    </div>
  </div>

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


