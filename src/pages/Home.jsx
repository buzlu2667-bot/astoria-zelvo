import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";
import ProductCardVertical from "../components/ProductCardVertical";

import {
  Flame,
  Sparkles,
  Star,
  Gift,
  TrendingUp,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  FlameKindling,
  ChevronDown,
   PawPrint,
     Handbag
} from "lucide-react";

const ICONS = {
  Flame: <Flame className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Gift: <Gift className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Bag: <ShoppingBag className="w-6 h-6" />,   // ⭐ BURA DÜZELDİ
};




const SLIDER_HEIGHT = "70vh";

export default function Home() {

 const navigate = useNavigate();
 const [newProducts, setNew] = useState([]);
  const [popularProducts, setPopular] = useState([]);
const [activeIndex, setActiveIndex] = useState(0);
const [homeCats, setHomeCats] = useState([]);
const [pageLoading, setPageLoading] = useState(true);
  // ⭐ Haftanın Fırsatı
const [deals, setDeals] = useState([]);

async function loadDeals() {
  const { data, error } = await supabase
    .from("haftanin_firsati")
    .select("*, products(*)")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) console.error("LOAD DEALS ERROR:", error);
  setDeals(data || []);
}




useEffect(() => {
  Promise.all([
    loadDeals(),
    loadCampaignsFull(),
    loadData(),
  ]).finally(() => setPageLoading(false));
}, []);




// ⭐ TRENDYOL Çok Ürünlü Kampanya
const [campaignsFull, setCampaignsFull] = useState([]);

async function loadCampaignsFull() {
  const { data: cams } = await supabase
    .from("home_campaigns")
    .select("*")
    .eq("active", true)
    .order("sort_index", { ascending: true });

  const final = [];

  for (const c of cams) {
   const { data: items } = await supabase
  .from("home_campaign_products")
  .select("*, products(*)")
  .eq("campaign_id", c.id)
  .order("id", { ascending: false });
      

    final.push({
      ...c,
      items: items || [],
    });
  }

  setCampaignsFull(final);
}

