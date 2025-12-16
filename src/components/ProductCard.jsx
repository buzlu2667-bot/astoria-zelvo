import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { Hourglass } from "lucide-react";
import DealCountdown from "./DealCountdown";



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
    ? new Date(product.deal_end_at).getTime()
    : null;

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


        {/* Yeni Ürün Etiketi */}
        {product.is_new && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-[2px] rounded-md">
            Yeni
          </div>
        )}

      

        {/* ÜRÜN FOTO */}
      <img
  src={imageSrc || "/products/default.png"}
  loading="lazy"
  decoding="async"
  draggable="false"
  onError={(e) => (e.currentTarget.src = "/products/default.png")}
className="w-full h-full object-contain"
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


    
     {/* ------------------ FİYAT BLOĞU (YAN YANA ETİKETLİ) ------------------ */}
{/* FİYAT */}
<div className="mt-3 flex flex-col gap-1">

  {/* ÜST SATIR: İNDİRİM + ESKİ FİYAT */}
  <div className="flex items-center gap-2 min-h-[24px]">
 {showDiscount ? (
      <>
        <span className="
          text-xs
          bg-red-100
          text-red-600
          px-2 py-[2px]
          rounded-lg
          font-bold
        ">
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

  {/* ALT SATIR: YENİ FİYAT (ANA ODAK) */}
  <span className="text-gray-900 font-extrabold text-xl leading-tight">
 ₺{finalPrice.toLocaleString("tr-TR")}
  </span>

{/* ⏱️ SAYAÇ — FİYATIN ALTINDA (EN DOĞRU YER) */}
{!hideDealCountdown && isDealActive && (
  <div className="mt-1">
    <DealCountdown
      endAt={new Date(product.deal_end_at).getTime()}
      compact
    />
  </div>
)}

</div>


    </div>
  );
}
