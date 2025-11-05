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
  const heroImages = [
    "/hero/slide1.jpg",
    "/hero/slide2.jpg",
    "/hero/slide3.jpg",
    "/hero/slide4.jpg",
  ];

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
      <section
        className="relative w-full overflow-hidden"
        style={{
          height: "85vh",
        }}
      >
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3500 }}
          loop
          pagination={{ clickable: true }}
          className="hero-swiper w-full h-full"
        >
          {[
            { src: "/hero/slide5.jpg", title: "", color: "text-yellow-400" },
            { src: "/hero/slide1.jpg", title: "", color: "text-yellow-400" },
            {
              src: "/hero/slide2.jpg",
              title: "Premium Çanta Koleksiyonu",
              color: "text-yellow-400",
            },
            { src: "/hero/slide6.jpg", title: "", color: "text-yellow-400" },
            {
              src: "/hero/slide3.jpg",
              title: "Premium Çanta Koleksiyonu",
              color: "text-yellow-400",
            },
            {
              src: "/hero/slide4.jpg",
              title: "Tarzını Göster!",
              color: "text-yellow-300",
            },
            { src: "/hero/slide7.jpg", title: "", color: "text-yellow-400" },
            { src: "/hero/slide8.jpg", title: "", color: "text-yellow-400" },
            { src: "/hero/slide9.jpg", title: "", color: "text-yellow-400" },
            { src: "/hero/slide10.jpg", title: "", color: "text-yellow-400" },
            { src: "/hero/slide11.jpg", title: "", color: "text-yellow-400" },
          ].map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={slide.src}
                  alt=""
                  className="w-full h-full object-cover object-center 
                  brightness-[1.05] contrast-[1.1] saturate-[1.1]"
                />
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h1
                    className={`text-3xl sm:text-4xl md:text-6xl font-extrabold drop-shadow-xl ${slide.color}`}
                  >
                    {slide.title}
                  </h1>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ✅ Mobil Override */}
        <style>
          {`
            /* Masaüstü */
            .swiper {
              height: 100% !important;
            }
            .swiper-pagination {
              bottom: 25px !important;
            }

            /* ✅ Mobil: kesin 16:9 oran */
            @media (max-width: 768px) {
              .hero-swiper {
                height: auto !important;
              }
              .hero-swiper .swiper-wrapper,
              .hero-swiper .swiper-slide {
                height: auto !important;
              }
              .hero-swiper .swiper-slide div {
                position: relative !important;
                width: 100% !important;
                padding-bottom: 56.25% !important; /* 16:9 oranı */
                height: 0 !important;
              }
              .hero-swiper img {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
              }
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
