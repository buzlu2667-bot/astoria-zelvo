import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import { supabase } from "../lib/supabaseClient";


const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

// ⭐ TEK RESİM SEÇİCİ
function pickImage(p) {
  return (
    p.image_url ||
    p.main_img ||
    p.img_url ||
    p.img ||                                // ⭐ EN ÖNEMLİ SATIR
    (Array.isArray(p.images) && p.images[0]) ||
    (Array.isArray(p.gallery) && p.gallery[0]) ||
    "/products/default.png"
  );
}


export default function Favorites() {
  
  const { favorites, removeFav } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!favorites || favorites.length === 0)
    return (
      <div className="min-h-[70vh] text-center flex flex-col items-center justify-center text-white">
        <Heart className="w-16 h-16 text-yellow-300 animate-pulse drop-shadow-lg" />
        <h2 className="mt-5 text-4xl font-extrabold bg-gradient-to-r from-yellow-300 to-rose-400 bg-clip-text text-transparent">
          Favoriler Boş
        </h2>
        <p className="text-gray-400 mt-2">Beğendiğin ürünler burada görebilirsin.</p>

        <a
          href="/"
          className="mt-6 bg-gradient-to-r from-yellow-400 to-rose-400 px-8 py-3 rounded-xl text-black font-bold shadow-[0_0_20px_rgba(255,200,0,0.4)] hover:brightness-110 transition"
        >
          Alışverişe Başla
        </a>
      </div>
    );

    

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-white">
      <h1 className="text-3xl font-extrabold mb-10">Favorilerim ❤️</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {favorites.map((p) => {
          const mainImg = pickImage(p);

          const images = [
            mainImg,
            ...(Array.isArray(p.gallery) ? p.gallery : []),
          ].filter(Boolean);

          return (
           <div
  key={p.id}
  onClick={() => navigate(`/product/${p.id}`)}
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
  "
>
  {/* -------- GÖRSEL -------- */}
  <div className="relative w-full h-[260px] rounded-xl overflow-hidden bg-black group">

    {/* 🔥 Yeni Ürün Rozeti */}
    {p.is_new && (
      <div
        className="
          absolute top-3 left-3 z-20
          bg-[#00ffcc] text-black 
          text-xs font-bold px-2 py-[2px]
          rounded-md shadow-[0_0_10px_#00ffaa]
        "
      >
        Yeni
      </div>
    )}

 

    {/* FOTO */}
    <img
      src={pickImage(p)}
      className="
        w-full h-full object-cover 
        transition duration-700 
        group-hover:scale-110 
        group-hover:brightness-110
      "
    />

    {/* İncele overlay */}
    <div
      className="
        absolute inset-0 
        flex items-center justify-center 
        bg-black/50 
        opacity-0 group-hover:opacity-100 
        transition-all duration-300
        text-white text-sm
      "
    >
      🔍 İncele
    </div>
  </div>

  {/* -------- BAŞLIK -------- */}
  <p className="text-white font-semibold text-[15px] truncate mt-3">
  {p.title || p.name}
  </p>

  {/* -------- STOK DURUMU -------- */}
<div className="text-[13px] mt-1">
  {Number(p.stock) <= 0 ? (
    <span className="text-red-500 font-semibold">Tükendi ❌</span>
  ) : Number(p.stock) < 10 ? (
    <span className="text-yellow-400 font-semibold">Az Kaldı ⚠️</span>
  ) : (
    <span className="text-green-500 font-semibold">Stokta ✔</span>
  )}
</div>


  {/* -------- FİYAT BLOĞU -------- */}
  <div
    className="
      mt-3
      flex items-center gap-3
      bg-black/40
      border border-yellow-500/30
      rounded-xl
      px-3 py-2
      shadow-[0_0_15px_rgba(255,200,0,0.15)]
    "
  >
    {p.old_price > p.price && (
      <span
        className="
          bg-red-700/60 text-red-200
          font-bold text-xs
          px-2 py-[2px]
          rounded-lg
          border border-red-500/40
          shadow-[0_0_8px_rgba(255,0,0,0.4)]
        "
      >
        %{Math.round(((p.old_price - p.price) / p.old_price) * 100)}
      </span>
    )}

    {p.old_price > p.price && (
      <span className="text-gray-400 line-through text-sm font-semibold">
        ₺{Number(p.old_price).toLocaleString("tr-TR")}
      </span>
    )}

    <span
      className="
        text-yellow-300 
        font-extrabold 
        text-lg
        drop-shadow-[0_0_6px_rgba(255,220,0,0.4)]
      "
    >
      ₺{Number(p.price).toLocaleString("tr-TR")}
    </span>
  </div>

  {/* -------- BUTONLAR -------- */}
  <div className="flex gap-3 mt-4">
    {/* SEPETE EKLE */}
 <button
  onClick={async (e) => {
    e.stopPropagation();

    let existed = false;

    // 1️⃣ Login kontrol
    const { data: u } = await supabase.auth.getUser();
    const user = u?.user;

    if (!user) {
      // 🟡 Misafir → LocalStorage kontrolü
      const ls = JSON.parse(localStorage.getItem("elitemart_cart") || "[]");
      existed = ls.some((i) => String(i.id) === String(p.id));
    } else {
      // 🟢 Login → DB kontrolü
      const { data: existRow } = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", p.id)  // UUID
        .maybeSingle();

      existed = !!existRow;
    }

    // 2️⃣ Ürünü sepete ekle
 addToCart({
      ...p,
      image_url: pickImage(p),
      title: p.title,
      price: p.price,
      quantity: 1,
    });

    // 3️⃣ Doğru toast mesajını gönder
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: existed
          ? { type: "info", text: "⚡ Ürün adedi artırıldı!" }
          : { type: "success", text: " Sepete eklendi!" },
      })
    );
  }}
  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-2 font-bold rounded-lg transition flex items-center justify-center gap-1"
>
  <ShoppingCart className="w-4 h-4" />
  Sepete
</button>






    {/* FAVORİDEN ÇIKAR */}
   <button
  onClick={async (e) => {
    e.stopPropagation();

    await removeFav(p.id);

    // 🔥 TOAST GÖNDER
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: {
          type: "warning",
          text: "❌ Favorilerden kaldırıldı!",
        },
      })
    );
  }}
  className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition"
>
  <Trash2 className="w-5 h-5 text-white" />
</button>

  </div>
</div>

          );
        })}
      </div>
    </div>
  );
}
