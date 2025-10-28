import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

export default function ProductCard({ product, openModal }) {
  const { addToCart } = useCart();
  const { addFav, removeFav, isFav } = useFavorites();
  const [favorite, setFavorite] = useState(false);

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

  const handleFavorite = () => {
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
  onClick={() => openModal(product)}
onTouchEnd={() => openModal(product)}
>


      {/* ❤️ FAVORİ BUTONU — Artık Global! */}
      <button
  onClick={(e) => {
    e.stopPropagation(); // ✅ Kart tıklamasını engeller
    handleFavorite();
  }}

        
        className="absolute top-3 right-3 z-20 cursor-pointer bg-black/70 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center hover:scale-125 transition"
        aria-label="Favorilere Ekle"
      >
        {favorite ? "❤️" : "🤍"}
      </button>

      {hasDiscount && (
        <span className="absolute top-3 left-3 z-20 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
          %{discountRate} İndirim
        </span>
      )}

      <div
        className="w-full h-28 sm:h-36 md:h-48 bg-black overflow-hidden cursor-pointer"
        onClick={() => openModal(product)}
        aria-label="Hızlı İncele"
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ease-out"
        />

        <button
          onClick={() => openModal(product)}
          className="absolute bottom-3 px-3 py-1 text-xs rounded-md bg-black/70 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          🔍 İncele
        </button>
      </div>

      <div className="p-3 flex flex-col justify-between min-h-[170px]">
        <h3 className="font-semibold text-base text-center truncate">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center justify-center gap-2 min-h-[22px]">
          {outOfStock && (
            <span className="text-red-500 text-xs font-semibold">Tükendi ❌</span>
          )}
          {lowStock && !outOfStock && (
            <span className="text-yellow-400 text-xs font-semibold">Az Kaldı ⚠️</span>
          )}
        </div>

        <div className="mt-2 flex items-end justify-center gap-2">
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              ₺{oldPrice.toLocaleString("tr-TR")}
            </span>
          )}
          <span className="text-yellow-400 font-bold text-lg drop-shadow-sm">
            ₺{price.toLocaleString("tr-TR")}
          </span>
        </div>

     <button
  disabled={outOfStock}
 onClick={(e) => {
  e.stopPropagation(); // ✅ Modal açılmasın
  addToCart(product);
    window.dispatchEvent(new CustomEvent("toast", {
      detail: { type: "success", text: "✅ Sepete eklendi!" },
    }));
  }}
  className={`w-full mt-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${
    outOfStock
      ? "bg-gray-700 cursor-not-allowed"
      : "bg-gradient-to-r from-red-700 to-yellow-600 hover:opacity-90"
  }`}
>
  {/* ✅ Inline SVG Cart Icon */}
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

  {/* ✅ Text */}
  {outOfStock ? "Tükendi" : "Sepete Ekle"}
</button>




      </div>
    </div>
  );
}
