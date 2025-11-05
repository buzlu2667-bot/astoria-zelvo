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

    // ✅ Mobilde 16:9 oranı zorlama (JS yöntemi)
  useEffect(() => {
    const setSliderRatio = () => {
      const sliders = document.querySelectorAll(".hero-swiper");
      sliders.forEach(slider => {
        if (window.innerWidth <= 768) {
          const width = slider.offsetWidth;
          slider.style.height = `${width * 0.5625}px`; // 16:9 oranı
        } else {
          slider.style.height = "85vh"; // masaüstü sabit kalır
        }
      });
    };

    setSliderRatio();
    window.addEventListener("resize", setSliderRatio);
    return () => window.removeEventListener("resize", setSliderRatio);
  }, []);


  // 🚀 MOBİLDE SWIPER YÜKSEKLİĞİNİ 16:9 AYARLA
  useEffect(() => {
    const adjustSliderHeight = () => {
      if (window.innerWidth <= 768) {
        const sliders = document.querySelectorAll(".hero-swiper");
        sliders.forEach((slider) => {
          const width = slider.offsetWidth;
          const height = width * 0.5625; // 16:9 oranı
          slider.style.height = `${height}px`;
        });
      } else {
        const sliders = document.querySelectorAll(".hero-swiper");
        sliders.forEach((slider) => {
          slider.style.height = "85vh"; // masaüstü sabit
        });
      }
    };

    adjustSliderHeight();
    window.addEventListener("resize", adjustSliderHeight);
    return () => window.removeEventListener("resize", adjustSliderHeight);
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
      { src: "/hero/slide1.jpg" },
      { src: "/hero/slide2.jpg" },
      { src: "/hero/slide3.jpg" },
      { src: "/hero/slide4.jpg" },
      { src: "/hero/slide5.jpg" },
    ].map((slide, i) => (
      <SwiperSlide key={i}>
        <div className="relative w-full h-full">
          <img
            src={slide.src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[1.05] contrast-[1.1] saturate-[1.1]"
          />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>

  {/* ✅ Sadece mobilde JS ile oranı zorla */}
  <script dangerouslySetInnerHTML={{
    __html: `
      function adjustHeroHeight() {
        const slider = document.querySelector('.hero-swiper');
        if (!slider) return;
        if (window.innerWidth <= 768) {
          const width = slider.offsetWidth;
          const height = width * 0.5625; // 16:9 oran
          slider.style.height = height + 'px';
        } else {
          slider.style.height = '85vh';
        }
      }
      window.addEventListener('load', adjustHeroHeight);
      window.addEventListener('resize', adjustHeroHeight);
    `
  }} />
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
