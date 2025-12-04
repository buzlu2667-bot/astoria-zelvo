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
      // Ana kategori
      const { data: mainCat, error: mainErr } = await supabase
        .from("main_categories")
        .select("*")
        .eq("slug", mainSlug)
        .maybeSingle();

      if (mainErr) throw mainErr;
      setMain(mainCat);

      // Alt kategoriler
      if (mainCat) {
        const { data: subData, error: subErr } = await supabase
          .from("sub_categories")
          .select("*")
          .eq("main_id", mainCat.id);

        if (subErr) throw subErr;
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
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold capitalize">{main?.title}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {subs.map((s) => (
          <Link
            key={s.id}
            to={`/category/${mainSlug}/${s.slug}`}
            className="
              group rounded-2xl overflow-hidden
              bg-white/5 backdrop-blur-xl 
              border border-white/10 
              hover:border-[#00ffaa]/40
              hover:shadow-[0_0_25px_rgba(0,255,170,0.4)]
              transition-all duration-300
            "
          >
            <div className="w-full h-40 overflow-hidden rounded-xl">
              <img
                src={`/category/${s.slug}.png`}
                onError={(e) => (e.target.style.opacity = 0)}
                className="
                  w-full h-full object-cover 
                  group-hover:scale-110 
                  transition-all duration-500
                "
              />
            </div>

            <h3
              className="
                text-center text-lg font-bold mt-3 mb-2
                text-white group-hover:text-[#00ffaa] 
                transition
              "
            >
              {s.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
