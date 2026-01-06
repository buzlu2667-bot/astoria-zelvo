import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { Hourglass } from "lucide-react";
import DealCountdown from "./DealCountdown";
import { Ban } from "lucide-react";
import { Truck } from "lucide-react";
import { Heart } from "lucide-react";
import { Rocket, Flame } from "lucide-react";


function isProductNew(product, days = 14) {
  if (!product.created_at) return false;
  const created = new Date(product.created_at).getTime();
  const now = Date.now();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}


function parseLocalDate(dateStr) {
  if (!dateStr) return null;

  const [date, time] = dateStr.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  return new Date(y, m - 1, d, hh, mm);
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

  {/* 🔥 POPÜLER ROZETLER (SAĞ ÜST) */}
<div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">

  {/* MINI TREND */}
  {Number(product.view_count) >= 40 &&
    product.last_viewed_at &&
    Date.now() - new Date(product.last_viewed_at).getTime() < 1000 * 60 * 60 * 48 && (
    <div className="
      inline-flex items-center gap-1
      px-2 py-[2px]
      rounded-full
      text-[10px] font-bold
      text-sky-700
      bg-sky-50
      border border-sky-300
      backdrop-blur-md
      shadow-sm
    ">
      <Rocket className="w-3 h-3" />
      Trend
    </div>
  )}

  {/* MINI ÇOK SATAN */}
  {Number(product.view_count) >= 150 && (
    <div className="
      inline-flex items-center gap-1
      px-2 py-[2px]
      rounded-full
      text-[10px] font-bold
      text-rose-700
      bg-rose-50
      border border-rose-300
      backdrop-blur-md
      shadow-sm
    ">
      <Flame className="w-3 h-3" />
      Çok Satan
    </div>
  )}

</div>


{/* 🔰 BADGE ALANI (SOL ÜST) */}
<div className="absolute top-2 left-2 z-10 flex flex-col gap-1">


{/* ⭐ SEÇİLİ ÜRÜN */}
{product.is_selected && (
  <div className="
    inline-flex items-center gap-1
    px-2 py-[2px]
    rounded-full
    text-[10px] font-semibold
    text-gray-800

    bg-white/70
    backdrop-blur-2xl
    border border-white/40
    shadow-[0_2px_6px_rgba(0,0,0,0.12)]
  ">
    <Truck className="w-2.5 h-2.5 opacity-70" />
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
    {isProductNew(product, 14) && (
  <div className="
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
  ">
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

  {/* ⭐ EDITÖRÜN SEÇİMİ — KALBİN KARŞISI */}
{Number(product.rating_avg) >= 4.8 && Number(product.rating_count) >= 5 && (
  <div className="
    absolute bottom-2 left-2 z-20
    px-3 py-[3px]
    rounded-full
    text-[10.5px] font-semibold
    text-gray-900

    bg-white/70
    backdrop-blur-2xl
    ring-1 ring-white/50
    shadow-[0_3px_8px_rgba(0,0,0,0.14)]

    flex items-center gap-1
    tracking-wide
  ">
    ⭐ Editörün Seçimi
  </div>
)}



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
          -%{discount}
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
