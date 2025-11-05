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
      {/* ✅ HERO SLIDER (yukarıdan sıfır, tam oturmuş) */}
     <section className="relative w-full overflow-hidden bg-black">
  <div className="relative w-full">
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3500 }}
      loop
      pagination={{ clickable: true }}
      className="hero-swiper"
    >
      {[
        { src: "/hero/slide1.jpg" },
        { src: "/hero/slide2.jpg" },
        { src: "/hero/slide3.jpg" },
        { src: "/hero/slide4.jpg" },
        { src: "/hero/slide11.jpg" },
        { src: "/hero/slide12.jpg" },
        { src: "/hero/slide13.jpg" },
      ].map((slide, i) => (
        <SwiperSlide key={i}>
          <div className="relative w-full">
            <img
              src={slide.src}
              alt=""
              className="block w-full h-auto object-cover object-center select-none"
              draggable={false}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>

  <style>{`
    .swiper-pagination {
      bottom: 12px !important;
      z-index: 50 !important;
    }

    .swiper-pagination-bullet {
      background: rgba(255,255,255,0.8) !important;
      width: 8px;
      height: 8px;
    }

    .swiper-pagination-bullet-active {
      background: #ffd700 !important;
    }

    /* Masaüstü */
    @media (min-width: 1024px) {
      .hero-swiper img {
        aspect-ratio: 16 / 9 !important;
        height: auto !important;
      }
    }

    /* Mobil */
    @media (max-width: 1023px) {
      .hero-swiper img {
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 16 / 9 !important;
        object-fit: cover !important;
      }
    }
  `}</style>
</section>





      {/* ✅ PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 pb-10">
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

      <QuickViewModal
        product={quickViewProduct}
        closeModal={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
