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

  const slides = [
    { src: "/hero/slide1.jpg", text: "" },
    { src: "/hero/slide2.jpg", text: "" },
    { src: "/hero/slide3.jpg", text: "" },
    { src: "/hero/slide4.jpg", text: "Premium Çanta Koleksiyonu" },
    { src: "/hero/slide5.jpg", text: "Tarzını Göster!" },
    { src: "/hero/slide6.jpg", text: "" },
    { src: "/hero/slide7.jpg", text: "" },
    { src: "/hero/slide8.jpg", text: "" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ✅ HERO SLIDER */}
      <section className="relative w-full overflow-hidden mb-8">
       <div className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[80vh] aspect-[16/9] sm:aspect-auto">

          <Swiper
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
            {slides.map((slide, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-full">
                  <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet={slide.src.replace(".jpg", "-mobile.jpg")}
                    />
                    <img
                      src={slide.src}
                      alt=""
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                    />
                  </picture>

                  {/* ✅ Altın yazı */}
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
            ))}
          </Swiper>
        </div>
        {/* ✅ Zarif SVG kırmızı oklar (senin gönderdiğin gibi) */}
{/* ✅ Ultra zarif, tıklanabilir açık kırmızı oklar */}
<button className="custom-prev absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center z-20">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 24"
    fill="none"
    stroke="#ff5c5c" /* 🔴 daha açık kırmızı */
    strokeWidth="1.3" /* ✅ daha ince çizgi */
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-[18px] h-[18px]" /* ✅ biraz daha uzun görünüm */
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
    stroke="#ff5c5c" /* 🔴 açık kırmızı */
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-[18px] h-[18px]"
  >
    <line x1="5" y1="12" x2="24" y2="12" />
    <polyline points="17 5 24 12 17 19" />
  </svg>
</button>



        <style>
          {`
            /* ✅ Pagination noktaları altın */
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

           /* ✅ Zarif kırmızı oklar (senin attığın görsel gibi) */
.swiper-button-next,
.swiper-button-prev {
  color: #ff0000 !important;            /* 🔴 kırmızı ok */
  width: 34px !important;               /* 🔘 küçük beyaz daire */
  height: 34px !important;
  background: #ffffff !important;       /* beyaz zemin */
  border-radius: 50% !important;
  box-shadow: none !important;          /* gölgeyi kaldır */
  opacity: 1 !important;
  border: 1.2px solid #ff0000 !important; /* 🔴 kırmızı ince çerçeve */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.swiper-button-next:after,
.swiper-button-prev:after {
  font-size: 13px !important;           /* 🔸daha ince ok */
  font-weight: 400 !important;
}

.swiper-button-next:hover,
.swiper-button-prev:hover {
  background: #fff !important;
  transform: scale(1.02);
}

            .swiper-button-next {
              right: 12px !important;
            }
            .swiper-button-prev {
              left: 12px !important;
            }

            /* ✅ Hover’da zarif parlama */
            .swiper-button-next:hover,
            .swiper-button-prev:hover {
              background: #fff !important;
              box-shadow: 0 0 12px rgba(255, 0, 0, 0.4);
            }

            /* ✅ Fade yazı animasyonu */
            @keyframes fadeUp {
              0% {
                opacity: 0;
                transform: translateY(25px);
                filter: blur(5px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
                filter: blur(0);
              }
            }
            .animate-fadeUp {
              animation: fadeUp 1s ease-out both;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: black !important;
              overscroll-behavior-y: none !important;
            }
              /* ✅ Ok hover efekti */
.custom-prev,
.custom-next {
  transition: all 0.3s ease;
}
.custom-prev:hover,
.custom-next:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(255, 0, 0, 0.25);
}
      @media (max-width: 767px) {
  .custom-prev {
    left: 10px !important;
  }
  .custom-next {
    right: 10px !important;
  }

  /* ✅ Mobilde okları tamamen gizle */
  .custom-prev,
  .custom-next {
    display: none !important;
  }
}

  @keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.animate-marquee {
  display: inline-block;
  animation: marquee 25s linear infinite;
}

          `}
        </style>
      </section>
   {/* ✅ Kusursuz kenardan gelen Premium Loop */}
<div className="relative overflow-hidden border-t border-yellow-500/10 -mt-5 mb-4">
  <div className="marquee-wrapper">
    <div className="marquee-track">
      <span className="marquee-text text-[11px] sm:text-[12px] tracking-[0.25em] uppercase 
        font-light text-[#ffbfbf] drop-shadow-[0_0_3px_rgba(255,192,192,0.25)] px-4">
        Alışveriş Yaptıkça Kazanın 20 000 Puan!.... • Her 20.000 Puanda Özel Bir Hediye... • ✨MüştERİ Panelinden GöR.. • Kapıda Ödeme •
      </span>
      <span className="marquee-text text-[11px] sm:text-[12px] tracking-[0.25em] uppercase 
        font-light text-[#ffbfbf] drop-shadow-[0_0_3px_rgba(255,192,192,0.25)] px-4">
         • Premium Çanta Koleksiyonu .......  • Tarzını Göster .... ✨ Kaliteli Ürün •  Güvenli Ödeme  • İADE VE DEĞİŞİM  •
      </span>
    </div>
  </div>

  <style>
    {`
      .marquee-wrapper {
        position: relative;
        width: 100%;
        overflow: hidden;
      }

      .marquee-track {
        display: inline-flex;
        white-space: nowrap;
        will-change: transform;
        animation: marqueeFlow 30s linear infinite;
      }

      @keyframes marqueeFlow {
        0% {
          transform: translateX(70%);
        }
        100% {
          transform: translateX(-100%);
        }
      }
    `}
  </style>
</div>







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
