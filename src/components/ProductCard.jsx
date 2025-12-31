import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { Hourglass } from "lucide-react";
import DealCountdown from "./DealCountdown";
import { Ban } from "lucide-react";
import { Truck } from "lucide-react";
import { Heart } from "lucide-react";

function parseLocalDate(dateStr) {
  if (!dateStr) return null;

  const [date, time] = dateStr.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  return new Date(y, m - 1, d, hh, mm);
}

// 🟢 Soft fake purchase text (ürüne göre stabil ama canlı hissi verir)
function getRecentPurchaseText(product) {
  const str = String(product.id || product.title || "");
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // %35 ihtimalle hiç gösterme
  if (hash % 10 < 4) return null;

  const minutes = (Math.abs(hash) % 7) + 1; // 1–7 dk

  // %70 → 1 kişi, %30 → 2–3 kişi
  const buyers =
    hash % 10 < 7
      ? 1
      : (Math.abs(hash) % 2) + 2; // 2 veya 3

  return `${minutes} dk önce ${buyers} kişi aldı`;
}


// 👀 Son 24 saat fake ama stabil view sayısı
function getViewCount(product) {
  const str = String(product.id || product.title || "");
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const min = 2;
  const max = 40;

  return min + (Math.abs(hash) % (max - min + 1));
}


// ❤️ Favori sayısı (ürüne özel, sabit ama farklı)
function getFavCount(product) {
  const str = String(product.id || product.title || "");
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const min = 3;
  const max = 45;

  return min + (Math.abs(hash) % (max - min + 1));
}

// 🚚 Kargo metni (saat bazlı)
function getCargoInfo() {
  const now = new Date();
  const day = now.getDay(); // 0 = Pazar, 6 = Cumartesi
  const hour = now.getHours();

  // Pazar
  if (day === 0) {
    return "Pazartesi kargoda";
  }

  // Cumartesi
  if (day === 6) {
    return "Pazartesi kargoda";
  }

  // Hafta içi
  if (hour >= 8 && hour < 17) {
    return "Bugün kargoda";
  }

  return "Yarın kargoda";
}



