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
      <div className="text-center mb-14">
  <h2 className="
    text-4xl md:text-5xl font-black
    bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400
    bg-clip-text text-transparent
    drop-shadow-[0_0_22px_rgba(99,102,241,0.45)]
  ">
    Müşterilerimiz Ne Diyor?
  </h2>

  <p className="
    mt-4 inline-flex items-center gap-2
    px-6 py-2 rounded-full
    bg-gradient-to-r from-emerald-100 to-cyan-100
    text-emerald-900 text-sm font-bold
    shadow-lg
  ">
    ⭐ Son 8 Gerçek Müşteri Yorumu
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
  className="
    group
    relative overflow-hidden
    px-4 py-2
    rounded-xl
    text-[12px] font-extrabold tracking-wide
    text-white
    bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400
    shadow-[0_10px_30px_-10px_rgba(99,102,241,0.8)]
    hover:scale-105 transition
  "
>
  <span className="relative z-10 flex items-center gap-1">
    Ürünü Gör
    <span className="group-hover:translate-x-1 transition">→</span>
  </span>

  {/* cam parıltı */}
  <span className="
    pointer-events-none absolute inset-0
    bg-white/10 opacity-0 group-hover:opacity-100 transition
  "/>
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
