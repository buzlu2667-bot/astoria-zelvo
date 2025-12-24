import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Hourglass } from "lucide-react";
import DealCountdown from "./DealCountdown";
import { Ban } from "lucide-react";
import { Heart } from "lucide-react";
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";


function smartTitle(title, max = 52) {
  if (!title) return "";

  if (title.length <= max) return title;

  const lastWords = title.split(" ").slice(-2).join(" ");
  return title.slice(0, max - lastWords.length - 3).trim() + "... " + lastWords;
}


function parseLocalDate(dateStr) {
  if (!dateStr) return null;

  const [date, time] = dateStr.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  return new Date(y, m - 1, d, hh, mm);
}


function pickImage(p) {
  return (
    p.image_url ||
    p.main_img ||
    p.img_url ||
    p.img ||
    (Array.isArray(p.gallery) && p.gallery[0]) ||
    "/products/default.png"
  );
}

// 🟢 Soft fake purchase text (ürüne göre stabil ama canlı hissi verir)
function getRecentPurchaseText(p) {
  const str = String(p.id || p.title || "");
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
      : (Math.abs(hash) % 2) + 2;

  return `${minutes} dk önce ${buyers} kişi aldı`;
}


// 👀 Son 24 saat – ürüne göre sabit ama farklı sayı
function getViewCount(p) {
  const str = String(p.id || p.title || "");
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const min = 2;
  const max = 45;

  return min + (Math.abs(hash) % (max - min + 1));
}

// 📱 Mobil / Desktop'a göre görüntüleme metni
function getViewText(p) {
  const count = getViewCount(p);

  // mobil (Tailwind sm < 640px)
  if (window.innerWidth < 640) {
    return `${count} kişi baktı`;
  }

  // desktop
  return `Son 24 saatte ${count} kişi inceledi`;
}

 
// ❤️ Favori sayısı – ürüne göre sabit ama farklı
function getFavCount(p) {
  const str = String(p.id || p.title || "");
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


export default function ProductCardVertical({ p, hideCartButton = false }) {

  const [socialIndex, setSocialIndex] = useState(0);

  const nav = useNavigate();
  const { addFav, removeFav, isFav } = useFavorites();
  const { addToCart } = useCart();

  const img = pickImage(p);
  const price = Number(p.price ?? 0);
  const old = Number(p.old_price ?? 0);
  const hasDiscount = old > price;
  const discount = hasDiscount
    ? Math.round(((old - price) / old) * 100)
    : 0;

      // -------------------------------
  // DEAL / SAYAÇ KONTROLÜ 🔥
  // -------------------------------
  const now = Date.now();
  const dealEnd = p.deal_end_at
  ? parseLocalDate(p.deal_end_at).getTime()
  : null;


  const isDealActive =
    p.deal_active && dealEnd && now < dealEnd;
    const isDealExpired =
  p.deal_active && dealEnd && now >= dealEnd;


  const finalPrice = isDealActive ? price : old || price;
  const showDiscount = isDealActive && hasDiscount;
const socialMessages = [
  /*
  // 🟢 SATIN ALMA (ŞİMDİLİK KAPALI)
  p.stock > 0 && getRecentPurchaseText(p)
    ? {
        icon: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />,
        text: getRecentPurchaseText(p),
        className: "text-emerald-600 font-semibold",
      }
    : null,
  */

  // ❤️ FAVORİ
  {
    icon: <Heart className="w-3.5 h-3.5 text-pink-500" />,
    text: `${getFavCount(p)} kişi favoriledi`,
    className: "text-gray-500",
  },

  // 👀 GÖRÜNTÜLEME
  {
    icon: null,
    text: getViewText(p),
    className: "text-gray-400",
  },
].filter(Boolean);

useEffect(() => {
  if (socialMessages.length <= 1) return;

  const interval = setInterval(() => {
    setSocialIndex(i => (i + 1) % socialMessages.length);
  }, 2500);

  return () => clearInterval(interval);
}, [socialMessages.length]);


  return (
  <div
  onClick={() => nav(`/product/${p.id}`)}
  className="
    bg-white border border-gray-200 rounded-xl shadow-sm
    p-3 cursor-pointer transition hover:shadow-md
    flex flex-col
    overflow-hidden   /* 🔥 TAŞMAYI KESEN ŞEY BU */
  "
>

      {/* FOTO */}
    <div className="relative w-full h-[130px] sm:h-[210px] lg:h-[230px] rounded-lg overflow-hidden bg-white">

        {/* 🔰 BADGE STACK (SOL ÜST) */}
  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
  

   {/* ⭐ SEÇİLİ ÜRÜN */}
{p.is_selected && (
  <div className="
    inline-flex items-center gap-1
    px-2.5 py-1 rounded-full
    text-[11px] font-bold
    text-white
    bg-gradient-to-r from-emerald-500 to-green-600
    shadow-lg animate-pulse
    border border-white/40 backdrop-blur
  ">
    <Truck className="w-3.5 h-3.5" />
    Ücretsiz Kargo
  </div>
)}

   {/*
{isDealExpired && (
  <div className="
    flex items-center gap-1.5
    bg-gradient-to-r from-red-900/90 to-red-700/90
    text-white text-[11px] font-semibold
    px-2.5 py-1 rounded-full
  ">
    <Ban className="w-3.5 h-3.5 text-red-300" />
    <span>Fırsat Bitti</span>
  </div>
)}
*/}


   {p.is_new && !isDealExpired && (
  <div
    className="
      inline-flex w-fit
      items-center
      px-2 py-[1px]
      rounded-full
      border border-black/60
      text-black
      text-[9px]
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
   



        <img
          src={img}
          loading="lazy"
          draggable="false"
          onError={(e) => (e.currentTarget.src = "/products/default.png")}
          className="w-full h-full object-cover"
        />


        {/* ❤️ FAVORİ (AYNI SENİN KART) */}
        <button
          onClick={(e) => {
            e.stopPropagation();

            const favObj = {
              id: p.id,
              title: p.title || p.name || "Ürün",
              name: p.title || p.name || "Ürün",
              price,
              old_price: old,
              stock: Number(p.stock ?? 0),
              image_url: img,
              gallery: p.gallery || [],
            };

            if (isFav(p.id)) {
              removeFav(p.id);
              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: {
                    type: "warning",
                    text: "Favorilerden çıkarıldı!",
                  },
                })
              );
            } else {
              addFav(favObj);
              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: {
                    type: "success",
                    text: "Favorilere eklendi!",
                  },
                })
              );
            }
          }}
          className="
            absolute bottom-2 right-2 
            bg-white w-9 h-9 rounded-full 
            flex items-center justify-center 
            border border-gray-300 
            hover:bg-gray-100 transition
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`
              w-5 h-5 transition
              ${
                isFav(p.id)
                  ? "fill-red-500"
                  : "fill-none stroke-gray-600"
              }
            `}
          >
            <path d="M12 21s-6-4.3-9-8.2C-1 7.7 3 2.4 8 4.2c2 .8 3 2.3 4 3.8 1-1.5 2-3 4-3.8C21 2 25 7.7 21 12.8C18 16.7 12 21 12 21z" />
          </svg>
        </button>
      </div>

      {/* BAŞLIK */}
  <div className="mt-3 overflow-hidden h-[64px] sm:h-[44px]">
  <p className="font-semibold text-gray-800 text-[14px] leading-[1.25] break-words">
    {p.title}
  </p>
