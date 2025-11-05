// ✅ HOME PAGE — PERFECT 16:9 MOBILE + 85vh DESKTOP FINAL
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
      <section className="relative w-full overflow-hidden mt-[110px] md:mt-[80px]">
        <div className="relative w-full">
          <div
            className="slider-wrapper"
            style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {/* ✅ 16:9 oranı — padding-bottom hilesi */}
            <div
              className="ratio-fix"
              style={{
                width: "100%",
                paddingBottom: "56.25%", // 9 / 16 oranı
                position: "relative",
              }}
            >
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 3500 }}
                loop
                pagination={{ clickable: true }}
                className="absolute top-0 left-0 w-full h-full"
              >
                {[
                  { src: "/hero/slide1.jpg" },
                  { src: "/hero/slide2.jpg" },
                  { src: "/hero/slide3.jpg" },
                  { src: "/hero/slide4.jpg" },
                  { src: "/hero/slide5.jpg" },
                  { src: "/hero/slide11.jpg" },
                ].map((slide, i) => (
                  <SwiperSlide key={i}>
                    <img
                      src={slide.src}
                      alt=""
                      className="w-full h-full object-cover object-center
                        brightness-[1.05] contrast-[1.1] saturate-[1.1]"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>

        {/* ✅ Masaüstü için yükseklik değişimi */}
        <style>
          {`
          @media (min-width: 768px) {
            .ratio-fix {
              padding-bottom: 0 !important;
              height: 85vh !important;
            }
          }
        `}
        </style>
      </section>

      {/* ✅ PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 pb-10 mt-10">
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
