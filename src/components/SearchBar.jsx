import { useState, useEffect } from "react";
import { Search, X, FolderSearch } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function SearchBar({ small = false }) {

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  //  🔍 Debounce
  // -----------------------------
  useEffect(() => {
    const d = setTimeout(() => {
      if (q.trim().length > 0) searchAll();
      else setResults([]);
    }, 300);
    return () => clearTimeout(d);
  }, [q]);

  // ============================================================
  // 🔥 ÜRÜN + KATEGORİ + ALT KATEGORİ + SERVER ARAMASI
  // ============================================================
  async function searchAll() {
    setLoading(true);

    // ÜRÜNLER
   const { data: products } = await supabase
  .from("products")
  .select("id, title, price, old_price, main_img, gallery")
  .ilike("title", `%${q}%`)
  .limit(20);


    // MAIN CATEGORIES
    const { data: mains } = await supabase
      .from("main_categories")
      .select("id, title, slug")
      .ilike("title", `%${q}%`);

    // SUB CATEGORIES
    const { data: subs } = await supabase
      .from("sub_categories")
      .select("id, title, slug, main_id")
      .ilike("title", `%${q}%`);

    // SERVER CATEGORIES
    const { data: servers } = await supabase
      .from("server_categories")
      .select("id, title, slug, sub_id")
      .ilike("title", `%${q}%`);

    // ⭐ MAIN → sadece kategori göster
    const finalMain = (mains || []).map((c) => ({
      type: "main",
      title: c.title,
      mainSlug: c.slug,
    }));

    // ⭐ SUB → hem kendi slug hem parent slug ile
    const finalSub = (subs || []).map((c) => ({
      type: "sub",
      title: c.title,
      subSlug: c.slug,
      mainSlug: mains.find((m) => m.id === c.main_id)?.slug,
    }));

    // ⭐ SERVER → 3. seviye kategori
    const finalServer = (servers || []).map((c) => {
      const parentSub = subs.find((s) => s.id === c.sub_id);
      return {
        type: "server",
        title: c.title,
        serverSlug: c.slug,
        subSlug: parentSub?.slug,
        mainSlug: mains.find((m) => m.id === parentSub?.main_id)?.slug,
      };
    });

    // ⭐ ÜRÜNLER
    const finalProducts = (products || []).map((p) => ({
      type: "product",
      ...p,
    }));

    setResults([
      ...finalSub,
      ...finalServer,
      ...finalProducts,
      ...finalMain, // en alta atıyorum ki confuse olmasın
    ]);

    setLoading(false);
  }

  // ============================================================
  // 🔥 TIKLANINCA DOĞRU YERE GİT
  // ============================================================
  function go(item) {
    switch (item.type) {
      case "product":
        return (window.location.href = `/product/${item.id}`);

      case "sub":
        return (window.location.href = `/category/${item.mainSlug}/${item.subSlug}`);

      case "server":
        return (window.location.href = `/category/${item.mainSlug}/${item.subSlug}/${item.serverSlug}`);

      case "main":
        return (window.location.href = `/category/${item.mainSlug}`);

      default:
        return;
    }
  }

  // ============================================================
  // 🔥 RENDER
  // ============================================================
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* INPUT */}
     <div
  className={`
    flex items-center gap-2 
    bg-black/40 backdrop-blur-md 
    border border-white/10 
    rounded-xl
    ${small 
      ? "px-3 py-1.5 text-sm w-full min-w-[140px]" 
      : "px-4 py-2"
    }
  `}
>


        <Search className="text-gray-300" size={20} />
      <input
  value={q}
  onChange={(e) => setQ(e.target.value)}
  placeholder={small ? "Ara..." : "Aramak istediğin ürünü yaz..."}
  className={`
    flex-1 bg-transparent outline-none text-white 
    ${small ? "placeholder-gray-500 text-xs" : "placeholder-gray-400"}
  `}
/>


        {q.length > 0 && (
          <X
            onClick={() => setQ("")}
            className="cursor-pointer text-gray-300 hover:text-white"
          />
        )}
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
     <div
  className={`
    absolute mt-2 z-[999999] 
    bg-[#0d0d0d] border border-[#222]
    rounded-xl shadow-xl 
    max-h-[300px] overflow-y-auto

    ${small 
      ? "left-1/2 -translate-x-1/2 w-[95vw]" 
      : "left-0 right-0"
    }
  `}
>


          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => go(r)}
              className="
                flex items-center gap-3 p-3 
                hover:bg-white/10 transition border-b border-white/5
                cursor-pointer
              "
            >
              {/* ÜRÜN */}
        {r.type === "product" ? (
  <div className="flex items-center gap-3 w-full">

    {/* FOTO */}
    <img
      src={r.main_img || r.gallery?.[0]}
      className="w-12 h-12 rounded-lg object-cover border border-white/10 shadow-[0_0_8px_rgba(0,0,0,0.4)]"
    />

    <div className="flex flex-col flex-1">

      {/* BAŞLIK */}
      <span className="text-white text-sm font-semibold truncate">
        {r.title}
      </span>

      {/* FİYAT BLOĞU */}
      <div className="flex items-center gap-2 mt-0.5">

        {/* % İNDİRİM */}
        {r.old_price > r.price && (
          <span
            className="
              text-red-300 text-[11px] font-bold
              bg-red-800/40 border border-red-500/40
              px-1.5 py-[1px] rounded-md
            "
          >
            %{Math.round(((r.old_price - r.price) / r.old_price) * 100)}
          </span>
        )}

        {/* ESKİ FİYAT */}
        {r.old_price > r.price && (
          <span className="text-gray-400 text-[11px] line-through">
            ₺{Number(r.old_price).toLocaleString("tr-TR")}
          </span>
        )}

        {/* YENİ FİYAT */}
        <span className="text-yellow-300 text-[13px] font-extrabold drop-shadow-[0_0_4px_rgba(255,220,0,0.4)]">
          ₺{Number(r.price).toLocaleString("tr-TR")}
        </span>

      </div>

    </div>
  </div>
) : (

                // ⭐ MODERN KATEGORİ SATIRI
                <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold">
                  <FolderSearch size={18} className="text-blue-400 opacity-80" />
                  {r.title} (Kategori)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NO RESULT */}
      {q.length > 0 && !loading && results.length === 0 && (
        <div
          className="
            absolute left-0 right-0 mt-2 
            bg-[#0d0d0d] border border-[#222] 
            rounded-xl shadow-xl p-3 text-center
            text-gray-400 text-sm z-[999999]
          "
        >
          Sonuç bulunamadı
        </div>
      )}
    </div>
  );
}