export default function ProductCard({ product, hideDealCountdown = false }) {

  const [socialIndex, setSocialIndex] = useState(0);


  const navigate = useNavigate();
  const { addFav, removeFav, isFav } = useFavorites();
  const [favorites, setFavorites] = useState([]);

  // -------------------------------
  // IMAGE
  // -------------------------------
  const imageSrc =
    product.main_img ||
    (Array.isArray(product.gallery) ? product.gallery[0] : null) ||
    "/products/default.png";

  // -------------------------------
  // PRICES
  // -------------------------------
  const price = Number(product.price ?? 0);
  const old = Number(product.old_price ?? 0);
  const hasDiscount = old > price;
  const discount = hasDiscount ? Math.round(((old - price) / old) * 100) : 0;

    // -------------------------------
  // DEAL / SAYAÇ KONTROLÜ 🔥
  // -------------------------------
  const now = Date.now();
const dealEnd = product.deal_end_at
  ? parseLocalDate(product.deal_end_at).getTime()
  : null;
const isDealExpired =
  product.deal_active && dealEnd && now >= dealEnd;

  const isDealActive =
    product.deal_active && dealEnd && now < dealEnd;

  // Sayaç bittiyse indirim iptal
  const finalPrice = isDealActive ? price : old || price;
  const showOldPrice = isDealActive && hasDiscount;
  const showDiscount = isDealActive && hasDiscount;


  // -------------------------------
  // FAVORITES
  // -------------------------------
  useEffect(() => {
    if (isFav(product.id)) {
      setFavorites((prev) => [...prev, product.id]);
    }
  }, [product.id, isFav]);

 const socialMessages = [
  /*
  // 🟢 SATIN ALMA (ŞİMDİLİK KAPALI)
  Number(product.stock ?? 0) > 0 && getRecentPurchaseText(product)
    ? {
        icon: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />,
        text: getRecentPurchaseText(product),
        className: "text-emerald-600 font-semibold",
      }
    : null,
  */

  // ❤️ FAVORİ
  {
    icon: <Heart className="w-3.5 h-3.5 text-pink-500" />,
    text: `${getFavCount(product)} kişi favoriledi`,
    className: "text-gray-500",
  },

  // 👀 GÖRÜNTÜLEME
  {
    icon: null,
    text: `Son 24 saatte ${getViewCount(product)} kişi inceledi`,
    className: "text-gray-400",
  },
].filter(Boolean);


useEffect(() => {
  if (socialMessages.length <= 1) return;

  const interval = setInterval(() => {
    setSocialIndex(i => (i + 1) % socialMessages.length);
  }, 2500); // 2.5 sn

  return () => clearInterval(interval);
}, [socialMessages.length]);


  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
     className="
  cursor-pointer
  bg-white 
  rounded-xl 
  border border-gray-200 
  hover:shadow-md 
  transition-all 
  p-3 
  flex flex-col

  w-[260px] min-w-[260px] max-w-[260px]

"

    >
      {/* ------------------ IMAGE BOX ------------------ */}
     <div className="
  relative w-full
  h-[210px]
  md:h-[240px]
  lg:h-[260px]
  rounded-lg overflow-hidden bg-white
">

{/* 🔰 BADGE ALANI (SOL ÜST) */}
<div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
{/* ⭐ SEÇİLİ ÜRÜN */}
{product.is_selected && (
  <div className="
    inline-flex items-center gap-1.5
    px-3 py-1
    rounded-full
    text-[11px] font-semibold
    text-gray-800
    bg-white/80
    backdrop-blur-md
    border border-white/40
    shadow-sm
  ">
    <Truck className="w-3 h-3 opacity-70" />
    Ücretsiz Kargo
  </div>
)}


{/*
{isDealExpired && (
  <div
    className="flex items-center gap-1.5
      bg-gradient-to-r from-gray-900/90 to-gray-800/90
      text-white text-[11px] font-semibold
      px-2.5 py-1 rounded-full
      border border-gray-700/70 backdrop-blur-md shadow-md"
  >
    <Ban className="w-3.5 h-3.5 text-red-400" />
    <span>Fırsat Bitti</span>
  </div>
)}
*/}



        {/* Yeni Ürün Etiketi */}
      {product.is_new && (
  <div
    className="
      inline-flex w-fit
      items-center
      px-2 py-0.5
      rounded-full
      border border-black/70
      text-black
      text-[10px]
      font-semibold
      tracking-wide
      bg-white/80
      backdrop-blur
    "
  >
    YENİ
  </div>
)}

</div>

      

        {/* ÜRÜN FOTO */}
      <img
  src={imageSrc || "/products/default.png"}
  loading="lazy"
  decoding="async"
  draggable="false"
  onError={(e) => (e.currentTarget.src = "/products/default.png")}
className="w-full h-full object-cover"
/>


        {/* ❤️ Favori */}
        <button
          onClick={(e) => {
            e.stopPropagation();

            const favObj = {
              id: product.id,
              title: product.title || product.name || "Ürün",
              name: product.title || product.name || "Ürün",
              price: finalPrice,
              old_price: old,
              stock: Number(product.stock ?? 0),
              image_url:
                product.image_url ||
                product.main_img ||
                product.img_url ||
                (Array.isArray(product.gallery) ? product.gallery[0] : null) ||
                "/products/default.png",
              gallery: product.gallery || [],
            };

            if (isFav(product.id)) {
              removeFav(product.id);
              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: { type: "warning", text: "Favorilerden çıkarıldı!" },
                })
              );
            } else {
              addFav(favObj);

              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: { type: "success", text: "Favorilere eklendi!" },
                })
              );
            }
          }}
          className="
            absolute bottom-2 right-2 
            bg-white 
            w-9 h-9 rounded-full 
            flex items-center justify-center 
            border border-gray-300 
            hover:bg-gray-100
            transition
          "
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            className={`
              w-5 h-5 transition
              ${
                isFav(product.id)
                  ? "fill-red-500"
                  : "fill-none stroke-gray-600"
              }
            `}
          >
            <path d='M12 21s-6-4.3-9-8.2C-1 7.7 3 2.4 8 4.2c2 .8 3 2.3 4 3.8 1-1.5 2-3 4-3.8C21 2 25 7.7 21 12.8C18 16.7 12 21 12 21z' />
          </svg>
        </button>
      </div>

      {/* ------------------ TITLE ------------------ */}
      <p className="text-gray-800 font-semibold text-[15px] truncate mt-3">
        {product.title}
      </p>

      {/* ⭐ YILDIZ & YORUM SAYISI (SABİT YÜKSEKLİK) */}
