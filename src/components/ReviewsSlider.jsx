import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReviewsSlider() {
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

 async function loadReviews() {
  const { data } = await supabase
    .from("comments")
    .select("id, product_id, name, text")
    .eq("approved", true)   // 🔥 KRİTİK SATIR
    .order("created_at", { ascending: false })
    .limit(8);

  setReviews(data || []);
}

  if (reviews.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-24">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Müşterilerimiz Ne Diyor?
        </h2>
        <p className="text-gray-500 mt-2">
          Gerçek kullanıcı deneyimleri
        </p>
      </div>

      {/* ⬇️ WRAPPER ŞART */}
      <div className="relative">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4500 }}
          loop={false}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setCanPrev(!swiper.isBeginning);
            setCanNext(!swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setCanPrev(!swiper.isBeginning);
            setCanNext(!swiper.isEnd);
          }}
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1.05 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
          }}
        >
          {reviews.map((r) => (
            <SwiperSlide key={r.id}>
             <div
  className="
    relative
    h-[260px]            /* 🔥 SABİT KART BOYU */
    rounded-3xl
    p-6
    bg-white/80
    backdrop-blur-xl
    border border-gray-200
    shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]
    hover:shadow-[0_30px_80px_-25px_rgba(0,0,0,0.35)]
    transition-all duration-300
    hover:-translate-y-1
  "
>

                {/* QUOTE */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-200/60 pointer-events-none" />

                {/* STARS + BADGE */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <span className="
                    relative z-10
                    text-[11px] font-semibold
                    px-2 py-1
                    rounded-full
                    bg-emerald-50
                    text-emerald-700
                    ml-2 mt-1
                  ">
                    ✔ Doğrulanmış Müşteri
                  </span>
                </div>

                {/* COMMENT */}
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                  “{r.text}”
                </p>

                {/* FOOTER */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">

                  <span className="text-sm font-semibold text-gray-900">
                    {r.name}
                  </span>

                  <button
                    onClick={() => navigate(`/product/${r.product_id}`)}
                    className="text-sm font-semibold text-black hover:underline"
                  >
                    Ürünü Gör →
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ◀ SOL OK */}
        {canPrev && (
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="
              hidden md:flex
              absolute left-0 top-1/2 -translate-y-1/2
              w-10 h-10
              rounded-full
              bg-white
              border border-gray-300
              shadow-md
              items-center justify-center
              hover:bg-gray-100
              transition
              z-20
            "
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* ▶ SAĞ OK */}
        {canNext && (
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="
              hidden md:flex
              absolute right-0 top-1/2 -translate-y-1/2
              w-10 h-10
              rounded-full
              bg-white
              border border-gray-300
              shadow-md
              items-center justify-center
              hover:bg-gray-100
              transition
              z-20
            "
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>
    </section>
  );
}
