import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { Heart, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";


function formatName(name) {
  if (!name) return "Kullanıcı";

  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];

  const first = parts[0];
  const last = parts[parts.length - 1][0] + ".";

  return `${first} ${last}`; // Örnek: Burak A.
}



const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

const STATUS = {
  in_stock: {
    t: "Stokta",
    cls: "bg-green-100 border border-green-400 text-green-700 text-xs px-3 py-1 rounded-full font-semibold",
  },
  low: {
    t: "Sınırlı Stok",
    cls: "bg-amber-100 border border-amber-400 text-amber-700 text-xs px-3 py-1 rounded-full font-semibold",
  },
  out: {
    t: "Tükendi",
    cls: "bg-red-100 border border-red-400 text-red-700 text-xs px-3 py-1 rounded-full font-semibold",
  },
};




export default function ProductDetail() {
  const { id } = useParams();
   const [descOpen, setDescOpen] = useState(false);
  const { addToCart } = useCart();
  const { addFav, removeFav, isFav } = useFavorites();
  const navigate = useNavigate();
  const { session } = useSession();

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("desc");
  const [reviews, setReviews] = useState([]);

// ⭐ YORUM SAYFALAMA
const [currentPage, setCurrentPage] = useState(1);
const reviewsPerPage = 5;

const indexOfLastReview = currentPage * reviewsPerPage;
const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

const totalPages = Math.ceil(reviews.length / reviewsPerPage);


  const [related, setRelated] = useState([]);

  const [activeIndex, setActiveIndex] = useState(0);

  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5 });
  const [mainImage, setMainImage] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [images, setImages] = useState([]);
const autoScrollRef = useRef(null);
  const relatedRef = useRef(null);

const scrollLeftRelated = () =>
  relatedRef.current?.scrollBy({ left: -300, behavior: "smooth" });

const scrollRightRelated = () =>
  relatedRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  

  // Ürün + yorumları yükle
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

      setP(data);
      setLoading(false);

      

      // Benzer ürünler yükle
      const { data: relatedProducts } = await supabase
        .from("products")
        .select("*")
        .eq("main_id", data.main_id)
        .neq("id", id)
        .limit(50);

      setRelated(relatedProducts || []);

      // Yorumları yükle
      const { data: comments } = await supabase
        .from("comments")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      setReviews(comments || []);

      // Realtime
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

      window.addEventListener("focus", () => window.location.reload());
      document.addEventListener("visibilitychange", () =>
        !document.hidden && window.location.reload()
      );

      return () => {
        alive = false;
        supabase.removeChannel(sub);
      };
    })();

    return () => (alive = false);
  }, [id]);


  

  // Görseller
  useEffect(() => {
    if (!p) return;

    const imgs = [];
    if (p.main_img) imgs.push(p.main_img);
    if (p.gallery?.length) imgs.push(...p.gallery);

    setImages(imgs);
    setMainImage(imgs[0] || "");
  }, [p]);

  // ⭐ SON İNCELENENLER — localStorage'a kaydet