useEffect(() => {
  loadCampaignsFull();
}, []);


  
  const [featuredProducts, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [recent, setRecent] = useState([]);
  const [suggested, setSuggested] = useState([]);

const [openCat, setOpenCat] = useState(null);



const campaignRef = useRef(null);
const campaignLeft = () =>
  campaignRef.current?.scrollBy({ left: -350, behavior: "smooth" });
const campaignRight = () =>
  campaignRef.current?.scrollBy({ left: 350, behavior: "smooth" });


   const recentRef = useRef(null);
  const recentLeft = () => recentRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const recentRight = () => recentRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  const suggestedRef = useRef(null);
  const suggestedLeft = () => suggestedRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const suggestedRight = () => suggestedRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  async function loadData() {
    setLoading(true);

    try {
      const { data: all, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNew(all.filter((x) => x.is_new));
      setPopular(all.filter((x) => x.is_popular));
      setFeatured(all.filter((x) => x.is_featured));
      setSuggested(all.filter((x) => x.is_suggested));

    } catch (err) {
      console.error("LOAD DATA ERROR:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
  const viewed = JSON.parse(localStorage.getItem("recent_views") || "[]");
  setRecent(viewed);
}, []);



  function chooseSlideImage(s) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratio = w / h;

    const isMobile = w < 768;
    const isTablet = w >= 768 && w <= 1366 && ratio > 0.72 && ratio < 1.45;

    if (isMobile) return s.mobile;
    if (isTablet) return s.tablet;
    return s.desktop;
  }

  useEffect(() => {
  async function loadHomeCats() {
    const { data: mains } = await supabase
      .from("main_categories")
      .select("id, title, slug")
      .order("title");

    const { data: subs } = await supabase
      .from("sub_categories")
      .select("id, title, slug, main_id");

    const merged = mains.map((m) => ({
      ...m,
      subs: subs.filter((s) => s.main_id === m.id),
    }));

    setHomeCats(merged);
  }

  loadHomeCats();
}, []);






  const slides = [
    { desktop: "/hero/slide1.jpg", tablet: "/hero/slide1-tablet.jpg", mobile: "/hero/slide1-mobil.jpg", url: "/category/kadın/canta" },
    { desktop: "/hero/slide2.jpg", tablet: "/hero/slide2-tablet.jpg", mobile: "/hero/slide2-mobil.jpg", url: "/dashboard" },
    { desktop: "/hero/slide3.jpg", tablet: "/hero/slide3-tablet.jpg", mobile: "/hero/slide3-mobil.jpg", url: null },
    { desktop: "/hero/slide4.jpg", tablet: "/hero/slide4-tablet.jpg", mobile: "/hero/slide4-mobil.jpg", url: "/category/petshop" },
    { desktop: "/hero/slide5.jpg", tablet: "/hero/slide5-tablet.jpg", mobile: "/hero/slide5-mobil.jpg", url: "/category/kadın/canta" },
    { desktop: "/hero/slide6.jpg", tablet: "/hero/slide6-tablet.jpg", mobile: "/hero/slide6-mobil.jpg", url: "/category/petshop/mama" },
 
  ];

  
const activeCat = homeCats.find((c) => c.slug === openCat);

  return (
    <div className="min-h-screen bg-white text-gray-900">
{/* ⭐ HOME KATEGORİ BAR — MODERN FINAL */}
<div className="w-full px-6 py-1 bg-white border-b border-gray-200 mt-3">

  {/* ÜST KATEGORİLER */}
 <div
  className="
    flex gap-3
    overflow-x-auto
    whitespace-nowrap
    no-scrollbar
    sm:overflow-visible
  "
>


   {/* ================= Kadın Aksesuar ================= */}
<button
  onClick={() => setOpenCat(openCat === "Katagoriler" ? null : "Katagoriler")}
  className={`
    group relative
    inline-flex items-center gap-2
    h-11 px-4
    rounded-2xl
    text-[13px] font-semibold
    transition-all duration-200
    ${
      openCat === "Katagoriler"
        ? "bg-gray-900 text-white shadow-[0_12px_30px_-16px_rgba(0,0,0,0.6)]"
        : "bg-white text-gray-900 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_30px_-16px_rgba(0,0,0,0.45)]"
    }
    border border-gray-200/70
  `}
>
  {/* sol mini accent */}
  <span
    className={`
      h-7 w-[3px] rounded-full
      ${openCat === "Katagoriler" ? "bg-orange-400" : "bg-gray-200 group-hover:bg-gray-300"}
    `}
  />

  <span
  className={`
    grid place-items-center
    w-7 h-7 rounded-xl
    transition
    ${openCat === "Katagoriler"
      ? "bg-white/10 text-white"
      : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"}
  `}
>
  <Handbag className="w-4 h-4" />
</span>


  <span className="leading-none">Kadın Aksesuar</span>

  {/* ok */}
  <ChevronDown
    className={`
      w-4 h-4 ml-1 transition
      ${openCat === "Katagoriler" ? "rotate-180 text-white" : "text-gray-500 group-hover:text-gray-800"}
    `}
  />

  {/* active ring */}
  {openCat === "Katagoriler" && (
    <span className="absolute inset-0 rounded-2xl ring-1 ring-white/20 pointer-events-none" />
  )}
</button>





    {/* ================= Petshop ================= */}
   <button
  onClick={() => setOpenCat(openCat === "petshop" ? null : "petshop")}
  className={`
    group relative
    inline-flex items-center gap-2
    h-11 px-4
    rounded-2xl
    text-[13px] font-semibold
    transition-all duration-200
    ${
      openCat === "petshop"
        ? "bg-gray-900 text-white shadow-[0_12px_30px_-16px_rgba(0,0,0,0.6)]"
        : "bg-white text-gray-900 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_30px_-16px_rgba(0,0,0,0.45)]"
    }
    border border-gray-200/70
  `}
>
  <span
    className={`
      h-7 w-[3px] rounded-full
      ${openCat === "petshop" ? "bg-orange-400" : "bg-gray-200 group-hover:bg-gray-300"}
    `}
  />

  <span
  className={`
    grid place-items-center
    w-7 h-7 rounded-xl
    transition
    ${openCat === "petshop"
      ? "bg-white/10 text-white"
      : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"}
  `}
>
  <PawPrint className="w-4 h-4" />
</span>


  <span className="leading-none">Petshop</span>

  <ChevronDown
    className={`
      w-4 h-4 ml-1 transition
      ${openCat === "petshop" ? "rotate-180 text-white" : "text-gray-500 group-hover:text-gray-800"}
    `}
  />

  {openCat === "petshop" && (
    <span className="absolute inset-0 rounded-2xl ring-1 ring-white/20 pointer-events-none" />
  )}
</button>

  </div>

  {/* ⬇️ ALT KATEGORİLER — MODERN LİSTE */}
 {openCat && activeCat && (
  <>
    {/* BACKDROP */}
    <div
      onClick={() => setOpenCat(null)}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md backdrop-saturate-150"
    />

    {/* MODAL */}
    <div className="fixed top-[120px] left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl">
      <div
        className="
          relative
          bg-white/90 backdrop-blur-xl
          rounded-3xl
          shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]
          border border-white/40
          p-6
        "
      >
        {/* GLOW */}
        <div
          className="
            pointer-events-none absolute inset-0 rounded-3xl
            bg-[radial-gradient(600px_circle_at_20%_0%,rgba(249,115,22,0.25),transparent_60%)]
          "
        />

        <div className="relative">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-500">Kategori</p>
              <h3 className="text-xl font-bold text-gray-900">
                {activeCat.title}
              </h3>
            </div>

            <button
              onClick={() => setOpenCat(null)}
              className="
                w-9 h-9 rounded-full border border-gray-200
                flex items-center justify-center
                hover:bg-gray-100 transition
              "
            >
              ✕
            </button>
          </div>

          {/* ALT KATEGORİLER */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {activeCat.subs.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setOpenCat(null);
                  navigate(`/category/${activeCat.slug}/${s.slug}`);
                }}
                className="
                  group relative w-full text-left
                  px-4 py-3 rounded-2xl
                  bg-white/70 border border-gray-200
                  hover:border-black
                  hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)]
                  transition-all duration-200
                  flex items-center justify-between
                "
              >
                <span className="text-sm font-semibold text-gray-900">
                  {s.title}
                </span>

                <ChevronRight
                  className="
                    w-4 h-4 text-gray-400
                    group-hover:text-black
                    group-hover:translate-x-0.5
                    transition
                  "
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
)}

