import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Flame, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";


// ⚡ Slider yüksekliği buradan ayarlanabilir
const SLIDER_HEIGHT = "70vh"; 

export default function Home() {
  const navigate = useNavigate();
  const [newProducts, setNew] = useState([]);
  const [popularProducts, setPopular] = useState([]);
  const [featuredProducts, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  

 async function loadData() {
  setLoading(true);



  try {
    // 🔥 Tüm ürünleri tek seferde çekelim
    const { data: all, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 🔥 Filtrelemeleri frontend’de yapıyoruz
    const n = all.filter((x) => x.is_new);
    const p = all.filter((x) => x.is_popular);
    const f = all.filter((x) => x.is_featured);

    setNew(n);
    setPopular(p);
    setFeatured(f);

  } catch (err) {
    console.error("LOAD DATA ERROR:", err);
  }

  setLoading(false);
}


  useEffect(() => {
    loadData();
  }, []);

 


 function chooseSlideImage(s) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = w / h;

  const isMobile = w < 768;

  // 🍏 iPad & tablet (en doğru aralık)
  const isTablet =
    w >= 768 &&
    w <= 1366 &&
    ratio > 0.72 &&
    ratio < 1.45;

  if (isMobile) return s.mobile;
  if (isTablet) return s.tablet;
  return s.desktop;
}



// ⭐ DİNAMİK KATEGORİLER


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
  { 
    desktop: "/hero/slide1.jpg",
    tablet: "/hero/slide1-tablet.jpg",   // 🔥 YENİ
    mobile: "/hero/slide1-mobil.jpg",
    url: "/category/kadın/canta"
  },
  { 
    desktop: "/hero/slide2.jpg",
    tablet: "/hero/slide2-tablet.jpg",
    mobile: "/hero/slide2-mobil.jpg",
    url: null
  },
  { 
    desktop: "/hero/slide3.jpg",
    tablet: "/hero/slide3-tablet.jpg",
    mobile: "/hero/slide3-mobil.jpg",
    url: null
  },
  {
    desktop: "/hero/slide4.jpg",
    tablet: "/hero/slide4-tablet.jpg",
    mobile: "/hero/slide4-mobil.jpg",
  },
  {
    desktop: "/hero/slide5.jpg",
    tablet: "/hero/slide5-tablet.jpg",
    mobile: "/hero/slide5-mobil.jpg",
    url: "/category/kadın/canta",
  },
   {
    desktop: "/hero/slide6.jpg",
    tablet: "/hero/slide6-tablet.jpg",
    mobile: "/hero/slide6-mobil.jpg",
    url: "/category/kadın/canta",
  },
];




  return (
    <div className="min-h-screen text-white">

      

     {/* ⭐ TÜM CİHAZLARDA KAYDIRMALI KATEGORİ BAR */}
<div
  className="
    w-full flex gap-3 px-4 py-2
    bg-black/40 backdrop-blur-md
    border-b border-white/10
    text-xs
    z-[50]
    relative
    overflow-x-auto
    whitespace-nowrap
    no-scrollbar
    cursor-grab
  "
>

  <button
    onClick={() => navigate('/category/Katagoriler')}
    className="px-4 py-1.5 bg-black/60 text-yellow-300 rounded-xl shadow"
  >
    Kadın Aksesuar
  </button>

  <button
    onClick={() => navigate('/category/petshop')}
    className="px-4 py-1.5 bg-black/60 text-yellow-300 rounded-xl shadow"
  >
    Petshop
  </button>

  {/* İstediğin kadar ekleyebilirsin */}
</div>



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
        className={`
          w-full h-full cursor-pointer
        `}
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
{/* ⭐ SLIDER ALTINA NEON YAZI */}
<div className="w-full text-center mt-0 mb-0 relative z-[50]">
  <h1
    className="
      text-xl md:text-2xl font-bold tracking-wide
      bg-gradient-to-r from-[#00ffcc] to-[#00d4ff]
      text-transparent bg-clip-text
      drop-shadow-[0_0_12px_rgba(0,255,200,0.7)]
      animate-pulse
    "
  >
   2500 TL üzeri kargo bedava
  </h1>
</div>

      {/* 🔥 ALT BÖLÜM ARKAPLAN BEYAZ! */}
   <div className="
  backdrop-blur-xl 
  bg-black/20 
  text-white
  rounded-t-[40px]
  mt-[-40px] 
  pt-10 pb-20
  shadow-[0_0_40px_rgba(0,0,0,0.4)]
">


        {/* 🟡 ÖNE ÇIKAN */}
        <SectionWhite
          title=" Öne Çıkan Ürünler"
          products={featuredProducts}
          loading={loading}
        />

        {/* 🔵 POPÜLER */}
        <SectionWhite
          title=" Popüler Ürünler"
          products={popularProducts}
          loading={loading}
        />

        {/* 🟢 YENİ GELENLER */}
        <SectionWhite
          title="Yeni Gelenler"
          products={newProducts}
          loading={loading}
        />

      </div>
    </div>
  );
}


/* ----------------------------- COMPONENT ----------------------------- */

function SectionWhite({ title, products, loading }) {

  // Başlığa göre ikon seç
  const getIcon = () => {
    if (title.includes("Öne")) {
      return (
        <Flame
          className="
            w-7 h-7 text-orange-400 
            drop-shadow-[0_0_10px_rgba(255,150,0,0.8)]
          "
        />
      );
    }

    if (title.includes("Popüler")) {
      return (
        <TrendingUp
          className="
            w-7 h-7 text-blue-400 
            drop-shadow-[0_0_10px_rgba(0,120,255,0.8)]
          "
        />
      );
    }

    if (title.includes("Yeni")) {
      return (
        <Sparkles
          className="
            w-7 h-7 text-green-400 
            drop-shadow-[0_0_10px_rgba(0,255,150,0.8)]
          "
        />
      );
    }

    return null;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">

      {/* Başlık */}
      <div className="flex items-center gap-3 mb-8">
        {getIcon()}
        <h2
          className="
            text-3xl font-extrabold
            bg-gradient-to-r from-yellow-300 to-yellow-600
            text-transparent bg-clip-text
            drop-shadow-[0_0_18px_rgba(255,200,0,0.45)]
          "
        >
          {title}
        </h2>
      </div>

      {/* Durumlar */}
      {loading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Henüz ürün yok.</p>
      ) : (
        <div className="relative">

          {/* 🔥 TÜM CİHAZLARDA KAYAN ÜRÜN LİSTESİ */}
      <div
  className={`
    flex gap-4 pb-4
    overflow-x-auto overflow-y-hidden
    whitespace-nowrap
    ${window.innerWidth < 768 ? "no-scrollbar" : "scrollbar-thin"}
  `}
  style={{ scrollBehavior: "smooth" }}
>
  {products.map((p, i) => (
    <div 
      key={p.id}
      className="shrink-0 min-w-[280px]"
    >
      <ProductCard product={p} />

      {i === 0 && (
        <span className="ml-3 text-yellow-400 text-3xl animate-pulse">
          ➜
        </span>
      )}
    </div>
  ))}
</div>



        </div>
      )}

    </section>
  );
}
