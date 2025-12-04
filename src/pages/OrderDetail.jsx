// ✅ src/pages/OrderDetail.jsx — Premium Visual Fixed Version
import { STATUS } from "../utils/statusBadge";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;
      if (!user) return nav("/dashboard");

      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    const { data: it } = await supabase
  .from("order_items")
  .select("*")
  .eq("order_id", id);


      setOrder(o);
      setItems(it || []);
    })();
  }, [id]);

  if (!order)
    return (
      <div className="h-screen text-white flex justify-center items-center">
        ⏳ Sipariş bilgileri yükleniyor...
      </div>
    );

  const status = STATUS[order.status] || STATUS.pending;

  return (
  <div className="min-h-screen text-white">
     <div className="max-w-3xl mx-auto maxi-card p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold">Sipariş #{order.id}</h1>

          <span
            className={`px-3 py-1 rounded-full text-sm font-bold border ${
              status?.cls ||
              "text-yellow-400 border-yellow-400"
            } shadow-[0_0_12px_rgba(168,85,247,0.7)] border-purple-400/50 status-blink`}
          >
            {status?.text || status?.txt || "Bekleyen Ödeme"}
            {["pending", "awaiting_payment"].includes(order.status) && (
              <span className="ml-2 text-yellow-400">⚠️</span>
            )}
            {order.status === "processing" && (
              <span className="ml-2 text-purple-400 gear-spin">⚙️</span>
            )}
            {order.status === "shipped" && (
              <span className="truck-anim ml-2">🚚</span>
            )}
            {order.status === "delivered" && <span className="ml-2">✅</span>}
            {order.status === "cancelled" && <span className="ml-2">❌</span>}
          </span>
        </div>

        <p className="text-gray-400 text-xs mb-4">
          {new Date(order.created_at).toLocaleString("tr-TR")}
        </p>

        {/* Ürünler */}
        <h3 className="font-semibold mb-3 text-lg">Ürünler</h3>
      <div className="space-y-4">
  {items.map((i) => {
const p = i.products || {};

const imgSrc =
  i.image_url?.startsWith("http")
    ? i.image_url
    : i.image_url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${i.image_url}`
    : "/products/default.png";


    return (
   <div
  key={i.id}
  className="
    bg-[#0e0e0e]
    border border-[#1b1b1b]
    rounded-2xl
    p-4
    flex flex-col sm:flex-row
    gap-4
    hover:border-[#00ffcc80]
    hover:shadow-[0_0_18px_rgba(0,255,200,0.25)]
    transition-all duration-300
  "
>
  {/* 🖼️ Görsel Kutusu */}
  <div
    className="
      w-full h-52 
      sm:w-40 sm:h-40 
      rounded-xl 
      overflow-hidden 
      flex items-center justify-center 
      bg-black
    "
  >
    <img
      src={imgSrc}
      alt={p?.name || i.product_name}
      className="w-full h-full object-cover transition duration-700 hover:scale-110"
    />
  </div>

  {/* 📌 Bilgiler */}
  <div className="flex-1 flex flex-col justify-between">
    <div>
      <p className="font-semibold text-yellow-300 text-base leading-tight">
        {p?.name || i.product_name}
      </p>

      <p className="text-gray-400 text-sm mt-1">
        Miktar:{" "}
        <span className="text-gray-200 font-medium">×{i.quantity}</span>
      </p>
    </div>

    <p className="text-gray-400 text-sm mt-1">
  Renk:{" "}
  <span className="text-yellow-300 font-medium">
    {i.color || "Belirtilmedi"}
  </span>
</p>


    <p className="text-green-400 font-extrabold text-xl mt-3 drop-shadow-[0_0_6px_rgba(0,255,150,0.4)]">
      {TRY(i.unit_price)}
    </p>
  </div>
</div>

    );
  })}
</div>

{/* 🟡 PREMIUM ÜRÜN AÇIKLAMASI */}
{items.length > 0 && items[0]?.products?.description && (
 <div className="mt-6 maxi-card p-5">

    
    <h2 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
       Ürün Açıklaması
    </h2>

    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
      {items[0].products.description}
    </p>

  </div>
)}




{/* 🟣 TESLİMAT ADRESİ */}
<div className="mt-8 bg-black/30 border border-yellow-500/20 rounded-2xl p-5 shadow-[0_0_25px_rgba(255,200,0,0.15)]">
  <h2 className="text-lg font-bold text-yellow-400 mb-2">Teslimat Adresi</h2>
  <p className="text-gray-300 whitespace-pre-line">
    {order.address || "Adres belirtilmedi"}
  </p>
</div>




{/* 📝 SİPARİŞ NOTU */}
{order.note && (
  <div className="mt-8 bg-black/30 border border-yellow-500/20 rounded-2xl p-5 shadow-[0_0_25px_rgba(255,200,0,0.15)]">
    <h2 className="text-lg font-bold text-yellow-400 mb-2">Sipariş Notu</h2>
    <p className="text-gray-300 whitespace-pre-line">{order.note}</p>
  </div>
)}

{/* 🟢 TOPLAM TUTAR KARTI */}
<div className="
  mt-8 
  bg-black/30 
  border border-green-500/30 
  rounded-2xl 
  p-5 
  shadow-[0_0_25px_rgba(0,255,150,0.25)]
">
  <h2 className="text-lg font-bold text-green-300 mb-2">
    Toplam Tutar
  </h2>

  <p className="text-gray-200 text-xl font-extrabold">
    {TRY(order.final_amount ?? order.total_amount)}
  </p>
</div>


       {/* 💜 KUPON BİLGİSİ KARTI */}
{order.discount_amount > 0 && (
  <div className="mt-6 bg-black/30 border border-purple-700/40 rounded-2xl p-5 
      shadow-[0_0_25px_rgba(120,0,180,0.25)]">
    
    <h2 className="text-lg font-bold text-purple-300 mb-2 flex items-center gap-2">
      🎟 Kupon Bilgisi
    </h2>

    <div className="text-gray-300 space-y-1">
      <p>
        <span className="font-semibold text-purple-300">Kupon Kodu:</span>{" "}
        {order.coupon}
      </p>

      <p>
        <span className="font-semibold text-emerald-300">İndirim:</span>{" "}
        -{TRY(order.discount_amount)}
      </p>
    </div>
  </div>
)}


      

        {/* Back */}
        <div className="mt-8 flex justify-end">
          <Link
            to="/orders"
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold"
          >
            ← Siparişlere Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
