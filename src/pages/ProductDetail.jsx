import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { Heart, ZoomIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";


const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

const STATUS = {
  in_stock: { t: "Stokta", cls: "bg-emerald-600/20 border border-emerald-400 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold" },
  low: { t: "Sınırlı Stok", cls: "bg-amber-500/10 border border-amber-400 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold" },
  out: { t: "Tükendi", cls: "bg-rose-700/10 border border-rose-500 text-rose-400 text-xs px-3 py-1 rounded-full font-semibold" },
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addFav, removeFav, isFav } = useFavorites();

    // ✅ Sayfa tamamen yüklendikten sonra en üste çıkar
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, 300); // 0.3 saniye gecikme — görseller yüklensin diye

    return () => clearTimeout(timeout);
  }, [id]);


  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("desc");
  const [reviews, setReviews] = useState([]);
  // ✅ Benzer ürünler
const [related, setRelated] = useState([]);

  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5 });
  const [mainImage, setMainImage] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [images, setImages] = useState([]);
const { session } = useSession();
const navigate = useNavigate();
  // 🔹 Ürünü çek + yorumları getir
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (!alive) return;
      setP(data || null);
      setLoading(false);

      // ✅ Benzer ürünleri getir (kategoriye göre)
// ✅ Benzer ürünleri getir (her zaman bir şey göstersin)
let relatedQuery = supabase
  .from("products")
  .select("*")
  .neq("id", Number(id))
  .limit(10);

if (data?.category) {
  relatedQuery = relatedQuery.eq("category", data.category);
}

const { data: relatedData } = await relatedQuery;
setRelated(relatedData || []);



      // 🔹 Yorumları getir
      const { data: comments } = await supabase
        .from("comments")
        .select("*")
        .eq("product_id", Number(id))
        .order("created_at", { ascending: false });

      setReviews(comments || []);

      // 🔹 Realtime dinleyici
      const sub = supabase
        .channel("realtime-comments")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "comments" },
          (payload) => {
            if (payload.new.product_id === Number(id)) {
              setReviews((prev) => [payload.new, ...prev]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(sub);
      };
    })();
    return () => (alive = false);
  }, [id]);

  // 🔹 Görselleri sırayla test et
  useEffect(() => {
    if (!p?.image_url) return;
    const base = p.image_url.replace(/\.(png|jpg|jpeg|webp)$/i, "");
    const candidates = [
      `/products/${base}.png`,
      `/products/${base}.1.png`,
      `/products/${base}.2.png`,
      `/products/${base}.3.png`,
      `/products/${base}.4.png`,
      `/products/${base}.5.png`,
      `/products/${base}.6.png`,
      `/products/${base}.7.png`,
      `/products/${base}.8.png`,
      `/products/${base}.9.png`,
      `/products/${base}.10.png`,
      `/products/${base}.11.png`,
      `/products/${base}.12.png`,
    ].filter((src) => !src.includes("/products/.png"));

    const valid = [];
    let active = true;

    const checkSequential = async () => {
      for (let i = 0; i < candidates.length; i++) {
        const url = candidates[i];
        const img = new Image();
        img.src = url;
        const ok = await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
        if (ok && active) {
          valid.push(url);
          setImages([...valid]);
        }
      }
    };

    checkSequential();
    return () => {
      active = false;
    };
  }, [p]);

  useEffect(() => {
    if (images.length > 0) setMainImage(images[0]);
  }, [images]);

  const stockBadge = useMemo(() => {
    if (!p) return STATUS.out;
    const s = Number(p.stock || 0);
    if (s <= 0) return STATUS.out;
    if (s < 5) return STATUS.low;
    return STATUS.in_stock;
  }, [p]);

  // 🔹 Gerçek yorum ekleme
  const handleAddReview = async () => {
    if (!newReview.name || !newReview.text) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "error", text: "Lütfen adınızı ve yorumunuzu girin." },
        })
      );
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert([
        {
          product_id: Number(id),
          name: newReview.name,
          text: newReview.text,
          rating: newReview.rating,
        },
      ]);

    if (error) {
      console.error(error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "error", text: "Yorum eklenirken hata oluştu." },
        })
      );
    } else {
      setNewReview({ name: "", text: "", rating: 5 });
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "💬 Yorum eklendi!" },
        })
      );
    }
  };

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

  // 🔔 Favori bildirimi fonksiyonu
  const handleFavClick = () => {
    if (isFav(p.id)) {
      removeFav(p.id);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "info", text: "💔 Favorilerden kaldırıldı" },
        })
      );
    } else {
      addFav(p);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "❤️ Favorilere eklendi!" },
        })
      );
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
     <div className="w-full mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Görseller */}
          <div className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800">
            <div
  className="w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center relative group cursor-zoom-in"
  onClick={() => setZoomOpen(true)}
>
  {mainImage ? (
    <img
      src={mainImage}
      alt={p.name}
      className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      style={{
        aspectRatio: "3/4",
        objectPosition: "center",
        filter: "brightness(1) contrast(1.05) saturate(1.05)",
        imageRendering: "auto",
      }}
    />
  ) : (
    <div className="text-gray-500">Görsel bulunamadı</div>
  )}

  <ZoomIn className="absolute bottom-3 right-3 text-yellow-400 w-6 h-6 opacity-70" />
