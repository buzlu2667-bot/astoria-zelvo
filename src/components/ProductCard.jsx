import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addFav, removeFav, isFav } = useFavorites();
  const [favorite, setFavorite] = useState(false);

  // ✅ Ürün görsellerini RAM'e al (preload)
  useEffect(() => {
    if (!product?.image_url) return;
    const preload = new Image();
    preload.src = product.image_url;
  }, [product.image_url]);

  const imageSrc = product.image_url?.startsWith("http")
    ? product.image_url
    : `/products/${product.image_url}`;

  const price = Number(product.price ?? 0);
  const oldPrice = Number(product.old_price ?? 0);
  const hasDiscount = oldPrice > price && price > 0;
  const discountRate = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  // ✅ Favori butonu ilk durumda doğru gelsin
  useEffect(() => {
    setFavorite(isFav(product.id));
  }, [product.id, isFav]);

  const handleFavorite = (e) => {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);

    if (next) {
      addFav(product);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "❤️ Favorilere eklendi!" },
        })
      );
    } else {
      removeFav(product.id);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "danger", text: "❌ Favorilerden çıkarıldı" },
        })
      );
    }
  };

  const lowStock = Number(product.stock ?? 0) > 0 && Number(product.stock ?? 0) <= 3;
  const outOfStock = Number(product.stock ?? 0) <= 0;

  return (
    <div
      className="relative group bg-neutral-950 text-gray-200 rounded-xl shadow-lg border border-neutral-800 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-yellow-600 hover:shadow-yellow-600/20 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div
        className="cursor-pointer bg-neutral-900 rounded-xl p-3 border border-neutral-800 hover:border-yellow-500 hover:scale-[1.03] transition relative"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="relative w-full h-40 sm:h-48 md:h-56 bg-black overflow-hidden rounded-lg mb-3 flex items-center justify-center">
          {/* ❤️ Favori Butonu */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 z-20 cursor-pointer bg-black/70 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center hover:scale-125 transition"
            aria-label="Favorilere Ekle"
          >
            {favorite ? "❤️" : "🤍"}
          </button>

          {/* 🔻 İndirim Etiketi */}
          {hasDiscount && (
            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
              %{discountRate} İndirim
            </span>
          )}

          {/* 🌟 Yeni Ürün Rozeti (Yanıp Sönen Premium Gold) */}
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

          <img
            src={imageSrc}
            alt={product.name}
            draggable="false"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            style={{
              aspectRatio: "3 / 4",
              objectPosition: "center",
              filter: "brightness(1) contrast(1) saturate(1)",
              imageRendering: "auto",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />
        </div>

        {/* 🔍 İncele Butonu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-semibold"
        >
          ✨🔎 İncele
        </button>

        <p className="font-semibold truncate">{product.name}</p>

        {/* ✅ Stok Etiketi */}
        {outOfStock ? (
          <p className="text-red-500 text-sm font-bold">Tükendi ❌</p>
        ) : lowStock ? (
          <p className="text-amber-400 text-sm font-bold">Az Kaldı ⚠️</p>
        ) : (
          <p className="text-green-500 text-sm font-bold">Stokta ✅</p>
        )}

        {hasDiscount ? (
          <p className="text-yellow-400 font-bold">
            <span className="text-gray-400 line-through text-sm mr-2">
              ₺{oldPrice.toLocaleString("tr-TR")}
            </span>
            ₺{price.toLocaleString("tr-TR")}
          </p>
        ) : (
          <p className="text-yellow-400 font-bold">
            ₺{price.toLocaleString("tr-TR")}
          </p>
        )}
      </div>

      <button
        disabled={outOfStock}
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product);
          window.dispatchEvent(
            new CustomEvent("toast", {
              detail: { type: "success", text: "✅ Sepete eklendi!" },
            })
          );
        }}
        className={`w-full mt-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${
          outOfStock
            ? "bg-gray-700 cursor-not-allowed"
            : "bg-gradient-to-r from-red-700 to-yellow-600 hover:opacity-90"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline-block transition-transform group-hover:scale-110"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39A2 2 0 0 0 9.64 16h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        {outOfStock ? "Tükendi" : "Sepete Ekle"}
      </button>
    </div>
  );
}