<div className="mt-1 min-h-[16px] flex items-center gap-1 text-[12px] text-gray-600">
  {Number(product.rating_count) > 0 && (
    <>
      <span className="text-orange-500 leading-none">
        {"★".repeat(Math.round(product.rating_avg))}
        {"☆".repeat(5 - Math.round(product.rating_avg))}
      </span>

      <span className="text-gray-400">
        ({product.rating_count})
      </span>
    </>
  )}
</div>

{/* 📊 SOSYAL KANIT — TEK SATIR DÖNÜŞÜMLÜ */}
<div className="mt-1 min-h-[18px] flex items-center gap-1 text-[11px] animate-social">
  {socialMessages[socialIndex]?.icon}
  <span className={socialMessages[socialIndex]?.className}>
    {socialMessages[socialIndex]?.text}
  </span>
</div>


{/* 🚚 KARGO — AYRI SATIR, SABİT */}
<div
  className={`flex items-center gap-1 text-[11px] font-semibold text-emerald-600
    ${Number(product.stock ?? 0) > 0 ? "opacity-100" : "opacity-0"}
  `}
>
  <Truck className="w-3.5 h-3.5" />
  <span>{getCargoInfo()}</span>
</div>



      {/* STOK */}
<div className="mt-1">
  {Number(product.stock ?? 0) <= 0 ? (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-bold
      text-red-600
      bg-red-50
      px-2 py-[2px]
      rounded-md
      border border-red-200
    ">
      Tükendi
    </span>
  ) : Number(product.stock) < 10 ? (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-semibold
      text-orange-700
      bg-orange-50
      px-2 py-[2px]
      rounded-md
      border border-orange-200
    ">
      <Hourglass className="w-3.5 h-3.5 animate-hourglass" />
      Son Adetler
    </span>
  ) : (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-medium
      text-emerald-700
      bg-emerald-50
      px-2 py-[2px]
      rounded-md
      border border-emerald-200
    ">
      Stokta
    </span>
  )}
</div>





    
  {/* ------------------ FİYAT BLOĞU ------------------ */}
<div className="mt-3 flex flex-col gap-1">

  {/* ÜST SATIR: İNDİRİM + ESKİ FİYAT */}
  <div className="flex items-center gap-2 min-h-[24px]">
    {showDiscount ? (
      <>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-[2px] rounded-lg font-bold">
          %{discount}
        </span>
       <span className="text-gray-500 line-through text-[15px] font-semibold">
  ₺{old.toLocaleString("tr-TR")}
</span>

      </>
    ) : (
      <span className="opacity-0">placeholder</span>
    )}
  </div>

  {/* ✅ FİYAT – SADECE 1 KERE */}
 <span
  className={`
    font-extrabold text-xl leading-tight
   ${isDealActive ? "text-red-600 drop-shadow-[0_1px_0_rgba(239,68,68,0.25)]" : "text-gray-900"}

  `}
>
  ₺{finalPrice.toLocaleString("tr-TR")}
</span>

  {/* ✅ SAYAÇ ALANI – HER ZAMAN AYNI YERİ TUTAR */}
  <div className="mt-1 min-h-[28px]">
    {!hideDealCountdown && isDealActive && (
      <DealCountdown
        endAt={parseLocalDate(product.deal_end_at).getTime()}
        compact
      />
    )}
  </div>

</div>



    </div>
  );
}
