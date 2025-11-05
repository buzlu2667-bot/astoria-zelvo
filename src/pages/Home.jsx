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
  "/hero/slide4.jpg"
];

  const { name: category } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
     const { data } = await supabase
  .from("products")
  .select("*")
  .is("category", null) // ✅ sadece kategorisi boş ürünleri getir
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
   
   {/* ✅ FULLSCREEN PREMIUM HERO SLIDER — FINAL */}
<section
  className="relative w-full overflow-hidden 
  h-[85vh] sm:h-[85vh] md:h-[85vh] lg:h-[85vh] xl:h-[85vh]"
>




  <div className="relative w-full h-full md:h-auto max-md:aspect-[16/9] max-md:h-auto">




 <Swiper
  modules={[Autoplay, Pagination]}
  autoplay={{ delay: 3500 }}
  loop
  pagination={{ clickable: true }}
  className="w-full h-full"
  style={{
    height: "100%",
    position: "relative",
    zIndex: 10,
  }}
>





    {[
      { type: "image", src: "/hero/slide5.jpg", title: "", text: "", color: "text-yellow-400" },
      { type: "image", src: "/hero/slide1.jpg", title: "", text: "", color: "text-yellow-400" },
      { type: "image", src: "/hero/slide2.jpg", title: "Premium Çanta Koleksiyonu", text: "", color: "text-yellow-400" },
      { type: "image", src: "/hero/slide6.jpg", title: "", text: "", color: "text-yellow-400" },
      { type: "image", src: "/hero/slide3.jpg", title: "Premium Çanta Koleksiyonu", text: "", color: "text-yellow-400" },
      { type: "image", src: "/hero/slide4.jpg", title: "Tarzını Göster!", text: "", color: "text-yellow-300" },
      { type: "image", src: "/hero/slide7.jpg", title: "", text: "", color: "text-yellow-400" },
      { type: "image", src: "/hero/slide8.jpg", title: "", text: "", color: "text-yellow-400" },
      { type: "image", src: "/hero/slide9.jpg", title: "", text: "", color: "text-yellow-400" },
      { type: "image", src: "/hero/slide10.jpg", title: "", text: "", color: "text-yellow-400" },
    ].map((slide, i) => (
      <SwiperSlide key={i}>
  <div className="relative w-full h-full overflow-hidden">
    {slide.type === "video" ? (
      <video
        className="absolute inset-0 w-full h-full object-cover object-center"
        src={slide.src}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : (
      <picture>
        {/* ✅ Mobil görsel */}
        <source
          media="(max-width: 767px)"
          srcSet={slide.src.replace(".jpg", "-mobile.jpg")}
        />
       {/* ✅ Masaüstü + Mobil görsel (renk canlı + 16:9 uyumlu) */}
<img
  src={slide.src}
  alt=""
  className="absolute inset-0 w-full h-full object-cover object-center
  brightness-[1.05] contrast-[1.1] saturate-[1.1]
  transition-all duration-700 ease-out"
/>







      </picture>
    )}

    {/* ✅ Overlay */}
    <div className="absolute inset-0 bg-black/10"></div>

    {/* ✅ İçerik */}
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 animate-fadeInUp">
      <h1
        className={`text-3xl sm:text-4xl md:text-6xl font-extrabold drop-shadow-xl ${slide.color}`}
      >
        {slide.title}
      </h1>
      {slide.text && (
        <p className="text-gray-200 mt-3 text-base sm:text-lg md:text-xl">
          {slide.text}
        </p>
      )}
    </div>
  </div>
</SwiperSlide>

    ))}
    <style>
{`
  /* Masaüstü düzgün kalsın */
  .swiper {
    height: 100% !important;
  }

  /* Pagination aşağıya taşmasın */
  .swiper-pagination {
    bottom: 25px !important;
    z-index: 50 !important;
  }

  /* 🚀 Mobilde gerçek 16:9 oranı */
  @media (max-width: 768px) {
    .swiper {
      height: auto !important;
      aspect-ratio: 16 / 9 !important;
    }
    .swiper-wrapper,
    .swiper-slide {
      height: auto !important;
    }
    .swiper-slide img {
      width: 100% !important;
      height: auto !important;
      object-fit: cover !important;
      display: block !important;
    }
  }
`}
</style>


  </Swiper>
  
  </div>
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

    {/* ✅ QUICK VIEW MODAL */}
    <QuickViewModal
      product={quickViewProduct}
      closeModal={() => setQuickViewProduct(null)}
    />

    

  </div>
);

}
