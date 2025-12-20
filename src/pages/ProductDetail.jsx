import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { Heart, ZoomIn, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import ProductCardVertical from "../components/ProductCardVertical";
import { Hourglass } from "lucide-react";
import { Clock, Flame } from "lucide-react";
import { ShieldAlert } from "lucide-react";

function parseLocalDate(dateStr) {
  if (!dateStr) return null;

  const [date, time] = dateStr.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  return new Date(y, m - 1, d, hh, mm);
}


function DealCountdown({ endAt }) {
  console.log("⏱️ DealCountdown endAt:", endAt);
  if (!endAt || isNaN(endAt)) return null;

  const [left, setLeft] = useState(endAt - Date.now());


  useEffect(() => {
    const t = setInterval(() => {
      setLeft(endAt - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [endAt]);

  if (left <= 0) return null;

  const h = Math.floor(left / 1000 / 60 / 60);
  const m = Math.floor((left / 1000 / 60) % 60);
  const s = Math.floor((left / 1000) % 60);

  return (
    <div className="
      mt-4
      rounded-xl
      border border-red-300
      bg-gradient-to-r from-red-50 to-orange-50
      px-4 py-3
      shadow-sm
    ">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-red-600 animate-pulse" />
        <p className="text-sm font-bold text-red-700">
          Avantaj Ürünü
        </p>
      </div>

      <div className="mt-1 flex items-center gap-2 text-sm font-mono text-red-600">
        <Clock className="w-4 h-4" />
        <span>
          {h.toString().padStart(2, "0")}:
          {m.toString().padStart(2, "0")}:
          {s.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}


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
  const [weeklyDeal, setWeeklyDeal] = useState(null);
  const hasReloadedRef = useRef(false);
  const [tab, setTab] = useState("desc");
  const [reviews, setReviews] = useState([]);
  

// ⭐ YORUM SAYFALAMA
const [currentPage, setCurrentPage] = useState(1);
const reviewsPerPage = 5;

const indexOfLastReview = currentPage * reviewsPerPage;
const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

const totalPages = Math.ceil(reviews.length / reviewsPerPage);

const touchStartX = useRef(0);
const touchEndX = useRef(0);
  const [related, setRelated] = useState([]);

  const [canRelatedLeft, setCanRelatedLeft] = useState(false);
const [canRelatedRight, setCanRelatedRight] = useState(false);


  const [activeIndex, setActiveIndex] = useState(0);

  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5 });
  const [mainImage, setMainImage] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [crumbs, setCrumbs] = useState([]);
const autoScrollRef = useRef(null);
  const relatedRef = useRef(null);

const scrollLeftRelated = () =>
  relatedRef.current?.scrollBy({ left: -300, behavior: "smooth" });

const scrollRightRelated = () =>
  relatedRef.current?.scrollBy({ left: 300, behavior: "smooth" });

function checkRelatedScroll() {
  const el = relatedRef.current;
  if (!el) return;

  setCanRelatedLeft(el.scrollLeft > 0);
  setCanRelatedRight(
    el.scrollLeft + el.clientWidth < el.scrollWidth - 5
  );
}

  

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

      // ⭐ Haftanın fırsatı kontrolü (product bazlı)
const { data: deal, error: dealErr } = await supabase
  .from("haftanin_firsati")
  .select("*")
  .eq("product_id", data.id)
  .eq("active", true)
  .maybeSingle();


if (deal) {
  console.log("🔥 DEAL RAW:", deal);
  console.log("🧪 end_at:", deal.end_at);
  console.log("🧪 deal_end_at:", deal.deal_end_at);
  console.log("🧪 end_date:", deal.end_date);

  setWeeklyDeal(deal);

  setP((prev) => ({
    ...prev,
    deal_active: true,
    deal_end_at:
      deal.end_at ||
      deal.deal_end_at ||
      deal.end_date ||
      null,
  }));
}





      setLoading(false);

      // ✅ Breadcrumb üret (sub_id -> sub_categories -> main_categories)
(async () => {
  try {
    if (!data?.sub_id) {
      setCrumbs([]);
      return;
    }

    // 1) sub category çek
    const { data: sub, error: subErr } = await supabase
     .from("sub_categories")
.select("id, title, main_id")

      .eq("id", data.sub_id)
      .single();

   


    if (subErr) {
 
      setCrumbs([]);
      return;
    }

    // 2) main category çek
    const { data: main, error: mainErr } = await supabase
     .from("main_categories")
.select("id, title")

      .eq("id", sub.main_id)
      .single();

    if (mainErr) {

     setCrumbs([sub?.title].filter(Boolean));
      return;
    }

  setCrumbs([main?.title, sub?.title].filter(Boolean));
  } catch (e) {
 
    setCrumbs([]);
  }
})();

      // Benzer ürünler yükle
      const { data: relatedProducts } = await supabase
        .from("products")
        .select("*")
        .eq("main_id", data.main_id)
        .neq("id", id)
        .limit(50);

      setRelated(relatedProducts || []);

   


     // Yorumları yükle (ONAYLI + KULLANICININ KENDİ YORUMU)
const { data: comments } = await supabase
  .from("comments")
  .select("*")
  .eq("product_id", id)
 .or(
  session
    ? `approved.eq.true,user_id.eq.${session.user.id}`
    : "approved.eq.true"
)

  .order("created_at", { ascending: false });

setReviews(comments || []);

      // Realtime
      const sub = supabase
        .channel("realtime-comments")
        .on(
  "postgres_changes",
  { event: "UPDATE", schema: "public", table: "comments" },
  (payload) => {
    const c = payload.new;

    if (c.product_id !== id) return;
    if (!c.approved) return;

    setReviews((prev) => {
      if (prev.some((r) => r.id === c.id)) return prev;
      return [c, ...prev];
    });
  }
)


        .subscribe();

      return () => {
        alive = false;
        supabase.removeChannel(sub);
      };
    })();

    return () => (alive = false);
  }, [id]);


  useEffect(() => {
  const handleVisibility = () => {
    if (
      document.visibilityState === "visible" &&
      !hasReloadedRef.current &&
      !p && // ürün hala yoksa
      !loading // zaten yüklenmiyorsa
    ) {
      hasReloadedRef.current = true;
      window.location.reload();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  return () => document.removeEventListener("visibilitychange", handleVisibility);
}, [p, loading]);


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

  // ⏱️ SAYAÇ BİLGİLERİ (ŞART!)
  deal_active: p.deal_active || false,
  deal_end_at: p.deal_end_at || null,
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

  

useEffect(() => {
  if (!related.length) return;

  const t = setTimeout(() => {
    checkRelatedScroll();
  }, 100);

  return () => clearTimeout(t);
}, [related]);



   // -------------------------------
// DEAL / SAYAÇ KONTROLÜ 🔥 (SAFE)
// -------------------------------
const hasProduct = !!p;

const now = Date.now();
const dealEnd =
  hasProduct && p.deal_end_at
    ? parseLocalDate(p.deal_end_at)?.getTime()
    : null;


const isDealActive =
  hasProduct &&
  p.deal_active &&
  dealEnd &&
  now < dealEnd;

// 👉 EN KRİTİK SATIR
const finalPrice = hasProduct
  ? isDealActive
    ? Number(p.price)
    : Number(p.old_price || p.price)
  : 0;

const showDiscount =
  hasProduct &&
  isDealActive &&
  Number(p.old_price || 0) > Number(p.price || 0);

// ✅ Kazanç
const savings = useMemo(() => {
  if (!hasProduct || !isDealActive) return 0;

  const oldP = Number(p.old_price || 0);
  const newP = Number(p.price || 0);
  return oldP > newP ? oldP - newP : 0;
}, [p, isDealActive, hasProduct]);



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
 <div className="min-h-screen bg-white text-gray-900">
  <div className="w-full mx-auto px-4 sm:px-6 md:px-10 pt-4 pb-10">


       <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10">

         {/* GÖRSELLER */}
<div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm lg:sticky lg:top-6 h-fit">

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
className="w-full h-[520px] object-cover rounded-xl bg-white transition-transform duration-300 hover:scale-[1.02]"

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

 {/* --- MOBİL SWIPE SLIDER (scroll YOK, zoom VAR!) --- */}
<div
  className="lg:hidden w-full relative"
  onTouchStart={(e) => {
    touchStartX.current = e.touches[0].clientX;
  }}
  onTouchEnd={(e) => {
    touchEndX.current = e.changedTouches[0].clientX;

    const diff = touchStartX.current - touchEndX.current;

    // Sağdan sola kaydırdı ➜ Sonraki resim
    if (diff > 40) {
      const next = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
      setActiveIndex(next);
      setMainImage(images[next]);
    }

    // Soldan sağa kaydırdı ➜ Önceki resim
    if (diff < -40) {
      const prev = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
      setActiveIndex(prev);
      setMainImage(images[prev]);
    }
  }}
>
  <img
    src={mainImage}
  className="w-full h-[420px] object-cover rounded-xl bg-white"
    style={{ aspectRatio: "3/4" }}
    onClick={() => setZoomOpen(true)}   // ⭐⭐⭐ ZOOM BURADA ÇALIŞIR!
  />
</div>


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
{/* MOBİL DOTS */}
{images.length > 1 && (
  <div className="flex justify-center gap-2 mt-3 lg:hidden">
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
    

          {/* ÜRÜN BİLGİLERİ */}
          <div>
              {/* BREADCRUMB */}
<nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
  <Link to="/" className="inline-flex items-center gap-1 hover:text-gray-800">
    <Home className="w-4 h-4" />
    <span>Ana Sayfa</span>
  </Link>

  {crumbs.map((c, i) => (
    <span key={i} className="inline-flex items-center gap-2">
      <span className="text-gray-300">/</span>

      {/* şimdilik link yok; istersen category sayfan varsa linkleriz */}
      <span className={i === crumbs.length - 1 ? "text-gray-800 font-semibold" : "hover:text-gray-800"}>
        {c}
      </span>
    </span>
  ))}
</nav>
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

           {/* STOK */}
<div className="mt-3">
  {Number(p.stock) <= 0 ? (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-bold
      text-red-600
      bg-red-50
      px-2 py-[2px]
      rounded-md
      border border-red-200
    ">
      Tükendi
    </span>
  ) : Number(p.stock) < 10 ? (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-semibold
      text-orange-700
      bg-orange-50
      px-2 py-[2px]
      rounded-md
      border border-orange-200
    ">
      <Hourglass className="w-3.5 h-3.5 animate-hourglass" />
      Son Adetler
    </span>
  ) : (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-medium
      text-emerald-700
      bg-emerald-50
      px-2 py-[2px]
      rounded-md
      border border-emerald-200
    ">
      Stokta
    </span>
  )}
</div>


            {/* FİYAT */}
         <div className="mt-6 flex items-center gap-3">
  {showDiscount && (
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
    {TRY(finalPrice)}
  </span>
</div>


          {/* ⏱️ KAMPANYA SAYAÇ (ÜRÜN + HAFTANIN FIRSATI) */}
{(() => {
  let endAt = null;

  // ürün kampanyası
 if (p?.deal_active && p?.deal_end_at) {
  endAt = parseLocalDate(p.deal_end_at)?.getTime();
}


  // haftanın fırsatı
  if (!endAt && weeklyDeal) {
    const raw =
      weeklyDeal.end_at ||
      weeklyDeal.deal_end_at ||
      weeklyDeal.end_date;
if (raw) endAt = parseLocalDate(raw)?.getTime();
  }

  return endAt ? <DealCountdown endAt={endAt} /> : null;
})()}


                        {/* ✅ KAZANCIN (sadece indirim varsa) */}
            {savings > 0 && (
             <div className="mt-2 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
  Avantajın: {TRY(savings)}
</div>

            )}


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
               onClick={async () => {
  const existed = await addToCart({
  ...p,
  price: finalPrice,   // 🔥 GERÇEK FİYAT
  selectedColor,
  image_url: p.main_img || p.gallery?.[0],
});


  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: existed
        ? { type: "info", text: "Ürün adedi artırıldı!" }
        : { type: "success", text: "Sepete eklendi!" },
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
  price: finalPrice,
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

             {!r.approved && r.user_id === session?.user?.id && (
  <div className="
    inline-flex items-center gap-1.5
    text-[11px] font-semibold
    text-orange-600
    bg-orange-50
    border border-orange-200
    px-2 py-1
    rounded-lg
  ">
    <ShieldAlert className="w-3.5 h-3.5" />
    Onay bekliyor
  </div>
)}


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
    name: displayName,
    text: newReview.text,
    rating: newReview.rating,
   approved: false, // 🔥 NET
  },
]);


  if (!error) {
 const newItem = {
  id: Date.now(), // geçici
  product_id: id,
  user_id: session.user.id,     // 🔥 ŞART
  name: displayName,
  text: newReview.text,
  rating: newReview.rating,
  approved: false,              // 🔥 ŞART
  created_at: new Date().toISOString(),
};


  setReviews((prev) => [newItem, ...prev]);

  setNewReview({ name: "", text: "", rating: 5 });

  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: { type: "success", text: "Yorum eklendi!" },
    })
  );
}




  // ⭐⭐⭐ ÜRÜN PUANINI GÜNCELLE
const { data: ratings } = await supabase
  .from("comments")
  .select("rating")
  .eq("product_id", id)
 .eq("approved", true);


if (ratings && ratings.length > 0) {
  const total = ratings.reduce((sum, r) => sum + r.rating, 0);
  const avg = total / ratings.length;

  await supabase
    .from("products")
    .update({
      rating_avg: Number(avg.toFixed(1)),
      rating_count: ratings.length,
    })
    .eq("id", id);
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

  {canRelatedLeft && (
    <button
      onClick={() => {
        scrollLeftRelated();
        setTimeout(checkRelatedScroll, 200);
      }}
      className="
        absolute left-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300 shadow
        flex items-center justify-center hover:bg-gray-100 transition z-20
      "
    >
      <ChevronLeft className="w-5 h-5 text-gray-700" />
    </button>
  )}

  {canRelatedRight && (
    <button
      onClick={() => {
        scrollRightRelated();
        setTimeout(checkRelatedScroll, 200);
      }}
      className="
        absolute right-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300 shadow
        flex items-center justify-center hover:bg-gray-100 transition z-20
      "
    >
      <ChevronRight className="w-5 h-5 text-gray-700" />
    </button>
  )}

</div>


    {/* SCROLL ALANI — TEK DIV!!! */}
  <div
  ref={relatedRef}
  onScroll={checkRelatedScroll}
  className="flex gap-4 overflow-x-auto no-scrollbar px-2 pb-4 scroll-smooth"
>

   {related.map((item) => (
  <div key={item.id} className="flex-shrink-0 w-[160px] sm:w-[200px]">
    <ProductCardVertical
      p={item}
      hideCartButton={true}   // 🔥 DETAYDAYIZ, SEPET BUTONU OLMASIN
    />
  </div>
))}

    </div>

    <p className="text-center text-gray-400 text-sm mt-2 md:hidden animate-pulse">
  Kaydır →
</p>

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