</div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((src, i) => (
                  <div
                    key={i}
                    onClick={() => setMainImage(src)}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition border ${
                      mainImage === src
                        ? "border-yellow-500 ring-2 ring-yellow-400/40"
                        : "border-neutral-800 hover:ring-2 hover:ring-yellow-500/40"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="object-contain w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bilgiler */}
          <div>
            <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400 drop-shadow-[0_0_10px_rgba(255,200,0,0.3)] leading-tight">
                {p.name}
              </h1>

              <button
                onClick={handleFavClick}
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
</div>


            <div className="mt-5 text-yellow-400 text-2xl sm:text-3xl font-extrabold drop-shadow-[0_0_12px_rgba(255,200,0,0.25)]">
              {TRY(p.price)}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => {
                  addToCart(p);
                  window.dispatchEvent(
                    new CustomEvent("toast", {
                      detail: {
                        type: "success",
                        text: " Sepete eklendi!",
                      },
                    })
                  );
                }}
                className="w-full sm:flex-1 bg-gradient-to-r from-yellow-600 to-red-600 hover:opacity-90 text-black font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(255,200,0,0.2)]"
              >
                Sepete Ekle
              </button>

              <button
  onClick={() => {
    if (!session) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            text: "🔐 Satın alma işlemi için lütfen giriş yapın!",
          },
        })
      );
      return;
    }

    addToCart(p);
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "🛍️ Ürün sepete eklendi!" },
      })
    );

    navigate("/checkout");
  }}
  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-[0_0_15px_rgba(255,200,0,0.3)] text-center"
>
  Hemen Al
</button>


            </div>

            <p className="mt-4 text-yellow-400/90 text-center italic text-sm sm:text-base animate-pulse drop-shadow-[0_0_10px_rgba(255,200,0,0.3)] flex items-center justify-center gap-2 px-2">
              🎨 Sipariş verirken lütfen tercih ettiğiniz rengi açıklama kısmında belirtiniz.!
            </p>

            {/* Sekmeler */}
            <div className="mt-8">
              <div className="flex flex-wrap gap-3 border-b border-neutral-800 pb-1">
                <button
                  onClick={() => setTab("desc")}
                  className={`pb-2 text-sm font-semibold ${
                    tab === "desc"
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Açıklama
                </button>
                <button
                  onClick={() => setTab("reviews")}
                  className={`pb-2 text-sm font-semibold ${
                    tab === "reviews"
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Yorumlar
                </button>
              </div>

              {tab === "desc" && (
                <div className="mt-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-gray-300 leading-relaxed">
                 <p
  className="whitespace-pre-line"
>
  {p.description || "Bu ürün hakkında açıklama eklenmemiştir."}
</p>
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

                  {/* Yeni yorum formu */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mt-5">
                    <h3 className="text-yellow-400 font-semibold mb-2">
                      Yorum Yap
                    </h3>
                    <input
                      type="text"
                      placeholder="Adınız"
                      value={newReview.name}
                      onChange={(e) =>
                        setNewReview({ ...newReview, name: e.target.value })
                      }
                      className="w-full mb-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm"
                    />
                    <textarea
                      rows="3"
                      placeholder="Yorumunuz"
                      value={newReview.text}
                      onChange={(e) =>
                        setNewReview({ ...newReview, text: e.target.value })
                      }
                      className="w-full mb-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm"
                    />
                    <button
                      onClick={handleAddReview}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold"
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
          
  {/* ✅ Benzer Ürünler */}
{related.length > 0 && (
  <div className="mt-16 w-full overflow-hidden relative">
    <h2 className="text-2xl font-bold text-yellow-400 mb-5 text-center">
      Benzer Ürünler
    </h2>

    {/* Kaydırma Alanı */}
    <div
      className="scrollbar-hide overflow-hidden w-full"
      onMouseEnter={(e) => e.currentTarget.querySelector(".auto-scroll").style.animationPlayState = "paused"}
      onMouseLeave={(e) => e.currentTarget.querySelector(".auto-scroll").style.animationPlayState = "running"}
    >
      <div className="auto-scroll gap-4 px-4 pb-6">
        {[...related, ...related].map((item, i) => {
          const imageUrl = item.image_url?.startsWith("http")
            ? item.image_url
            : `/products/${item.image_url}`;

          return (
            <Link
              key={i}
              to={`/product/${item.id}`}
              className="flex-shrink-0 w-[150px] sm:w-[180px] bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden hover:border-yellow-500/60 hover:shadow-yellow-500/20 transition"
            >
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-[160px] object-cover"
              />
              <div className="p-3 text-center">
                <p className="text-sm font-semibold text-gray-200 truncate">
                  {item.name}
                </p>
                <p className="text-yellow-400 text-sm font-bold mt-1">
                  {TRY(item.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </div>
)}







        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-[0_0_15px_rgba(255,200,0,0.3)] transition"
          >
            ← Alışverişe Dön
          </Link>
        </div>


      </div>

      {/* Zoom Modal */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 bg-black/90 z-[99999] flex items-center justify-center cursor-zoom-out"
        >
          <img
            src={mainImage}
            alt=""
            className="max-w-[90%] max-h-[90%] object-contain"
          />
        </div>
      )}
    </div>
  );
}
