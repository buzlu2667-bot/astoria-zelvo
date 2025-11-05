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
      <section className="relative w-full overflow-hidden mb-8">
        <div className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh]">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            pagination={{ clickable: true }}
            className="w-full h-full"
          >
            {[
              { src: "/hero/slide1.jpg" },
              { src: "/hero/slide2.jpg" },
              { src: "/hero/slide3.jpg" },
              { src: "/hero/slide4.jpg" },
              { src: "/hero/slide5.jpg" },
              { src: "/hero/slide6.jpg" },
              { src: "/hero/slide7.jpg" },
              { src: "/hero/slide8.jpg" },
             
            ].map((slide, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-full">
                  <picture>
  {/* Mobil için -max-width: 767px */}
  <source media="(max-width: 767px)" srcSet={slide.src.replace(".jpg", "-mobile.jpg")} />
  <img
    src={slide.src}
    alt=""
    className="w-full h-full object-cover object-top"
    draggable={false}
  />
</picture>

                  <div className="absolute inset-0 bg-black/10" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <style>
          {`
            .swiper-pagination {
              bottom: 14px !important;
              z-index: 20 !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: black !important;
              overscroll-behavior-y: none !important;
            }
          `}
        </style>
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
