import { useEffect, useState, useRef } from "react";
import ReviewsSlider from "../components/ReviewsSlider";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";
import ProductCardVertical from "../components/ProductCardVertical";
import { Clock } from "lucide-react";
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
  Handbag,
  Mountain,
  Truck,
  ShieldCheck,
  RefreshCcw,
  MessageCircle,
  Send,
  CreditCard
} from "lucide-react";






function parseLocalDate(dateStr) {
  if (!dateStr) return null;

  const [date, time] = dateStr.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  return new Date(y, m - 1, d, hh, mm);
}


function DealCountdown({ endAt }) {
  const end = typeof endAt === "string"
    ? parseLocalDate(endAt).getTime()
    : endAt;

  const [left, setLeft] = useState(end - Date.now());


 useEffect(() => {
  const t = setInterval(() => {
    setLeft(end - Date.now());
  }, 1000);
  return () => clearInterval(t);
}, [end]);


  // ⛔ Kampanya bitti
if (left <= 0) {
  return (
    <div
      className="
        mt-3
        flex items-center gap-2
        rounded-2xl
        border border-gray-700/40
        bg-gradient-to-r from-gray-900/90 to-gray-800/90
        px-4 py-3
        backdrop-blur-md
        shadow-md
      "
    >
      <Clock className="w-4 h-4 text-red-400" />
      <p className="text-sm font-semibold text-white">
        Fırsat Sona Erdi
      </p>
    </div>
  );
}


  const h = Math.floor(left / 1000 / 60 / 60);
  const m = Math.floor((left / 1000 / 60) % 60);
  const s = Math.floor((left / 1000) % 60);

  return (
    <div
      className="
        mt-3
        rounded-xl
        border border-red-300
        bg-gradient-to-r from-red-50 to-orange-50
        px-4 py-3
        shadow-sm
      "
    >
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



const ICONS = {
  Flame: <Flame className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Gift: <Gift className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Bag: <ShoppingBag className="w-6 h-6" />,   // ⭐ BURA DÜZELDİ
};




const SLIDER_HEIGHT = "70vh";
// slıder altı bılgılendırme watsap telegram //

function MiniTrustBar() {
  const items = [
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Güvenli Ödeme",
    },

    {
  icon: <CreditCard className="w-5 h-5" />,
  title: "Kredi & Banka Kartı ile Ödeme",
},

    {
      icon: <Truck className="w-5 h-5" />,
      title: "Hızlı Kargo",
    },
    {
      icon: <RefreshCcw className="w-5 h-5" />,
      title: "Kolay İade",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "WhatsApp Destek",
      link: "https://wa.me/905384657526", // numarayı yaz
    },
    {
      icon: <Send className="w-5 h-5" />,
      title: "Telegram Ürünler",
      link: "https://t.me/maximoraofficial", // kanal/user
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div
        className="
          grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3
          bg-gray-50
          border border-gray-200
          rounded-2xl
          p-4
        "
      >
        {items.map((i, idx) => {
          const Box = i.link ? "a" : "div";
          return (
            <Box
              key={idx}
              href={i.link}
              target={i.link ? "_blank" : undefined}
              className="
                flex items-center gap-3
                px-4 py-3
                rounded-xl
                bg-white
                border border-gray-200
                hover:border-black
                hover:shadow-sm
                transition
                text-sm font-semibold text-gray-800
              "
            >
              <span className="text-black">{i.icon}</span>
              <span>{i.title}</span>
            </Box>
          );
        })}
      </div>
    </section>
  );
}

// ⭐ SATIŞ ALGISI BLOĞU
function SoldHighlightsSlider() {
  const items = [
    {
      icon: <Flame className="w-6 h-6" />,
      title: "Termos & Kupalar",
      desc: "Gün boyu sıcak tutan favoriler",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: "Kadın Çantaları",
      desc: "En çok tercih edilen modeller",
      color: "from-pink-400 to-fuchsia-500",
    },
    {
      icon: <PawPrint className="w-6 h-6" />,
      title: "Pet Ürünleri",
      desc: "Pati dostlarımız için",
      color: "from-emerald-400 to-teal-500",
    },
    {
      icon: <Mountain className="w-6 h-6" />,
      title: "Outdoor Ürünler",
      desc: "Kamp & doğa severler seçti",
      color: "from-sky-400 to-indigo-500",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <h3 className="text-xl font-extrabold text-gray-900 mb-6 text-center">
        En Çok Tercih Edilenler
      </h3>

      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 2800, disableOnInteraction: false }}
        loop
        spaceBetween={16}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {items.map((i, idx) => (
          <SwiperSlide key={idx}>
            <div
              className={`
                h-full
                rounded-2xl p-5 text-white
                bg-gradient-to-br ${i.color}
                shadow-lg
              `}
            >
              <div className="mb-3">{i.icon}</div>
              <h4 className="font-bold text-sm">{i.title}</h4>
              <p className="text-xs opacity-90 mt-1">{i.desc}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}




export default function Home() {


 

  // ⭐ Campaign akıllı ok state
const [canCampaignLeft, setCanCampaignLeft] = useState(false);
const [canCampaignRight, setCanCampaignRight] = useState(false);
// ⭐ Recent (Son İncelenenler) akıllı ok state
const [canRecentLeft, setCanRecentLeft] = useState(false);
const [canRecentRight, setCanRecentRight] = useState(false);
// ⭐ Suggested (İlginizi Çekebilir) akıllı ok state
const [canSuggestedLeft, setCanSuggestedLeft] = useState(false);
const [canSuggestedRight, setCanSuggestedRight] = useState(false);

  // ⏱️ ZAMAN TİCK — sayaç bittiğinde render tetiklemek için
const [tick, setTick] = useState(Date.now());

useEffect(() => {
  const t = setInterval(() => {
    setTick(Date.now());
  }, 1000);
  return () => clearInterval(t);
}, []);


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
    .limit(10);

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

useEffect(() => {
  checkCampaignScroll();
}, [campaignsFull]);



  
  const [featuredProducts, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [recent, setRecent] = useState([]);
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
  checkSuggestedScroll();
}, [suggested]);

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

useEffect(() => {
  checkRecentScroll();
}, [recent]);


function checkCampaignScroll() {
  const el = campaignRef.current;
  if (!el) return;

  setCanCampaignLeft(el.scrollLeft > 0);
  setCanCampaignRight(
    el.scrollLeft + el.clientWidth < el.scrollWidth - 5
  );
}
function checkRecentScroll() {
  const el = recentRef.current;
  if (!el) return;

  setCanRecentLeft(el.scrollLeft > 0);
  setCanRecentRight(
    el.scrollLeft + el.clientWidth < el.scrollWidth - 5
  );
}

function checkSuggestedScroll() {
  const el = suggestedRef.current;
  if (!el) return;

  setCanSuggestedLeft(el.scrollLeft > 0);
  setCanSuggestedRight(
    el.scrollLeft + el.clientWidth < el.scrollWidth - 5
  );
}


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
    { desktop: "/hero/slide1.jpg", tablet: "/hero/slide1-tablet.jpg", mobile: "/hero/slide1-mobil.jpg", url: "/category/kadin/canta" },
    { desktop: "/hero/slide2.jpg", tablet: "/hero/slide2-tablet.jpg", mobile: "/hero/slide2-mobil.jpg", url: "/dashboard" },
    { desktop: "/hero/slide3.jpg", tablet: "/hero/slide3-tablet.jpg", mobile: "/hero/slide3-mobil.jpg", url: null },
    { desktop: "/hero/slide4.jpg", tablet: "/hero/slide4-tablet.jpg", mobile: "/hero/slide4-mobil.jpg", url: "/category/petshop" },
    { desktop: "/hero/slide5.jpg", tablet: "/hero/slide5-tablet.jpg", mobile: "/hero/slide5-mobil.jpg", url: "/category/kadin/canta" },
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
  onClick={() => setOpenCat(openCat === "kadin" ? null : "kadin")}
  className={`
    group relative
    inline-flex items-center gap-2
    h-11 px-4
    rounded-2xl
    text-[13px] font-semibold
    transition-all duration-200
    ${
      openCat === "kadin"
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
      ${openCat === "kadin" ? "bg-orange-400" : "bg-gray-200 group-hover:bg-gray-300"}
    `}
  />

  <span
  className={`
    grid place-items-center
    w-7 h-7 rounded-xl
    transition
    ${openCat === "kadin"
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
      ${openCat === "kadin" ? "rotate-180 text-white" : "text-gray-500 group-hover:text-gray-800"}
    `}
  />

  {/* active ring */}
  {openCat === "kadin" && (
    <span className="absolute inset-0 rounded-2xl ring-1 ring-white/20 pointer-events-none" />
  )}
</button>


  {/* =================Erkek Aksesuar ================= */}
<button
  onClick={() => setOpenCat(openCat === "Erkek" ? null : "Erkek")}
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
      ${openCat === "Erkek" ? "bg-orange-400" : "bg-gray-200 group-hover:bg-gray-300"}
    `}
  />

  <span
  className={`
    grid place-items-center
    w-7 h-7 rounded-xl
    transition
    ${openCat === "Erkek"
      ? "bg-white/10 text-white"
      : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"}
  `}
>
  <Handbag className="w-4 h-4" />
</span>


  <span className="leading-none">Erkek Aksesuar</span>

  {/* ok */}
  <ChevronDown
    className={`
      w-4 h-4 ml-1 transition
      ${openCat === "Erkek" ? "rotate-180 text-white" : "text-gray-500 group-hover:text-gray-800"}
    `}
  />

  {/* active ring */}
  {openCat === "Erkek" && (
    <span className="absolute inset-0 rounded-2xl ring-1 ring-white/20 pointer-events-none" />
  )}
</button>


   {/* =================outdoor Aksesuar ================= */}
<button
  onClick={() => setOpenCat(openCat === "outdoor" ? null : "outdoor")}
  className={`
    group relative
    inline-flex items-center gap-2
    h-11 px-4
    rounded-2xl
    text-[13px] font-semibold
    transition-all duration-200
    ${
      openCat === "outdoor"
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
      ${openCat === "outdoor" ? "bg-orange-400" : "bg-gray-200 group-hover:bg-gray-300"}
    `}
  />

  <span
  className={`
    grid place-items-center
    w-7 h-7 rounded-xl
    transition
    ${openCat === "outdoor"
      ? "bg-white/10 text-white"
      : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"}
  `}
>
  <Mountain className="w-4 h-4" />
</span>


  <span className="leading-none">Outdoor</span>

  {/* ok */}
  <ChevronDown
    className={`
      w-4 h-4 ml-1 transition
      ${openCat === "outdoor" ? "rotate-180 text-white" : "text-gray-500 group-hover:text-gray-800"}
    `}
  />

  {/* active ring */}
  {openCat === "outdoor" && (
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
<div className="w-full flex justify-center mt-3">
  <div
    className="
      inline-flex items-center gap-2
      px-4 py-2
      rounded-full
      bg-emerald-50
      border border-emerald-200
      text-emerald-800
    "
  >
    <Truck className="w-4 h-4 text-emerald-600" />

    <span className="text-sm font-semibold">
      1500 TL üzeri
    </span>

    <span className="text-sm">
      ücretsiz kargo
    </span>
  </div>
  

</div>

<MiniTrustBar />
<SoldHighlightsSlider />
<ReviewsSlider />

      {/* ⭐ Alt bölüm artık beyaz sade */}
      <div className="bg-white pt-10 pb-20">
        <SectionSwitch

          featured={featuredProducts}
          popular={popularProducts}
          newest={newProducts}
          loading={loading}
        />
      </div>

  {/* ⭐ HAFTANIN FIRSATLARI */}
{deals.length > 0 && (
  <div className="max-w-7xl mx-auto px-4 mt-16">
    
    {/* 🔥 BAŞLIK */}
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
        <FlameKindling className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">
          Haftanın Fırsatları
        </h2>
        <p className="text-sm text-gray-500">
          Sınırlı süre · Özel avantajlar
        </p>
      </div>
    </div>

    <div className="space-y-8">
      {deals.map((deal) => {
        const product = deal.products;
        if (!product) return null;

        return (
          <div
            key={deal.id}
            className="
              relative
              group
              rounded-3xl
              overflow-hidden
              bg-white
              border border-gray-200
              shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]
              hover:shadow-[0_30px_80px_-25px_rgba(0,0,0,0.35)]
              transition-all duration-300
            "
          >
            {/* ✨ GLOW */}
            <div className="
              pointer-events-none
              absolute inset-0
              bg-[radial-gradient(600px_circle_at_20%_0%,rgba(239,68,68,0.18),transparent_60%)]
            " />

            <div className="relative flex flex-col sm:flex-row">
              
              {/* 🔥 SOL – GÖRSEL */}
              <div className="relative sm:w-1/3">
                <img
                  src={product.main_img}
                  alt={product.title}
                  className="
                    w-full
                    h-80 sm:h-full
                    object-cover
                    group-hover:scale-105
                    transition duration-500
                  "
                />

                {/* BADGE */}
                <div className="absolute top-4 left-4">
                  <span className="
                    px-3 py-1
                    text-xs font-bold
                    text-white
                    rounded-full
                    bg-gradient-to-r from-red-500 to-orange-500
                    shadow-md
                  ">
                    ⚡ Avantaj Ürünü
                  </span>
                </div>
              </div>

              {/* 👉 SAĞ – İÇERİK */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 leading-snug">
                    {product.title}
                  </h3>

                  {deal.note && (
                    <p className="text-gray-600 mt-2">
                      {deal.note}
                    </p>
                  )}

                  {/* ✅ FİYAT */}
                  <div className="mt-4">
                   <ProductCard
  product={product}
  deal={deal}
  hideDealCountdown
/>

                  </div>
                </div>

                {/* ⏱️ SAYAÇ */}
                {deal.end_at && (
                  <div className="mt-4">
                  <DealCountdown
  endAt={deal.end_at}
/>

                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="
                    mt-5
                    h-12
                    rounded-xl
                    font-bold
                    text-white
                    bg-black
                    hover:bg-gray-900
                    transition
                  "
                >
                  Ürünü İncele
                </button>
              </div>
            </div>
          </div>
        );
      })}
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
       {canCampaignLeft && (
  <button
    onClick={() => {
      campaignLeft();
      setTimeout(checkCampaignScroll, 200);
    }}
    className="
      hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20
    "
  >
    <ChevronLeft className="w-5 h-5 text-gray-700" />
  </button>
)}

          {/* Sağ Ok - Masaüstü */}
          {canCampaignRight && (
  <button
    onClick={() => {
      campaignRight();
      setTimeout(checkCampaignScroll, 200);
    }}
    className="
      hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20
    "
  >
    <ChevronRight className="w-5 h-5 text-gray-700" />
  </button>
)}


          {/* Kaydırılabilir Alan */}
         <div
  ref={campaignRef}
  onScroll={checkCampaignScroll}
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
          <p className="text-center text-gray-400 text-sm mt-2 md:hidden animate-pulse">
  Kaydır →
</p>
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
     {canRecentLeft && (
  <button
    onClick={() => {
      recentLeft();
      setTimeout(checkRecentScroll, 200);
    }}
    className="
      hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20
    "
  >
    <ChevronLeft className="w-5 h-5 text-gray-700" />
  </button>
)}


      {/* Sağ ok */}
     {canRecentRight && (
  <button
    onClick={() => {
      recentRight();
      setTimeout(checkRecentScroll, 200);
    }}
    className="
      hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20
    "
  >
    <ChevronRight className="w-5 h-5 text-gray-700" />
  </button>
)}


      {/* Kaydırılabilir alan */}
    <div
  ref={recentRef}
  onScroll={checkRecentScroll}
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
      <p className="text-center text-gray-400 text-sm mt-2 md:hidden animate-pulse">
  Kaydır →
</p>
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
      {canSuggestedLeft && (
  <button
    onClick={() => {
      suggestedLeft();
      setTimeout(checkSuggestedScroll, 200);
    }}
    className="
      hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20
    "
  >
    <ChevronLeft className="w-5 h-5 text-gray-700" />
  </button>
)}


      {/* Sağ ok */}
     {canSuggestedRight && (
  <button
    onClick={() => {
      suggestedRight();
      setTimeout(checkSuggestedScroll, 200);
    }}
    className="
      hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20
    "
  >
    <ChevronRight className="w-5 h-5 text-gray-700" />
  </button>
)}


      {/* Kaydırılabilir alan */}
     <div
  ref={suggestedRef}
  onScroll={checkSuggestedScroll}
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
   {/* ✅ SADECE KARTLAR VARSA */}
      <p className="text-center text-gray-400 text-sm mt-2 md:hidden animate-pulse">
        Kaydır →
      </p>
    </div>
  </div>
)}

  </div>
  );
}



/* ----------------------------- SECTION SWITCH ----------------------------- */

function SectionSwitch({ featured, popular, newest, loading }) {

  const [canLeft, setCanLeft] = useState(false);
const [canRight, setCanRight] = useState(false);

  const [tab, setTab] = useState("featured");
  const products = tab === "featured" ? featured : tab === "popular" ? popular : newest;
  const sliderRef = useRef(null);

 useEffect(() => {
  sliderRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  setTimeout(checkScroll, 50);
}, [tab]);

useEffect(() => {
  if (!sliderRef.current) return;

  // DOM otursun diye minicik gecikme
  const t = setTimeout(() => {
    checkScroll();
  }, 100);

  return () => clearTimeout(t);
}, [products]);


  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  function checkScroll() {
  const el = sliderRef.current;
  if (!el) return;

  setCanLeft(el.scrollLeft > 0);
  setCanRight(
    el.scrollLeft + el.clientWidth < el.scrollWidth - 5
  );
}


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
        {canLeft && (
  <button
    onClick={() => {
      scrollLeft();
      setTimeout(checkScroll, 200);
    }}
    className="
      hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20
    "
  >
    <ChevronLeft className="w-5 h-5 text-gray-700" />
  </button>
)}


          {canRight && (
  <button
    onClick={() => {
      scrollRight();
      setTimeout(checkScroll, 200);
    }}
    className="
      hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20
    "
  >
    <ChevronRight className="w-5 h-5 text-gray-700" />
  </button>
)}


          {/* ⭐ Kartlar */}
        <div
  ref={sliderRef}
  onScroll={checkScroll}
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
