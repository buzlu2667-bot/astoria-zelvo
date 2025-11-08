import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addFav, removeFav, isFav } = useFavorites();
  const [favorites, setFavorites] = useState([]);

  // ✅ Görsel ön yükleme
  useEffect(() => {
    if (!product?.image_url) return;
    const preload = new Image();
    preload.src = product.image_url;
  }, [product.image_url]);

  const imageSrc = product.image_url?.startsWith("http")
    ? product.image_url
    : `/products/${product.image_url}`;

  const price = Number(product.price ?? 0);
  const old = Number(product.old_price ?? 0);
  const hasDiscount = old > 0 && old > price;
  const discount = hasDiscount ? Math.round(((old - price) / old) * 100) : 0;

  // ✅ Favori durumu
  useEffect(() => {
    if (isFav(product.id)) {
      setFavorites((prev) => [...prev, product.id]);
    }
  }, [product.id, isFav]);

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
     className="cursor-pointer bg-neutral-950 rounded-2xl p-5 border border-neutral-800 hover:border-yellow-500 hover:scale-[1.02] transition-all duration-300 relative w-full max-w-[360px] mx-auto"
    >
      <div className="relative w-full h-[380px] sm:h-[420px] md:h-[480px] bg-black overflow-hidden rounded-2xl mb-5 flex items-center justify-center shadow-lg hover:shadow-yellow-400/10 transition-shadow">

        {/* 🔻 İndirim Etiketi */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
            %{discount} İndirim
          </span>
        )}

        {/* 🌟 Yeni Ürün Rozeti */}
        {product.is_new && (
          <span
            className="absolute top-[38px] left-2 z-10 inline-flex items-center gap-1.5 
              bg-gradient-to-r from-yellow-400/20 via-amber-500/10 to-yellow-400/20
              border border-yellow-400/60 text-yellow-300 text-[12px] font-semibold 
              px-3 py-[3px] rounded-md shadow-[0_0_15px_rgba(255,220,0,0.4)] 
              backdrop-blur-sm tracking-wide animate-glow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              className="drop-shadow-[0_0_6px_rgba(255,255,200,0.8)]"
            >
              <path d="M12 2L13.09 8.26L19 9.27L14.5 13.14L15.82 19.02L12 16L8.18 19.02L9.5 13.14L5 9.27L10.91 8.26L12 2Z" />
            </svg>
            Yeni
          </span>
        )}

        {/* 🖼️ Ürün Görseli */}
        <img
          src={imageSrc}
          alt={product.name}
          draggable="false"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{
            aspectRatio: "3/4",
            objectPosition: "top center",
            filter: "brightness(1) contrast(1) saturate(1)",
            imageRendering: "auto",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        />

        {/* 🔍 İncele Butonu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 text-white text-sm font-semibold"
        >
          ✨🔎 İncele
        </button>

        {/* ❤️ Favori Butonu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const alreadyFav = favorites.includes(product.id);
            if (alreadyFav) {
              setFavorites(favorites.filter((id) => id !== product.id));
              removeFav(product.id);
              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: { type: "danger", text: "❌ Favorilerden çıkarıldı" },
                })
              );
            } else {
              setFavorites([...favorites, product.id]);
              addFav(product);
              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: { type: "success", text: "❤️ Favorilere eklendi!" },
                })
              );
            }
          }}
          className="absolute top-3 right-3 z-20 cursor-pointer bg-black/70 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center hover:scale-125 transition"
        >
          {favorites.includes(product.id) ? "❤️" : "🤍"}
        </button>
      </div>

      <p className="font-semibold text-lg truncate mt-2">{product.name}</p>

      {/* ✅ Stok Durumu */}
      {product.stock <= 0 ? (
        <p className="text-red-500 text-sm font-bold">Tükendi ❌</p>
      ) : product.stock < 10 ? (
        <p className="text-amber-400 text-sm font-bold">Az Kaldı ⚠️</p>
      ) : (
        <p className="text-green-500 text-sm font-bold">Stokta ✅</p>
      )}

      {/* 💰 Fiyat */}
      {hasDiscount ? (
        <p className="text-yellow-400 font-bold">
          <span className="text-gray-400 line-through text-sm mr-2">
            ₺{old.toLocaleString("tr-TR")}
          </span>
          ₺{price.toLocaleString("tr-TR")}
        </p>
      ) : (
        <p className="text-yellow-400 font-bold text-lg tracking-wide mt-1">
          ₺{price.toLocaleString("tr-TR")}
        </p>
      )}
    </div>
  );
}
