import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";

import {
  Flame,
  Sparkles,
  Star,
  Gift,
  TrendingUp,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  FlameKindling
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
  // ⭐ Haftanın Fırsatı
const [deal, setDeal] = useState(null);

async function loadDeal() {
  const { data } = await supabase
    .from("haftanin_firsati")
    .select("*, products(*)")
    .maybeSingle();

  setDeal(data);
}

useEffect(() => {
  loadDeal();
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
      .eq("campaign_id", c.id);

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
    async function loadCats() {
      const { data } = await supabase
        .from("main_categories")
        .select("*")
        .order("sort_index", { ascending: true });

      setCategories(data || []);
    }
    loadCats();
  }, []);




  const slides = [
    { desktop: "/hero/slide1.jpg", tablet: "/hero/slide1-tablet.jpg", mobile: "/hero/slide1-mobil.jpg", url: "/category/kadın/canta" },
    { desktop: "/hero/slide2.jpg", tablet: "/hero/slide2-tablet.jpg", mobile: "/hero/slide2-mobil.jpg", url: null },
    { desktop: "/hero/slide3.jpg", tablet: "/hero/slide3-tablet.jpg", mobile: "/hero/slide3-mobil.jpg", url: null },
    { desktop: "/hero/slide4.jpg", tablet: "/hero/slide4-tablet.jpg", mobile: "/hero/slide4-mobil.jpg", url: "/category/petshop" },
    { desktop: "/hero/slide5.jpg", tablet: "/hero/slide5-tablet.jpg", mobile: "/hero/slide5-mobil.jpg", url: "/category/kadın/canta" },
    { desktop: "/hero/slide6.jpg", tablet: "/hero/slide6-tablet.jpg", mobile: "/hero/slide6-mobil.jpg", url: "/category/petshop/mama" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ⭐ KATEGORİ BAR — SADE */}
      <div className="
        w-full flex gap-3 px-4 py-3
        bg-white border-b border-gray-200
        overflow-x-auto whitespace-nowrap no-scrollbar
      ">
        <button
          onClick={() => navigate('/category/Katagoriler')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Kadın Aksesuar
        </button>

        <button
          onClick={() => navigate('/category/petshop')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Petshop
        </button>
      </div>

      {/* 🚨 SLIDER BLOĞUNA DOKUNMADIM — 1 satır bile değişmedi */}
      <section
        className="w-full relative"
        style={{ height: SLIDER_HEIGHT }}
      >
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3500 }}
          loop={true}
          pagination={{ clickable: true }}
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
      </section>

      {/* ⭐ Slider alt yazı — sade */}
      <div className="w-full text-center mt-3">
        <h1 className="text-xl font-semibold text-gray-800">
          2500 TL üzeri kargo bedava
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
{deal && deal.active && deal.products && (
  <div className="max-w-7xl mx-auto px-4 mt-12">
  <h2 className="text-2xl font-bold mb-4 text-red-600 flex items-center gap-2">
  <FlameKindling className="w-6 h-6 text-red-600" />
  Haftanın Fırsatı
</h2>


    <div
      onClick={() => navigate(`/product/${deal.products.id}`)}
      className="cursor-pointer bg-white shadow-lg rounded-xl flex flex-col sm:flex-row overflow-hidden hover:shadow-xl transition"
    >
      <img
        src={deal.products.main_img}
        className="w-full sm:w-1/3 h-64 object-cover"
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
      </div>
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
                onClick={() => navigate(`/product/${item.products.id}`)}
                className="
                  shrink-0 min-w-[55%] sm:min-w-[220px] max-w-[260px]
                  bg-white rounded-xl shadow cursor-pointer
                "
              >
                <img
                  src={item.products.main_img}
                  className="w-full h-48 object-cover rounded-t-xl"
                />

                <div className="p-3">
                  <p className="font-semibold text-gray-800 truncate">
                    {item.products.title}
                  </p>

                  {item.products.old_price > item.products.price && (
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-400 line-through text-sm">
                        {item.products.old_price.toLocaleString("tr-TR")} ₺
                      </span>

                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        %{Math.round(
                          ((item.products.old_price - item.products.price) /
                            item.products.old_price) *
                            100
                        )}
                      </span>
                    </div>
                  )}

                  <p className="text-orange-500 font-bold text-lg">
                    {item.products.price.toLocaleString("tr-TR")} ₺
                  </p>
                </div>
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
            className="shrink-0 w-[150px] sm:w-[200px] 
            bg-white border border-gray-200 rounded-xl shadow-sm 
            hover:shadow-md transition cursor-pointer"
            onClick={() => navigate(`/product/${item.id}`)}
          >
            <img
              src={item.main_img}
              className="w-full h-[150px] object-cover rounded-t-xl"
            />

            <div className="p-2">
              <p className="text-sm font-semibold text-gray-700 truncate">
                {item.title}
              </p>

              {item.old_price && item.old_price > item.price && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 line-through text-xs">
                    {item.old_price.toLocaleString("tr-TR")} ₺
                  </span>

                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    %{Math.round(((item.old_price - item.price) / item.old_price) * 100)}
                  </span>
                </div>
              )}

              <p className="text-orange-500 font-bold text-sm mt-1">
                {item.price.toLocaleString("tr-TR")} ₺
              </p>
            </div>
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
            className="shrink-0 w-[150px] sm:w-[200px] bg-white border 
                    border-gray-200 rounded-xl shadow-sm hover:shadow-md 
                    transition cursor-pointer"
            onClick={() => navigate(`/product/${item.id}`)}
          >
            <img
              src={item.main_img}
              className="w-full h-[150px] object-cover rounded-t-xl"
            />

            <div className="p-2">
              <p className="text-sm font-semibold text-gray-700 truncate">
                {item.title}
              </p>

              {/* İndirim etiketi */}
              {item.old_price && item.old_price > item.price && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 line-through text-xs">
                    {item.old_price.toLocaleString("tr-TR")} ₺
                  </span>

                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    %{Math.round(((item.old_price - item.price) / item.old_price) * 100)}
                  </span>
                </div>
              )}

              <p className="text-orange-500 font-bold text-sm mt-1">
                {item.price.toLocaleString("tr-TR")} ₺
              </p>
            </div>
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
