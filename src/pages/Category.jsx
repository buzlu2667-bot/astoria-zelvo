import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import QuickViewModal from "../components/QuickViewModal";
import { useFavorites } from "../context/FavoritesContext";

export default function Category() {
  const { addFav, removeFav, isFav } = useFavorites();
const [favorites, setFavorites] = useState([]);
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categoryName = id?.toLowerCase();

 useEffect(() => {
  if (!categoryName) return;

  // ✅ Ürünleri yükleme fonksiyonu
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("category", categoryName);

    if (error) {
      console.error("❌ Ürün yükleme hatası:", error.message);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  // 🔹 Sayfa açılınca ilk defa çek
  fetchProducts();

  // ✅ Realtime dinleme başlat
  const channel = supabase
    .channel("products-updates")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      (payload) => {
        console.log("🔄 Ürün tablosu değişti:", payload);
        fetchProducts(); // 🔁 değişiklikte yeniden çek
      }
    )
    .subscribe();

  // 🔹 Component kapanınca listener'ı kapat
  return () => {
    supabase.removeChannel(channel);
  };
}, [categoryName]);


  if (loading)
    return <div className="text-white text-center mt-20">Yükleniyor...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Ürünler</h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((p) => {
           const price = Number(p.price ?? 0);
const old = Number(p.old_price ?? 0);
const hasDiscount = old > 0 && old > price;
const discount = hasDiscount ? Math.round(((old - price) / old) * 100) : 0;


            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setModalOpen(true);
                }}
                className="cursor-pointer bg-neutral-900 rounded-xl p-3 border border-neutral-800 hover:border-yellow-500 hover:scale-[1.03] transition relative"
              >
                <div className="relative w-full h-40 sm:h-48 md:h-56 bg-black overflow-hidden rounded-lg mb-3 flex items-center justify-center">
  {/* ✅ İndirim etiketi artık resmin ÜSTÜNDE */}
  {discount > 0 && (
    <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
      %{discount} İndirim
    </span>
  )}

  <img
    src={
      p.image_url?.startsWith("http")
        ? p.image_url
        : `/products/${p.image_url}`
    }
    alt={p.name}
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
  {/* 🔍 İncele Butonu */}
<button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedProduct(p);
    setModalOpen(true);
  }}
  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 text-white text-sm font-semibold"
>
 ✨🔎 İncele
</button>

  {/* ❤️ Favori Butonu */}
<button
  onClick={(e) => {
    e.stopPropagation();
    const alreadyFav = favorites.includes(p.id);
    if (alreadyFav) {
      setFavorites(favorites.filter((id) => id !== p.id));
      removeFav(p.id);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "danger", text: "❌ Favorilerden çıkarıldı" },
        })
      );
    } else {
      setFavorites([...favorites, p.id]);
      addFav(p);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "❤️ Favorilere eklendi!" },
        })
      );
    }
  }}
  className="absolute top-3 right-3 z-20 cursor-pointer bg-black/70 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center hover:scale-125 transition"
>
  {favorites.includes(p.id) ? "❤️" : "🤍"}
</button>

</div>




                <p className="font-semibold truncate">{p.name}</p>
                {/* ✅ Stok Etiketi */}
{p.stock <= 0 ? (
  <p className="text-red-500 text-sm font-bold">Tükendi ❌</p>
) : p.stock < 10 ? (
  <p className="text-amber-400 text-sm font-bold">Az Kaldı ⚠️</p>
) : (
  <p className="text-green-500 text-sm font-bold">Stokta ✅</p>
)}


                             {hasDiscount ? (
  <p className="text-yellow-400 font-bold">
    <span className="text-gray-400 line-through text-sm mr-2">
      ₺{old.toLocaleString("tr-TR")}
    </span>
    ₺{price.toLocaleString("tr-TR")}
  </p>
) : (
  <p className="text-yellow-400 font-bold">
    ₺{price.toLocaleString("tr-TR")}
  </p>
)}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-yellow-400 drop-shadow-xl">
            Yakında ...! ✨
          </h2>
          <p className="text-gray-400">Henüz ürün yok.</p>
        </div>
      )}

      {modalOpen && (
        <QuickViewModal
          product={selectedProduct}
          closeModal={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