</div>

      {/* 🚨 SLIDER BLOĞUNA DOKUNMADIM — 1 satır bile değişmedi */}
      <section
        className="w-full relative"
        style={{ height: SLIDER_HEIGHT }}
      >
        <Swiper
  modules={[Autoplay]}
  autoplay={{ delay: 3500 }}
  loop={true}
  onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
  className="w-full h-full"
>

          {slides.map((s, i) => (
            <SwiperSlide key={i}>
              <div
                onClick={() => s.url && navigate(s.url)}
                className="w-full h-full cursor-pointer"
              >
                <img
                  src={chooseSlideImage(s)}
                  className="w-full h-full object-cover rounded-b-2xl shadow-xl"
                  draggable="false"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

          {/* ⭐ CUSTOM DOTS */}
<div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
    {slides.map((_, i) => (
      <div
        key={i}
        className={`
          h-2 rounded-full transition-all 
          ${i === activeIndex ? "w-6 bg-black" : "w-2 bg-gray-300"}
        `}
      />
    ))}
  </div>
      </section>

      {/* ⭐ Slider alt yazı — sade */}
      <div className="w-full text-center mt-3">
        <h1 className="text-xl font-semibold text-gray-800">
          1500 TL üzeri kargo bedava
        </h1>
      </div>

      {/* ⭐ Alt bölüm artık beyaz sade */}
      <div className="bg-white pt-10 pb-20">
        <SectionSwitch

          featured={featuredProducts}
          popular={popularProducts}
          newest={newProducts}
          loading={loading}
        />
      </div>

      {/* ⭐ HAFTANIN FIRSATI ALANI */}
{deals.length > 0 && (
  <div className="max-w-7xl mx-auto px-4 mt-12">
    <h2 className="text-2xl font-bold mb-4 text-red-600 flex items-center gap-2">
      <FlameKindling className="w-6 h-6 text-red-600" />
      Haftanın Fırsatları
    </h2>

    <div className="space-y-6">
      {deals.map((deal) => (
        <div
          key={deal.id}
          onClick={() => navigate(`/product/${deal.products.id}`)}
        className="cursor-pointer bg-white shadow-lg rounded-xl flex flex-col sm:flex-row overflow-hidden hover:shadow-xl transition sm:min-h-[340px]"

        >
        <img
  src={deal.products.main_img}
  className="w-full sm:w-1/3 h-80 sm:h-full object-cover object-center"
 />


          <div className="p-5 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-gray-900">
              {deal.products.title}
            </h3>

            <p className="text-gray-600 mt-2">{deal.note}</p>

            <div className="mt-4">
              <span className="text-gray-400 line-through text-lg">
                {(deal.products.old_price || 0).toLocaleString("tr-TR")} ₺
              </span>

              <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                %{deal.discount_percent} İndirim
              </span>
            </div>

            <p className="text-orange-500 font-bold text-2xl mt-2">
              {(deal.products.price || 0).toLocaleString("tr-TR")} ₺
            </p>

          <div className="mt-6 w-full max-w-md">
  {/* mini güven rozetleri */}
  <div className="grid grid-cols-2 gap-2">
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">🚚 Kargo</p>
      <p className="text-sm font-semibold text-gray-900">1500₺+ Bedava</p>
    </div>

    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">⚡ Gönderim</p>
      <p className="text-sm font-semibold text-gray-900">24 saatte kargoda</p>
    </div>

    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">🔁 Değişim</p>
      <p className="text-sm font-semibold text-gray-900"></p>
    </div>

    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">🔒 Ödeme</p>
      <p className="text-sm font-semibold text-gray-900">Güvenli ödeme</p>
    </div>
  </div>

  {/* kampanya mesajı */}
  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
    <p className="text-sm font-semibold text-red-700">
      🔥 Kampanya ürünü — stoklarla sınırlı
    </p>
    <p className="text-xs text-red-600 mt-1">
      Bu fırsat kaldırılmadan yakala.
    </p>
  </div>

  {/* CTA */}
  <div className="mt-3 flex gap-3">
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/product/${deal.products.id}`);
      }}
      className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
    >
      Ürünü İncele
    </button>

   
  </div>

  {/* mini dipnot */}
  <p className="text-[11px] text-gray-400 mt-2">
    * Fiyat/indirim stok durumuna göre değişebilir.
  </p>
</div>

          </div>
        </div>
      ))}
    </div>
  </div>
)}



{/* ⭐ TRENDYOL TİPİ KAMPANYA BLOKLARI */}
{campaignsFull.length > 0 && (
  <div className="max-w-7xl mx-auto px-4 mt-12 space-y-12">

    {campaignsFull.filter(c => c.active).map((c) => (
      <div key={c.id}>
    <h2
  className="text-2xl font-bold mb-2 flex items-center gap-2"
  style={{ color: c.color || "#000" }}
>
  {/* Modern icon */}
  {ICONS[c.icon] && ICONS[c.icon]}

  {/* ICON bulunamazsa emoji yazma — sadece modern ikon */}
  {c.title}
</h2>


        <p className="text-gray-500 mb-4">{c.sub_title}</p>

        {/* ⭐ OKLU SCROLL BÖLÜMÜ */}
        <div className="relative">

          {/* Sol Ok - Masaüstü */}
          <button
            onClick={campaignLeft}
            className="
              hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
              w-10 h-10 rounded-full bg-white border border-gray-300
              items-center justify-center hover:bg-gray-100 transition z-20
            "
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Sağ Ok - Masaüstü */}
          <button
            onClick={campaignRight}
            className="
              hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
              w-10 h-10 rounded-full bg-white border border-gray-300
              items-center justify-center hover:bg-gray-100 transition z-20
            "
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Kaydırılabilir Alan */}
          <div
            ref={campaignRef}
            className="
              flex gap-4 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar
              pb-4
            "
          >
           {c.items.map((item) => (
  <div
  key={item.id}
  className="
    shrink-0
    w-[160px]        /* 📱 mobil = ince uzun */
    sm:w-[240px]     /* 🖥️ pc */
  "
>
  <ProductCardVertical p={item.products} />
</div>

))}

          </div>
        </div>
      </div>
    ))}

  </div>
)}



   {/* ⭐ SON İNCELENENLER — OKLU FINAL */}
{recent.length > 0 && (
  <div className="max-w-7xl mx-auto px-4 mt-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      Son İnceledikleriniz
    </h2>

    <div className="relative">

      {/* Sol ok */}
      <button
        onClick={recentLeft}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300
        items-center justify-center hover:bg-gray-100 transition z-20"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Sağ ok */}
      <button
        onClick={recentRight}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300
        items-center justify-center hover:bg-gray-100 transition z-20"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* Kaydırılabilir alan */}
      <div
        ref={recentRef}
        className="flex gap-4 pb-4 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
      >
      {recent.map((item) => (
 <div
  key={item.id}
  className="
    shrink-0
    w-[160px]        /* 📱 mobil = ince uzun */
    sm:w-[240px]     /* 🖥️ pc = kategori kartı */
  "
>
  <ProductCardVertical p={item} />
</div>

))}

      </div>
    </div>
  </div>
)}



{/* ⭐ İLGİNİZİ ÇEKEBİLİR — OKLU FINAL */}
{suggested.length > 0 && (
  <div className="max-w-7xl mx-auto px-4 mt-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      İlginizi Çekebilir
    </h2>

    <div className="relative">

      {/* Sol ok */}
      <button
        onClick={suggestedLeft}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300
        items-center justify-center hover:bg-gray-100 transition z-20"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Sağ ok */}
      <button
        onClick={suggestedRight}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300
        items-center justify-center hover:bg-gray-100 transition z-20"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* Kaydırılabilir alan */}
      <div
        ref={suggestedRef}
        className="flex gap-4 pb-4 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
      >
       {suggested.map((item) => (
  <div
  key={item.id}
  className="
    shrink-0
    w-[160px]        /* 📱 mobil = ince uzun */
    sm:w-[240px]     /* 🖥️ pc */
  "
>
  <ProductCardVertical p={item} />
</div>

))}

      </div>

    </div>
  </div>
)}


  </div>
  );
}

/* ----------------------------- SECTION SWITCH ----------------------------- */

function SectionSwitch({ featured, popular, newest, loading }) {

  
  const [tab, setTab] = useState("featured");
  const products = tab === "featured" ? featured : tab === "popular" ? popular : newest;
  const sliderRef = useRef(null);

  useEffect(() => {
    sliderRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [tab]);

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  const tabs = [
    { key: "featured", label: "Öne Çıkan", icon: <Star className="w-4 h-4" /> },
    { key: "popular", label: "Popüler", icon: <Flame className="w-4 h-4" /> },
    { key: "newest", label: "Yeni Gelenler", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4">

      {/* ⭐ Sekmeler — sade */}
      <div className="flex gap-3 mb-8 justify-center">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border transition
              ${
                tab === t.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }
            `}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ⭐ Ürünler */}
      {loading ? (
        <p className="text-gray-500 text-center">Yükleniyor...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center">Henüz ürün yok.</p>
      ) : (
        <div className="relative">

          {/* Oklar */}
          <button
            onClick={scrollLeft}
            className="
              hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
              w-10 h-10 rounded-full bg-white border border-gray-300
              items-center justify-center hover:bg-gray-100 transition z-20
            "
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={scrollRight}
            className="
              hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
              w-10 h-10 rounded-full bg-white border border-gray-300
              items-center justify-center hover:bg-gray-100 transition z-20
            "
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* ⭐ Kartlar */}
          <div
            ref={sliderRef}
            className="flex gap-4 pb-4 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
          >
            {products.map((p) => (
              <div
                key={p.id}
                className="shrink-0 min-w-[65vw] max-w-[300px] sm:min-w-[250px]"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          {/* ⭐ Mobil kaydırma bilgisi */}
<p className="text-center text-gray-400 text-sm mt-2 md:hidden animate-pulse">
  Kaydır →
</p>

        </div>
      )}
    </section>
  );
}