useEffect(() => {
  if (!p) return;

  let viewed = JSON.parse(localStorage.getItem("recent_views") || "[]");

  viewed = viewed.filter((x) => x.id !== p.id);

  viewed.unshift({
    id: p.id,
    title: p.title,
    main_img: p.main_img,
    price: Number(p.price) || 0,
    old_price: Number(p.old_price) || 0,
  });

  viewed = viewed.slice(0, 10);

  localStorage.setItem("recent_views", JSON.stringify(viewed));
}, [p]);



  const stockBadge = useMemo(() => {
    if (!p) return STATUS.out;
    const s = Number(p.stock || 0);
    if (s <= 0) return STATUS.out;
    if (s < 5) return STATUS.low;
    return STATUS.in_stock;
  }, [p]);

  const parsedColors = useMemo(() => {
    if (!p?.colors) return [];
    return p.colors
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
  }, [p]);

  const [selectedColor, setSelectedColor] = useState("");

  const handleFavClick = () => {
    if (isFav(p.id)) {
      removeFav(p.id);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "info", text: "Favorilerden çıkarıldı" },
        })
      );
    } else {
      addFav(p);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "Favorilere eklendi" },
        })
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Yükleniyor…
      </div>
    );

  if (!p)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Ürün bulunamadı.
      </div>
    );

  return (
     <div className="min-h-screen bg-white text-gray-900 pt-[80px]">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-10 py-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

         {/* GÖRSELLER */}
<div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">

  {/* --- MASAÜSTÜ BÜYÜK GÖRSEL + OKLAR --- */}
  <div className="hidden lg:flex items-center justify-center relative">
    {/* Sol ok */}
    {images.length > 1 && (
      <button
        onClick={() => {
          const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
          setActiveIndex(newIndex);
          setMainImage(images[newIndex]);
        }}
        className="absolute left-3 bg-white/90 hover:bg-white border px-2 py-2 rounded-full shadow"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
    )}

    {/* Büyük görsel */}
    <div
      className="cursor-zoom-in"
      onClick={() => setZoomOpen(true)}
    >
      <img
        src={mainImage}
        alt={p.title}
        className="w-full h-auto object-contain rounded-xl"
        style={{ aspectRatio: "3/4" }}
      />
    </div>

    {/* Sağ ok */}
    {images.length > 1 && (
      <button
        onClick={() => {
          const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
          setActiveIndex(newIndex);
          setMainImage(images[newIndex]);
        }}
        className="absolute right-3 bg-white/90 hover:bg-white border px-2 py-2 rounded-full shadow"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    )}
  </div>

  {/* --- MOBİL SLIDER (KAYDIRMALI) --- */}
  <div
    className="lg:hidden flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
    ref={autoScrollRef}
    onScroll={(e) => {
      const scrollX = e.target.scrollLeft;
      const width = e.target.clientWidth;
      const index = Math.round(scrollX / width);

      setActiveIndex(index);
      if (images[index]) setMainImage(images[index]);
    }}
  >
    {images.map((src, i) => (
      <img
        key={i}
        src={src}
        className="w-full h-auto object-contain shrink-0 snap-center"
        style={{ aspectRatio: "3/4" }}
        onClick={() => setZoomOpen(true)}
      />
    ))}
  </div>

  {/* MOBİL DOTS */}
  {images.length > 1 && (
    <div className="lg:hidden flex justify-center gap-2 mt-3">
      {images.map((_, i) => (
        <div
          key={i}
          className={`
            h-2 rounded-full transition-all 
            ${i === activeIndex ? "w-6 bg-black" : "w-2 bg-gray-300"}
          `}
        />
      ))}
    </div>
  )}

  {/* ALT KÜÇÜK THUMBNAILS (MASAÜSTÜ) */}
  {images.length > 1 && (
    <div className="hidden lg:grid grid-cols-5 gap-3 mt-4">
      {images.map((src, i) => (
        <div
          key={i}
          onClick={() => {
            setMainImage(src);
            setActiveIndex(i);
          }}
          className={`border rounded-lg overflow-hidden cursor-pointer ${
            activeIndex === i ? "border-orange-500" : "border-gray-300"
          }`}
        >
          <img src={src} className="object-cover w-full h-full" />
        </div>
      ))}
    </div>
  )}
</div>


          {/* ÜRÜN BİLGİLERİ */}
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">{p.title}</h1>

              {/* FAVORİ BUTONU – Aynı kaldı */}
              <button
                onClick={handleFavClick}
                className="p-3 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                <Heart
                  className={`w-7 h-7 ${
                    isFav(p.id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            <p className="text-gray-500 mt-1">{p.category}</p>

            <div className="mt-3">
              <span className={stockBadge.cls}>{stockBadge.t}</span>
            </div>

            {/* FİYAT */}
            <div className="mt-6 flex items-center gap-3">
              {p.old_price > p.price && (
                <>
                  <span className="bg-red-100 border border-red-300 text-red-700 text-xs px-2 py-1 rounded">
                    %{Math.round(((p.old_price - p.price) / p.old_price) * 100)}
                  </span>

                  <span className="text-gray-400 line-through text-lg">
                    {TRY(p.old_price)}
                  </span>
                </>
              )}

              <span className="text-3xl font-bold text-gray-900">
                {TRY(p.price)}
              </span>
            </div>

            {/* RENK SEÇİMİ */}
            {parsedColors.length > 0 && (
              <div className="mt-6">
                <p className="text-gray-700 font-semibold mb-2">Renk Seçin:</p>

                <div className="flex gap-2 flex-wrap">
                 {parsedColors.map((c, i) => (
  <button
    key={i}
    onClick={() => setSelectedColor(c)}
    className={`px-4 py-2 rounded-lg text-sm border ${
      selectedColor === c
        ? "bg-orange-500 text-white border-orange-500"
        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
    }`}
  >
    {c.charAt(0).toUpperCase() + c.slice(1)}
  </button>
))}

                </div>
              </div>
            )}

            {/* BUTONLAR */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {/* SEPETE EKLE */}
              <button
                onClick={() => {
                  addToCart({
                    ...p,
                    selectedColor,
                    image_url: p.main_img || p.gallery?.[0],
                  });

                  window.dispatchEvent(
                    new CustomEvent("toast", {
                      detail: { type: "success", text: "Sepete eklendi!" },
                    })
                  );
                }}
                className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
              >
                Sepete Ekle
              </button>

              {/* HEMEN AL */}
              <button
                onClick={() => {
                  if (!session) {
                    return window.dispatchEvent(
                      new CustomEvent("toast", {
                        detail: {
                          type: "error",
                          text: "Giriş yapmanız gerekiyor!",
                        },
                      })
                    );
                  }

                  addToCart({
                    ...p,
                    image_url: p.main_img || p.gallery?.[0],
                  });

                  navigate("/checkout");
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
              >
                Hemen Al
              </button>
            </div>

           

        {/* SEKME ALANI */}
<div className="mt-10 border border-gray-300 rounded-xl">

  {/* SEKME BUTONLARI */}
  <div className="flex gap-6 px-4 py-3 border-b border-gray-300">
    <button
      onClick={() => setTab("desc")}
      className={`pb-2 ${
        tab === "desc"
          ? "border-b-2 border-orange-500 text-orange-600"
          : "text-gray-500"
      }`}
    >
      Açıklama
    </button>

    <button
      onClick={() => setTab("reviews")}
      className={`pb-2 ${
        tab === "reviews"
          ? "border-b-2 border-orange-500 text-orange-600"
          : "text-gray-500"
      }`}
    >
      Yorumlar ({reviews.length})
    </button>
  </div>

  {/* İÇERİKLER */}
  <div className="p-4 text-gray-700">

    {/* ⭐ AÇIKLAMA SECTION — AÇILIR KAPANIR */}
    {tab === "desc" && (
      <div className="border border-gray-300 rounded-lg">

        {/* Başlık */}
        <button
          onClick={() => setDescOpen(!descOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-gray-900 font-semibold"
        >
          <span>Ürün Açıklaması</span>
          <span className="text-xl">{descOpen ? "−" : "+"}</span>
        </button>

      {/* Açılan İçerik */}
{descOpen && (
  <div className="px-4 py-3 text-gray-700 bg-white border-t border-gray-300">
    <p className="whitespace-pre-line">
      {p.description || "Açıklama mevcut değil."}
    </p>
  </div>
)}

      </div>
    )}

    {/* ⭐ YORUMLAR */}
    {tab === "reviews" && (
      <div>
        {reviews.length === 0 ? (
          <p className="text-gray-500">
            Bu ürün için henüz yorum yapılmamış.
          </p>
        ) : (
          currentReviews.map((r) => (
            <div
              key={r.id}
              className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-3"
            >
              <div className="flex justify-between">
                <p className="font-semibold">{r.name}</p>
                <p className="text-orange-500">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
              </div>

              <p className="text-gray-700 mt-1">{r.text}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(r.created_at).toLocaleDateString("tr-TR")}
              </p>
            </div>
          ))
        )}


                    {/* SAYFALAMA (PAGINATION) */}
{totalPages > 1 && (
  <div className="flex items-center justify-center gap-3 mt-6">

    {/* Sol ok */}
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(currentPage - 1)}
      className={`px-3 py-1 rounded border ${
        currentPage === 1
          ? "text-gray-400 border-gray-300 cursor-not-allowed"
          : "text-gray-700 border-gray-400 hover:bg-gray-200"
      }`}
    >
      ←
    </button>

    {/* Sayfa numaraları */}
    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 rounded border ${
          currentPage === i + 1
            ? "bg-orange-500 text-white border-orange-500"
            : "text-gray-700 border-gray-400 hover:bg-gray-200"
        }`}
      >
        {i + 1}
      </button>
    ))}

    {/* Sağ ok */}
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(currentPage + 1)}
      className={`px-3 py-1 rounded border ${
        currentPage === totalPages
          ? "text-gray-400 border-gray-300 cursor-not-allowed"
          : "text-gray-700 border-gray-400 hover:bg-gray-200"
      }`}
    >
      →
    </button>
  </div>
)}


                    {/* Yorum Ekle */}
                   <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg mt-4">
  <h3 className="font-semibold mb-3 text-lg">Yorum Yap</h3>

  {/* PUAN SEÇİMİ */}
  <div className="flex gap-1 mb-3">
    {[1,2,3,4,5].map((n) => (
      <span
        key={n}
        onClick={() => setNewReview({ ...newReview, rating: n })}
        className={`text-2xl cursor-pointer ${
          n <= newReview.rating ? "text-orange-500" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ))}
  </div>

  {/* YORUM */}
  <textarea
    rows="3"
    placeholder="Yorumunuz…"
    value={newReview.text}
    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
  />

  <button
  onClick={async () => {
  if (!session) {
    return window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "error", text: "Giriş yapmanız gerekiyor!" },
      })
    );
  }

  if (!newReview.text.trim()) {
    return window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "error", text: "Lütfen yorum yazınız." },
      })
    );
  }

  // Profilden isim çek
  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session.user.id)
    .single();

  const displayName = formatName(prof?.full_name);

  const { error } = await supabase.from("comments").insert([
    {
      product_id: id,
      user_id: session.user.id,
      name: displayName, // Burak A.
      text: newReview.text,
      rating: newReview.rating,
    },
  ]);

  if (!error) {
    setNewReview({ name: "", text: "", rating: 5 });

    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "Yorum eklendi!" },
      })
    );
  }
}}

    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg"
  >
    Gönder
  </button>
</div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

       

        

    {/* BENZER ÜRÜNLER */}
{related.length > 0 && (
  <div className="mt-16">
    <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
      Benzer Ürünler
    </h2>

    {/* Masaüstü Oklar */}
    <div className="hidden lg:block relative w-full mb-4">
      <button
        onClick={scrollLeftRelated}
        className="absolute left-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300 shadow
        flex items-center justify-center hover:bg-gray-100 transition z-20"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      <button
        onClick={scrollRightRelated}
        className="absolute right-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300 shadow
        flex items-center justify-center hover:bg-gray-100 transition z-20"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>

    {/* SCROLL ALANI — TEK DIV!!! */}
    <div
      ref={relatedRef}
      className="flex gap-4 overflow-x-auto no-scrollbar px-2 pb-4 scroll-smooth"
    >
      {related.map((item, i) => {
        const imageUrl =
          item.main_img ||
          item.img_url ||
          item.gallery?.[0] ||
          "/placeholder.png";

        const hasDiscount = item.old_price > item.price;
        const discountRate = hasDiscount
          ? Math.round(((item.old_price - item.price) / item.old_price) * 100)
          : 0;

        return (
          <Link
            key={i}
            to={`/product/${item.id}`}
            className="flex-shrink-0 w-[150px] sm:w-[180px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <div className="relative">
              {hasDiscount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                  %{discountRate} İndirim
                </span>
              )}

              <img
                src={imageUrl}
                className="w-full h-[160px] object-cover rounded-t-xl"
              />
            </div>

            <div className="p-3 text-center">
              <p className="text-sm font-semibold text-gray-700 truncate">
                {item.title}
              </p>

              <div className="mt-1">
                {hasDiscount && (
                  <span className="text-gray-400 line-through text-xs mr-1">
                    {TRY(item.old_price)}
                  </span>
                )}

                <span className="text-orange-500 font-bold text-sm">
                  {TRY(item.price)}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </div>
)}


        {/* GERİ DÖN */}
        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm"
          >
            ← Alışverişe Dön
          </Link>
        </div>
      </div>

      {/* ZOOM MODAL */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center"
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
