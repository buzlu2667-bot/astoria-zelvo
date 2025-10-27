import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { Heart } from "lucide-react";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

const STATUS = {
  in_stock: { t: "Stokta", cls: "badge badge-green" },
  low: { t: "Sınırlı Stok", cls: "badge badge-yellow" },
  out: { t: "Tükendi", cls: "badge badge-red" },
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addFav, removeFav, isFav } = useFavorites();

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("desc");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!alive) return;
      setP(data || null);

      setReviews([
        {
          id: 1,
          name: "Misafir",
          text: "Kaliteli ürün, hızlı kargo!",
          rating: 5,
          created_at: "2025-01-05",
        },
        {
          id: 2,
          name: "Ece",
          text: "Fiyat/performans başarılı.",
          rating: 4,
          created_at: "2025-01-11",
        },
      ]);
      setLoading(false);
    })();
    return () => (alive = false);
  }, [id]);

  const images = useMemo(() => {
    if (!p) return [];
    return [
      p.image_url,
      ...(p.images || []),
    ].filter(Boolean).map((f) => f);
  }, [p]);

  const stockBadge = useMemo(() => {
    if (!p) return STATUS.out;
    const s = Number(p.stock || 0);
    if (s <= 0) return STATUS.out;
    if (s < 5) return STATUS.low;
    return STATUS.in_stock;
  }, [p]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Yükleniyor…
      </div>
    );

  if (!p)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Ürün bulunamadı.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-white">
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Görsel */}
        <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
          <div className="aspect-[4/3] bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center">
            <img src={images[0]} className="object-contain w-full h-full" />
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.slice(1).map((src, i) => (
                <div
                  key={i}
                  className="aspect-square bg-neutral-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-500 transition"
                >
                  <img src={src} className="object-contain w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bilgi */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-extrabold">{p.name}</h1>

            {/* ✅ FAVORİ BUTONU */}
            <button
              onClick={() => {
                if (isFav(p.id)) {
                  removeFav(p.id);
                } else {
                  addFav(p);
                }
              }}
              className="rounded-xl p-3 bg-white/10 hover:bg-white/20 transition"
              title="Favori"
            >
              <Heart
                className={`w-7 h-7 ${
                  isFav(p.id)
                    ? "text-rose-500 fill-rose-500"
                    : "text-gray-400"
                }`}
              />
            </button>
          </div>

          <p className="text-gray-400 mt-2">{p.category || "Kategori"}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className={stockBadge.cls}>{stockBadge.t}</span>
            <span className="text-gray-400 text-sm">
              Stok: {Number(p.stock || 0)}
            </span>
          </div>

          <div className="mt-6 text-rose-400 text-3xl font-extrabold">
            {TRY(p.price)}
          </div>

          <div className="mt-6 flex gap-3">
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
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl"
            >
              🛒 Sepete Ekle
            </button>

            <Link
              to="/checkout"
              className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
            >
              Hemen Al
            </Link>
          </div>

          {/* Sekmeler */}
          <div className="mt-8">
            <div className="flex gap-3">
              <button
                onClick={() => setTab("desc")}
                className={`tab ${tab === "desc" ? "tab-active" : ""}`}
              >
                Açıklama
              </button>
              <button
                onClick={() => setTab("reviews")}
                className={`tab ${tab === "reviews" ? "tab-active" : ""}`}
              >
                Yorumlar
              </button>
            </div>

            {tab === "desc" && (
              <div className="mt-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-gray-300">
                {p.description ||
                  "Bu ürün hakkında açıklama eklenmemiştir."}
              </div>
            )}

            {tab === "reviews" && (
              <div className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-yellow-400">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </p>
                    </div>
                    <p className="text-gray-300 mt-1">{r.text}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(r.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-gray-400">Henüz yorum yok.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Link to="/" className="text-sm text-gray-400 hover:text-white">
          ← Alışverişe dön
        </Link>
      </div>
    </div>
  );
}
