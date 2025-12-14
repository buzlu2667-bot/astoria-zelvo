import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams, Link } from "react-router-dom";


export default function CategoryMain() {
  const { mainSlug } = useParams();
  const [main, setMain] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [mainSlug]);

  async function load() {
    setLoading(true);

    try {
      const { data: mainCat } = await supabase
        .from("main_categories")
        .select("*")
        .eq("slug", mainSlug)
        .maybeSingle();

      setMain(mainCat);

      if (mainCat) {
        const { data: subData } = await supabase
          .from("sub_categories")
          .select("*")
          .eq("main_id", mainCat.id);

        setSubs(subData || []);
      }
    } catch (e) {
      console.error("Kategori yükleme hatası:", e);
      setMain(null);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-white text-xl animate-pulse">
        Yükleniyor...
      </div>
    );

  if (!main)
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-white text-xl">
        Kategori bulunamadı.
      </div>
    );

  return (
<div className="px-6 pt-4 pb-6">
   <h1 className="text-3xl font-bold mb-4 text-gray-800">
  {main?.title} Kategorileri
</h1>


      {/* 🔥 YENİ TRENDYOL TİPİ DİKEY KART TASARIMI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mt-6">
  {subs.map((s) => {
    const title = (s.title || "").trim();
    const letter = (title || s.slug || "?").charAt(0).toUpperCase();

    return (
      <Link
        key={s.id}
        to={`/category/${mainSlug}/${s.slug}`}
        className="
          group relative overflow-hidden rounded-3xl
          bg-white/80 backdrop-blur
          border border-gray-200/70
          shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]
          hover:shadow-[0_18px_45px_-25px_rgba(0,0,0,0.35)]
          transition-all duration-300
          hover:-translate-y-1
          focus:outline-none focus:ring-2 focus:ring-orange-200
        "
      >
        {/* Premium glow */}
        <div className="
          pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100
          transition duration-300
          bg-[radial-gradient(600px_circle_at_30%_20%,rgba(249,115,22,0.18),transparent_55%)]
        " />

        {/* Üst */}
        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            {/* Harf badge (premium) */}
            <div className="
              relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl
              bg-gradient-to-br from-orange-50 to-white
              border border-orange-100/80
              flex items-center justify-center
              text-orange-600 font-extrabold text-lg sm:text-xl
              shadow-[0_10px_25px_-18px_rgba(249,115,22,0.8)]
            ">
              <span className="drop-shadow-sm">{letter}</span>
            </div>

            {/* Pill */}
            <div className="
              inline-flex items-center gap-2 rounded-full
              bg-gray-50 border border-gray-200/70
              px-3 py-1 text-[11px] sm:text-xs text-gray-600
            ">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Kategori
            </div>
          </div>

          <h3 className="mt-4 text-gray-900 font-semibold text-sm sm:text-base truncate">
            {title || s.slug}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2">
            Ürünleri keşfet, filtrele ve hızlıca incele.
          </p>

          {/* Divider */}
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* Alt CTA */}
        <div className="relative px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="
            flex items-center justify-between rounded-2xl
            bg-white border border-gray-200/70
            px-4 py-3
            group-hover:border-orange-200/70
            transition
          ">
            <span className="text-[#f27a1a] font-bold text-sm">
              Kategoriyi İncele
            </span>

            {/* Ok animasyonu */}
            <span className="
              text-gray-400 font-bold
              group-hover:text-orange-500
              transition
              translate-x-0 group-hover:translate-x-1
            ">
              →
            </span>
          </div>
        </div>
      </Link>
    );
  })}
</div>

    </div>
  );
}
