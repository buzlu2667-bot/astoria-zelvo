// ✅ HOME PAGE — ZERO ZOOM / ZERO LAG / FULL PENTI STYLE
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { name: category } = useParams();

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

  const filteredProducts = useMemo(() => {
    if (!category) return products;
    return products.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }, [category, products]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ✅ HERO SLIDER */}
      <section className="relative w-full overflow-hidden mb-10 -mt-[10px]">
        <Swiper
          modules={[Pagination, Autoplay]}
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          speed={0} // 🚫 animasyon yok
          allowTouchMove={true}
          onSlideChangeTransitionStart={(swiper) => {
            swiper.slides.forEach((slide) => {
              slide.style.transform = "translate3d(0,0,0)";
              slide.style.transition = "none";
            });
          }}
          className="hero-swiper w-full select-none touch-pan-y"
        >
          {[
            { src: "/hero/slide1.jpg" },
            { src: "/hero/slide2.jpg" },
            { src: "/hero/slide3.jpg" },
            { src: "/hero/slide4.jpg" },
            { src: "/hero/slide5.jpg" },
            { src: "/hero/slide11.jpg" },
            { src: "/hero/slide12.jpg" },
          ].map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={slide.src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center 
                    !transform-none !transition-none will-change-auto
                    brightness-[1.05] contrast-[1.1] saturate-[1.1]"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style>
          {`
            /* ✅ Masaüstü: 85vh sabit */
            @media (min-width: 768px) {
              .hero-swiper,
              .hero-swiper .swiper-wrapper,
              .hero-swiper .swiper-slide {
                height: 85vh !important;
              }
            }

            /* ✅ Mobil: tam ekran, akıcı */
            @media (max-width: 767px) {
              .hero-swiper,
              .hero-swiper .swiper-wrapper,
              .hero-swiper .swiper-slide {
                height: calc(100dvh - env(safe-area-inset-top, 0)) !important;
              }

              .hero-swiper img {
                object-fit: cover !important;
                object-position: center top !important;
                height: 100% !important;
                width: 100% !important;
                transform: none !important;
                transition: none !important;
                will-change: auto !important;
              }
            }

            /* ✅ Pagination sabit & görünür */
            .swiper-pagination {
              bottom: 18px !important;
              opacity: 1 !important;
              visibility: visible !important;
              z-index: 100 !important;
            }

            .swiper-pagination-bullet {
              background: rgba(255,255,255,0.8) !important;
              width: 8px;
              height: 8px;
              margin: 0 3px !important;
            }

            .swiper-pagination-bullet-active {
              background: #ffd700 !important;
            }

            /* ✅ iPhone Safe Area fix */
            @supports (-webkit-touch-callout: none) {
              .hero-swiper {
                padding-top: env(safe-area-inset-top, 0) !important;
                margin-top: -env(safe-area-inset-top, 0) !important;
              }
            }

            /* ✅ Zoom & kasma fix */
            .hero-swiper,
            .hero-swiper .swiper-wrapper,
            .hero-swiper .swiper-slide {
              will-change: auto !important;
              transform: none !important;
              transition: none !important;
              backface-visibility: hidden !important;
              perspective: 1000px !important;
            }

            .hero-swiper img {
              transform: none !important;
              transition: none !important;
              will-change: auto !important;
            }

            html, body {
              overscroll-behavior-y: contain !important;
            }
          `}
        </style>
      </section>

      {/* ✅ PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 pb-10 mt-6">
        {loading ? (
          <p className="text-gray-500 text-center">Yükleniyor...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-400">
            Bu kategoride ürün bulunamadı.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

      {/* ✅ QUICK VIEW MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        closeModal={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
