import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Hourglass } from "lucide-react";
import DealCountdown from "./DealCountdown";
import { Ban } from "lucide-react";


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

export default function ProductCardVertical({ p, hideCartButton = false }) {
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
     {isDealExpired && (
  <div
    className="
      absolute top-2 left-2 z-10
      flex items-center gap-1.5
      bg-gradient-to-r from-red-900/90 to-red-700/90
      text-white
      text-[11px] font-semibold
      px-2.5 py-1
      rounded-full
      border border-gray-700/70
      backdrop-blur-md
      shadow-md
    "
  >
    <Ban className="w-3.5 h-3.5 text-red-300" />
    <span>Fırsat Bitti</span>
  </div>
)}



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
   <div className="mt-3 overflow-hidden">
  <p
    className="
      font-semibold text-gray-800 text-[15px]
      whitespace-nowrap
      animate-title-scroll
      md:animate-none
    "
  >
    {p.title}
  </p>
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

      <span className="text-gray-400 line-through text-sm">
        ₺{old.toLocaleString("tr-TR")}
      </span>
    </>
  ) : (
    <span className="opacity-0">placeholder</span>
  )}

 
</div>



  {/* ALT SATIR: YENİ FİYAT */}
  <span className="text-gray-900 font-extrabold text-xl leading-tight">
  ₺{finalPrice.toLocaleString("tr-TR")}
  </span>
{isDealActive && (
  <div className="mt-1">
   <DealCountdown
  endAt={parseLocalDate(p.deal_end_at).getTime()}
  compact
/>

  </div>
)}

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
