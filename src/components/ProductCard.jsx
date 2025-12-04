import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

export default function ProductCard({ product }) {
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
      {/* ------------------ IMAGE BOX ------------------ */}
      <div
        className="
          relative 
          w-full 
          h-[240px]
          rounded-xl 
          overflow-hidden 
          bg-black
          group
        "
      >

        {/* 🔥 Yeni Ürün Etiketi */}
        {product.is_new && (
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

      

        {/* ÜRÜN FOTO */}
        <img
          src={imageSrc}
          draggable="false"
          className="
            w-full h-full object-cover 
            transition duration-700 
            group-hover:scale-110 
            group-hover:brightness-110
          "
        />

        {/* 🔍 İncele Overlay */}
        <div
          className="
            absolute inset-0 
            flex items-center justify-center 
            bg-black/50 
            opacity-0 group-hover:opacity-100 
            text-white text-sm 
            transition-all duration-300
          "
        >
          🔍 İncele
        </div>

        {/* ❤️ Favori Butonu */}
       <button
  onClick={(e) => {
    e.stopPropagation();

  const favObj = {
  id: product.id,

  // 🔥 BURASI EN ÖNEMLİ SATIR
  title: product.title || product.name || "Ürün",

  name: product.title || product.name || "Ürün",

  price: Number(product.price ?? 0),
  old_price: Number(product.old_price ?? 0),

  stock: Number(product.stock ?? 0),

  image_url:
    product.image_url ||
    product.main_img ||
    product.img_url ||
    (Array.isArray(product.gallery) ? product.gallery[0] : null) ||
    "/products/default.png",

  gallery: product.gallery || []
};


    console.log("Favoriye eklenen obje:", favObj);

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
    absolute top-3 right-3 z-30
    bg-black/40 backdrop-blur-xl
    w-10 h-10 rounded-full
    flex items-center justify-center
    border border-white/10
    transition-all
    hover:border-pink-400
  "
>

          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            className={`
              w-6 h-6 transition
              ${
                isFav(product.id)
                  ? "fill-pink-500 drop-shadow-[0_0_6px_rgba(255,80,150,1)]"
                  : "fill-transparent stroke-pink-300"
              }
            `}
          >
            <path d='M12 21s-6-4.3-9-8.2C-1 7.7 3 2.4 8 4.2c2 .8 3 2.3 4 3.8 1-1.5 2-3 4-3.8C21 2 25 7.7 21 12.8C18 16.7 12 21 12 21z' />
          </svg>
        </button>
      </div>

      {/* ------------------ TITLE ------------------ */}
      <p className="text-white font-semibold text-[15px] truncate mt-3">
        {product.title}
      </p>

      {/* ------------------ STOK ------------------ */}
      <div className="text-[13px] mt-1">
        {product.stock <= 0 ? (
          <span className="text-red-500 font-semibold">Tükendi ❌</span>
        ) : product.stock < 10 ? (
          <span className="text-yellow-400 font-semibold">Az Kaldı ⚠️</span>
        ) : (
          <span className="text-green-500 font-semibold">Stokta ✔</span>
        )}
      </div>

     
     {/* ------------------ FİYAT BLOĞU ------------------ */}
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

  {/* YÜZDE ETİKETİ */}
  {hasDiscount && (
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
      %{discount}
    </span>
  )}

  {/* ESKİ FİYAT */}
  {hasDiscount && (
    <span className="text-gray-400 line-through text-sm font-semibold">
      ₺{old.toLocaleString("tr-TR")}
    </span>
  )}

  {/* YENİ FİYAT */}
  <span
    className="
      text-yellow-300 
      font-extrabold 
      text-lg
      drop-shadow-[0_0_6px_rgba(255,220,0,0.4)]
    "
  >
    ₺{price.toLocaleString("tr-TR")}
  </span>
</div>

    </div>
  );
  
}
