import { useState } from "react";
import QuickViewModal from "../components/QuickViewModal";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Trash2, Heart } from "lucide-react";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

export default function Favorites() {
  const { favorites, removeFav } = useFavorites();
  const { addToCart } = useCart();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  if (!favorites || favorites.length === 0)
    return (
      <div className="min-h-[70vh] text-center flex flex-col items-center justify-center text-white">
        <Heart className="w-16 h-16 text-yellow-300 animate-pulse drop-shadow-lg" />
        <h2 className="mt-5 text-4xl font-extrabold bg-gradient-to-r from-yellow-300 to-rose-400 bg-clip-text text-transparent">
          Favoriler Boş
        </h2>
        <p className="text-gray-400 mt-2">Beğendiğin ürünler burada görebilirsin.</p>

        <a
          href="/"
          className="mt-6 bg-gradient-to-r from-yellow-400 to-rose-400 px-8 py-3 rounded-xl text-black font-bold shadow-[0_0_20px_rgba(255,200,0,0.4)] hover:brightness-110 transition"
        >
          Alışverişe Başla
        </a>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-white">
      <h1 className="text-3xl font-extrabold mb-10">Favorilerim ❤️</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {favorites.map((p) => {
          const images = [
            p.image_url,
            ...(Array.isArray(p.images) ? p.images : []),
          ]
            .filter(Boolean)
            .map((img) =>
              img.startsWith("http")
                ? img
                : `/products/${img}`
            );

          return (
            <div
              key={p.id}
              className="bg-[#111] rounded-2xl shadow-lg border border-yellow-500/20 p-4 hover:border-yellow-400/40 hover:shadow-[0_0_25px_rgba(255,200,0,0.3)] transition"
            >

              {/* ✅ ANA GÖRSEL */}
              <div
                className="relative aspect-square overflow-hidden rounded-xl bg-black/30 group cursor-pointer"
                onClick={() => {
                  setSelected(p);
                  setModalOpen(true);
                }}
              >
                <img
                  src={images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />

                {/* 🔍 Hızlı İnceleme ikonu */}
                <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition">
                  🔍 İncele
                </span>
              </div>

              {/* ✅ Küçük görüntüler */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {images.slice(1, 4).map((s, i) => (
                    <div key={i} className="cursor-pointer"
                      onClick={() => {
                        setSelected(p);
                        setModalOpen(true);
                      }}
                    >
                      <img
                        src={s}
                        className="rounded-lg h-16 w-full object-cover opacity-75 hover:opacity-100 transition"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Başlık */}
              <h3 className="mt-4 font-semibold truncate">{p.name}</h3>

              {/* Fiyat */}
              <p className="text-yellow-400 text-lg font-bold mt-1">
                {TRY(p.price)}
              </p>

              {/* ✅ Butonlar */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    addToCart(p);
                    window.dispatchEvent(
                      new CustomEvent("toast", {
                        detail: {
                          type: "success",
                          text: "🛒 Sepete eklendi!",
                        },
                      })
                    );
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-2 font-bold rounded-lg transition flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Sepete
                </button>

                <button
                  onClick={() => removeFav(p.id)}
                  className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Quick View Modal */}
      {modalOpen && (
        <QuickViewModal
  product={selected}
  closeModal={() => setModalOpen(false)}
/>

      )}
    </div>
  );
}
