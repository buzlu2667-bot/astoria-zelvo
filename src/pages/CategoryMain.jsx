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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6">
        {subs.map((s) => (
          <Link
            key={s.id}
            to={`/category/${mainSlug}/${s.slug}`}
            className="
              bg-white rounded-2xl shadow-md border border-gray-200 
              hover:shadow-xl hover:-translate-y-1 transition-all duration-300 
              overflow-hidden
            "
          >
            <div className="w-full h-48 bg-gray-100 overflow-hidden">
              <img
                src={`/category/${s.slug}.png`}
                onError={(e) => (e.target.style.opacity = 0)}
                className="
                  w-full h-full object-cover 
                  transition duration-500 
                  hover:scale-110
                "
              />
            </div>

            <div className="p-4 text-center">
              <h3 className="text-gray-900 font-semibold text-sm sm:text-base truncate">
                {s.title}
              </h3>

              <span className="text-[#f27a1a] font-bold text-sm block mt-1">
                Kategoriyi İncele →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
