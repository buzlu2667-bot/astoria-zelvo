import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { name: category } = useParams();

  // ✅ Ürünleri çek
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .is("category", null)
        .order("id", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // ✅ Filtreleme
  const filteredProducts = useMemo(() => {
    if (!category) return products;
    return products.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }, [category, products]);

  // ✅ Slider foto listesi
  const slides = [
    
    { src: "/hero/slide1.jpg", text: "" },
    { src: "/hero/slide2.jpg", text: "" },
    { src: "/hero/slide3.jpg", text: "" },
    { src: "/hero/slide4.jpg", text: "Premium Çanta Koleksiyonu" },
    { src: "/hero/slide5.jpg", text: "Tarzını Göster!" },
    { src: "/hero/slide6.jpg", text: "" },
    { src: "/hero/slide7.jpg", text: "" },
    { src: "/hero/slide8.jpg", text: "" },
    { src: "/hero/slide9.jpg", text: "" },
    { src: "/hero/slide10.jpg", text: "" },
    { src: "/hero/slide11.jpg", text: "" },
    { src: "/hero/slide12.jpg", text: "" },
    { src: "/hero/slide13.jpg", text: "" },
    
  ];

  // ✅ Mobil algılayıcı (gerçek zamanlı)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ✅ HERO SLIDER */}
     <section className="relative w-full overflow-hidden mb-4 mt-0 sm:mt-0 !pt-0 !translate-y-0">

        <div
  className="w-full aspect-[16/9] sm:aspect-auto"
  style={{
   height: isMobile ? "calc(100vh - 100px)" : "90vh",
    objectPosition: isMobile ? "center top" : "center",
    marginTop: isMobile ? "-60px" : "-40px", // ✅ artık tüm slider bloğu yukarı kayıyor
  }}


        >
          <Swiper
            key={isMobile ? "mobile" : "desktop"} // ✅ Cache reset fix
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            className="w-full h-full"
          >
            {slides.map((slide, i) => {
              const imageSrc = isMobile
                ? slide.src.replace(".jpg", "-mobile.jpg")
                : slide.src;
              const finalSrc = `${imageSrc}?v=${Date.now()}`; // ✅ Cache kırıcı
              return (
                <SwiperSlide key={i}>
                  <div className="relative w-full h-full">
                    <img
                      src={finalSrc}
                      alt={`slide-${i}`}
                      className="w-full h-full object-cover object-center sm:object-top"
                      draggable="false"
                    />

                    {slide.text && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h2
                          className="text-3xl sm:text-4xl md:text-5xl font-extrabold 
                          text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-500 
                          drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-fadeUp"
                        >
                          {slide.text}
                        </h2>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* ✅ Navigation Okları */}
        <button className="custom-prev absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center z-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 28 24"
            fill="none"
            stroke="#ff5c5c"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <line x1="23" y1="12" x2="4" y2="12" />
            <polyline points="11 19 4 12 11 5" />
          </svg>
        </button>

        <button className="custom-next absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center z-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 28 24"
            fill="none"
            stroke="#ff5c5c"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <line x1="5" y1="12" x2="24" y2="12" />
            <polyline points="17 5 24 12 17 19" />
          </svg>
        </button>

        {/* ✅ Styles */}
        <style>
          {`
            .swiper-pagination-bullet {
              background: rgba(255, 215, 0, 0.6) !important;
              width: 8px !important;
              height: 8px !important;
              margin: 0 4px !important;
              opacity: 1 !important;
            }
            .swiper-pagination-bullet-active {
              background: #ffd700 !important;
              transform: scale(1.15);
            }
            @keyframes fadeUp {
              0% { opacity: 0; transform: translateY(25px); filter: blur(5px); }
              100% { opacity: 1; transform: translateY(0); filter: blur(0); }
            }
            .animate-fadeUp {
              animation: fadeUp 1s ease-out both;
            }
            @media (max-width: 767px) {
              .custom-prev, .custom-next { display: none !important; }
            }
          `}
        </style>
      </section>

      {/* ✅ ALT YAZI */}
      <div className="relative overflow-hidden mt-0 mb-0">


        <div className="marquee">
          <div className="marquee__inner">
            • Alışveriş Yaptıkça Kazan 20 000 Puan! • Her 20 000 Puanda Hediyeni Kap • Müşteri Panelinden Hediye Barını Gör • Tarzını Göster • Kaliteli Ürün • Güvenli Ödeme • İade ve Değişim •
          </div>
        </div>
        <style>
          {`
            .marquee {
              overflow: hidden;
              white-space: nowrap;
              width: 100%;
              color: #ffbfbf;
              font-size: 12px;
              letter-spacing: 0.25em;
              text-transform: uppercase;
              text-shadow: 0 0 3px rgba(255,192,192,0.25);
            }
            .marquee__inner {
              display: inline-block;
              padding-left: 100%;
              animation: move 25s linear infinite;
            }
            @keyframes move {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100%); }
            }
          `}
        </style>
      </div>

      {/* ✅ ÜRÜNLER */}
      <main className="max-w-7xl mx-auto px-6 pb-10">
        {loading ? (
          <p className="text-gray-500 text-center">Yükleniyor...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-400">
            Bu kategoride ürün bulunamadı.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                openModal={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </main>

      <QuickViewModal
        product={quickViewProduct}
        closeModal={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
