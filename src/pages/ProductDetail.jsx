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
       .eq("id", id)
        .single();

      if (!alive) return;
      setP(data || null);
      setLoading(false);



// ⭐ Benzer ürünler → sadece main_id bazlı (sorunsuz)
const { data: relatedProducts } = await supabase
  .from("products")
  .select("*")
  .eq("main_id", data.main_id)
  .neq("id", id)
  .limit(7);

setRelated(relatedProducts || []);




      // 🔹 Yorumları getir
      const { data: comments } = await supabase
        .from("comments")
        .select("*")
       .eq("product_id", id)
        .order("created_at", { ascending: false });

      setReviews(comments || []);

      // 🔹 Realtime dinleyici
      const sub = supabase
        .channel("realtime-comments")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "comments" },
          (payload) => {
           if (payload.new.product_id === id) {
              setReviews((prev) => [payload.new, ...prev]);
            }
          }
        )
        .subscribe();


            // 🔥 Sekmeden geri dönünce sayfayı tazele
    const onFocus = () => {
      console.log("FOCUS → Ürün yeniden yükleniyor...");
      alive = false;
      setLoading(true);
      window.location.reload();
    };

    const onVisible = () => {
      if (!document.hidden) {
        console.log("VISIBILITYCHANGE → reload");
        alive = false;
        setLoading(true);
        window.location.reload();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);


     return () => {
  alive = false;
  supabase.removeChannel(sub);
  window.removeEventListener("focus", onFocus);
  document.removeEventListener("visibilitychange", onVisible);
};

    })();
    return () => (alive = false);
  }, [id]);

  // 🔹 Görselleri sırayla test et
 // 🔥 Ürün resimlerini Supabase'den alma
useEffect(() => {
  if (!p) return;

  const imgs = [];

  // Ana foto varsa ekle
  if (p.main_img) {
    imgs.push(p.main_img);
  }

  // Galeri varsa ekle
  if (p.gallery && Array.isArray(p.gallery) && p.gallery.length > 0) {
    imgs.push(...p.gallery);
  }

  // Görselleri state'e at
  if (imgs.length > 0) {
    setImages(imgs);
    setMainImage(imgs[0]);
  } else {
    setImages([]);
    setMainImage("");
  }
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

  // 🎨 Ürün renklerini parçalıyoruz
const parsedColors = useMemo(() => {
  if (!p?.colors) return [];
  return p.colors
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}, [p]);

// Seçilen renk state
const [selectedColor, setSelectedColor] = useState("");


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
   <div className="min-h-screen text-white">
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
     alt={p.title}
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
             {p.title}
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

{/* 💰 Premium Fiyat + İndirim Bloğu */}
{p.old_price > p.price ? (
  <div
    className="
      mt-5 inline-flex items-center gap-3
      bg-black/40 px-4 py-2 rounded-xl
      border border-yellow-500/40
      shadow-[0_0_15px_rgba(255,215,0,0.35)]
      text-yellow-300 text-xl font-bold
    "
  >
    {/* % İndirim */}
    <span
      className="
        text-red-400 font-bold text-sm 
        bg-red-500/20 px-3 py-[3px] rounded-md 
        border border-red-500/40
        shadow-[0_0_10px_rgba(255,80,80,0.4)]
      "
    >
      %{Math.round(((p.old_price - p.price) / p.old_price) * 100)}
    </span>

    {/* Eski Fiyat */}
    <span className="text-gray-400 line-through text-lg">
      ₺{Number(p.old_price).toLocaleString("tr-TR")}
    </span>

    {/* Yeni Fiyat */}
    <span className="text-yellow-300 text-2xl font-extrabold drop-shadow-[0_0_12px_rgba(255,200,0,0.35)]">
      ₺{Number(p.price).toLocaleString("tr-TR")}
    </span>
  </div>
  
) : (
  <div className="mt-5 text-yellow-400 text-3xl font-extrabold drop-shadow-[0_0_12px_rgba(255,200,0,0.25)]">
    ₺{Number(p.price).toLocaleString("tr-TR")}
  </div>
)}

{/* 🎨 Renk Seçimi */}
{parsedColors.length > 0 && (
  <div className="mt-6">
    <p className="text-gray-300 font-semibold mb-2">Renk Seçin:</p>

    <div className="flex flex-wrap gap-2">
      {parsedColors.map((color, i) => (
        <button
          key={i}
          onClick={() => setSelectedColor(color)}
          className={`
            px-4 py-2 rounded-xl text-sm font-semibold border 
            transition 
            ${selectedColor === color 
              ? "bg-yellow-500 text-black border-yellow-400" 
              : "bg-neutral-800 text-gray-300 border-neutral-700 hover:border-yellow-500/40"
            }
          `}
        >
          {color}
        </button>
      ))}
    </div>
  </div>
)}

            <div className="mt-5 flex flex-col sm:flex-row gap-3 w-full">
            <button
  onClick={async () => {

    let existed = false;

    // 1) LOGIN Mİ?
    const { data: u } = await supabase.auth.getUser();
    const user = u?.user;

    if (!user) {
      // 🔥 Misafir → LocalStorage kontrol
      const ls = JSON.parse(localStorage.getItem("elitemart_cart") || "[]");
      existed = ls.some((i) => String(i.id) === String(p.id));
    } else {
      // 🔥 Login → DB kontrol
      const { data: existRow } = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", p.id) // UUID
        .maybeSingle();

      existed = !!existRow;
    }

    // 2) Ürünü sepete ekle
 addToCart({
  ...p,
  selectedColor,
  image_url: p.main_img || (p.gallery?.[0] ?? null),
  main_img: p.main_img,
});

    // 3) Toast seçimi
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: existed
          ? { type: "info", text: "⚡ Ürün adedi artırıldı!" }
          : { type: "success", text: " Sepete eklendi!" },
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

  // ❗ Tek addToCart — tekrar yok
  addToCart({
    ...p,
    image_url: p.main_img || (p.gallery?.[0] ?? null),
    main_img: p.main_img,
    img_url: p.img_url,
    gallery: p.gallery,
  });

  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: { type: "success", text: "🛍️ Ürün sepete eklendi!" },
    })
  );

  // ❗ TEK navigate
  navigate("/checkout");
}}

  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-[0_0_15px_rgba(255,200,0,0.3)] text-center"
