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
<section className="w-full h-screen relative overflow-hidden">
  <Swiper
    modules={[Autoplay, Pagination]}
    autoplay={{ delay: 3500 }}
    loop
    pagination={{ clickable: true }}
    className="w-full h-full"
  >
    {[
      {
        type: "video",
        src: "/hero/slide1-video.mp4",
        title: "E-Pin Dünyası Burada!",
        text: "Hızlı Teslim — Güvenilir Alışveriş",
        color: "text-yellow-400",
      },
      {
        type: "image",
        src: "/hero/slide2.jpg",
        title: "Premium Çanta Koleksiyonu",
        text: "Lüks — Şık — Elitemart",
        color: "text-yellow-400",
      },
      {
        type: "image",
        src: "/hero/slide3.jpg",
        title: "Premium Çanta Koleksiyonu",
        text: "Lüks — Şık — ",
        color: "text-yellow-400",
      },
      {
        type: "video",
        src: "/hero/slide3-video.mp4",
        title: "Oyun Kodlarında Dev İndirim!",
        text: "",
        color: "text-rose-400",
      },
      {
        type: "image",
        src: "/hero/slide4.jpg",
        title: "Tarzını Göster!",
        text: "",
        color: "text-yellow-300",
      },
      {
        type: "video",
        src: "/hero/slide5-video.mp4",
        title: "Alışverişe Hoş Geldin",
        text: "",
        color: "text-yellow-400 drop-shadow-[0_0_30px_rgba(255,200,0,0.6)]",
      }
    ].map((slide, i) => (
      <SwiperSlide key={i}>
        <div className="relative w-full h-full">
          
          {/* ✅ Slide Media */}
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
            <img
             className="absolute inset-0 w-full h-full object-cover object-center"
              src={slide.src}
              alt=""
            />
          )}

          {/* ✅ Dark Overlay + Content */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80
shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]
flex flex-col items-center justify-center text-center px-4">
            <h1
              className={`text-4xl md:text-6xl font-extrabold drop-shadow-xl ${slide.color}`}
            >
              {slide.title}
            </h1>
            {slide.text && (
              <p className="text-gray-200 mt-3 text-lg md:text-xl">
                {slide.text}
              </p>
            )}
          </div>
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
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
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