</div>



 {/* ⭐ YILDIZ & YORUM SAYISI (SABİT YÜKSEKLİK) */}
<div className="mt-1 min-h-[16px] flex items-center gap-1 text-[12px] text-gray-600">
  {Number(p.rating_count) > 0 && (
    <>
      <span className="text-orange-500 leading-none">
        {"★".repeat(Math.round(p.rating_avg))}
        {"☆".repeat(5 - Math.round(p.rating_avg))}
      </span>

      <span className="text-gray-400">
        ({p.rating_count})
      </span>
    </>
  )}
</div>

{/* 📊 SOSYAL KANIT — TEK SATIR (SABİT BOY) */}
<div className="mt-1 min-h-[18px] flex items-center gap-1 text-[11px] animate-social">
  {socialMessages[socialIndex]?.icon}
  <span className={socialMessages[socialIndex]?.className}>
    {socialMessages[socialIndex]?.text}
  </span>
</div>

{/* 🚚 Kargo */}
<div
  className={`
    flex items-center gap-1
    text-[11px] font-semibold text-emerald-600
    ${p.stock > 0 ? "opacity-100" : "opacity-0"}
  `}
>
  <Truck className="w-3.5 h-3.5" />
  <span>{getCargoInfo()}</span>
</div>



  {/* STOK */}
<div className="mt-1">
  {p.stock <= 0 ? (
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
  ) : p.stock < 10 ? (
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


    {/* FİYAT */}
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



  {/* ALT SATIR: YENİ FİYAT */}
 <span
  className={`
    font-extrabold text-xl leading-tight
   ${isDealActive ? "text-red-600 drop-shadow-[0_1px_0_rgba(239,68,68,0.25)]" : "text-gray-900"}

  `}
>
  ₺{finalPrice.toLocaleString("tr-TR")}
</span>

{/* ⏱️ SAYAÇ ALANI — SABİT YÜKSEKLİK */}
<div className="mt-1 min-h-[28px]">
  {isDealActive && (
    <DealCountdown
      endAt={parseLocalDate(p.deal_end_at).getTime()}
      compact
    />
  )}
</div>

</div>
   
 

   {/* SEPET */}
<div className="mt-4 min-h-[44px]">
  {!hideCartButton && (
    <button
      onClick={async (e) => {
        e.stopPropagation();
       const now = Date.now();
const dealEnd = p.deal_end_at
  ? parseLocalDate(p.deal_end_at).getTime()
  : null;


const finalPrice =
  p.deal_active && dealEnd && now < dealEnd
    ? Number(p.price)
    : Number(p.old_price || p.price);

const existed = await addToCart({
  ...p,
  price: finalPrice, // 🔥 GERÇEK FİYAT
  image_url: img,
  quantity: 1,
});


        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: existed
              ? { type: "info", text: "Ürün adedi artırıldı!" }
              : { type: "success", text: "Sepete eklendi!" },
          })
        );
      }}
      className="
        w-full bg-[#f27a1a] text-white py-2 rounded-lg
        font-bold text-sm flex items-center justify-center gap-2
        hover:bg-[#e56f14] transition
      "
    >
      <ShoppingCart className="w-4 h-4" />
      Sepete
    </button>
  )}
</div>



    </div>
  );
}