>
  Hemen Al
</button>


            </div>

            <p className="mt-4 text-yellow-400/90 text-center italic text-sm sm:text-base animate-pulse drop-shadow-[0_0_10px_rgba(255,200,0,0.3)] flex items-center justify-center gap-2 px-2">
               Sipariş verirken lütfen tercih ettiğiniz rengi açıklama kısmında belirtiniz.!
            </p>

        {/* ⭐ PREMIUM SEKMELİ DETAY BLOĞU */}
<div className="mt-10 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(255,200,0,0.05)]">

  {/* 🔥 Sekme Başlıkları */}
  <div className="flex gap-3 border-b border-neutral-800 pb-3">
    <button
      onClick={() => setTab("desc")}
      className={`pb-2 text-sm font-semibold ${
        tab === "desc"
          ? "text-yellow-400 border-b-2 border-yellow-400"
          : "text-gray-400"
      }`}
    >
      Açıklama
    </button>

    <button
      onClick={() => setTab("specs")}
      className={`pb-2 text-sm font-semibold ${
        tab === "specs"
          ? "text-yellow-400 border-b-2 border-yellow-400"
          : "text-gray-400"
      }`}
    >
      Ürün Özellikleri
    </button>

    <button
      onClick={() => setTab("reviews")}
      className={`pb-2 text-sm font-semibold ${
        tab === "reviews"
          ? "text-yellow-400 border-b-2 border-yellow-400"
          : "text-gray-400"
      }`}
    >
      Yorumlar ({reviews.length})
    </button>
  </div>

  {/* 📌 Açıklama */}
  {tab === "desc" && (
    <div className="mt-4 text-gray-300 leading-relaxed">
      <p className="whitespace-pre-line">
        {p.description || "Bu ürün hakkında açıklama bulunmuyor."}
      </p>
    </div>
  )}

 {/* 📌 Ürün Özellikleri */}
{tab === "specs" && (
  <div className="mt-4 text-gray-300 leading-relaxed whitespace-pre-line">
    {p.specs || "Ürün özellikleri eklenmemiştir."}
  </div>
)}

  {/* 📌 Yorumlar */}
  {tab === "reviews" && (
    <div className="mt-4">

      {/* ⭐ Yorum Listesi */}
      {reviews.length === 0 ? (
        <p className="text-gray-400">Bu ürün için henüz yorum yapılmamış.</p>
      ) : (
        reviews.map((r) => (
          <div
            key={r.id}
            className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700 mb-3"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-200">{r.name}</p>
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
        ))
      )}

      {/* ⭐ Yorum Ekleme Formu */}
      <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 mt-4">
        <h3 className="text-yellow-400 font-semibold mb-2">Yorum Yap</h3>

        <input
          type="text"
          placeholder="Adınız"
          value={newReview.name}
          onChange={(e) =>
            setNewReview({ ...newReview, name: e.target.value })
          }
          className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 mb-2"
        />

        <textarea
          rows="3"
          placeholder="Yorumunuz"
          value={newReview.text}
          onChange={(e) =>
            setNewReview({ ...newReview, text: e.target.value })
          }
          className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 mb-2"
        />

        <button
          onClick={handleAddReview}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded-lg shadow"
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
         const imageUrl =
  item.main_img ||
  item.img_url ||
  (item.gallery?.[0] ?? "/assets/placeholder-product.png");


          return (
            <Link
              key={i}
              to={`/product/${item.id}`}
              className="flex-shrink-0 w-[150px] sm:w-[180px] bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden hover:border-yellow-500/60 hover:shadow-yellow-500/20 transition"
            >
              <img
                src={imageUrl}
                alt={item.title}
                className="w-full h-[160px] object-cover"
              />
              <div className="p-3 text-center">
                <p className="text-sm font-semibold text-gray-200 truncate">
                  {item.title}
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
