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
      <div className="relative w-full h-[210px] rounded-lg overflow-hidden bg-gray-100">

        {/* Yeni Ürün Etiketi */}
        {product.is_new && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-[2px] rounded-md">
            Yeni
          </div>
        )}

      

        {/* ÜRÜN FOTO */}
        <img
          src={imageSrc}
          draggable="false"
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
              price: price,
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

      {/* ------------------ STOK ------------------ */}
      <div className="text-[13px] mt-1">
        {product.stock <= 0 ? (
          <span className="text-red-500 font-semibold">Tükendi</span>
        ) : product.stock < 10 ? (
          <span className="text-yellow-600 font-semibold">Az Kaldı</span>
        ) : (
          <span className="text-green-600 font-semibold">Stokta</span>
        )}
      </div>

    
     {/* ------------------ FİYAT BLOĞU (YAN YANA ETİKETLİ) ------------------ */}
<div className="mt-3 flex items-center gap-2">

  {/* Eski Fiyat */}
  {hasDiscount && (
    <span className="text-gray-400 line-through text-sm">
      ₺{old.toLocaleString("tr-TR")}
    </span>
  )}

  {/* Yeni Fiyat */}
  <span className="text-gray-900 font-bold text-lg">
    ₺{price.toLocaleString("tr-TR")}
  </span>

  {/* % Etiketi - FİYAT YANINA ALINDI */}
  {hasDiscount && (
    <span className="bg-red-600 text-white text-xs font-semibold px-2 py-[2px] rounded-md">
      %{discount}
    </span>
  )}

</div>

    </div>
  );
}
