import { useState, useEffect } from "react";
import { Search, X, FolderSearch } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function SearchBar({ small = false }) {

    const placeholderWords = [
    "Çanta",
    "Cüzdan",
    "Kartlık",
    "Havlu",
    "Valiz"
   
  ];


  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

    const [fakeText, setFakeText] = useState("");
  const [fakeIndex, setFakeIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);


  // -----------------------------
  // 🔍 Debounce
  // -----------------------------
  useEffect(() => {
    const d = setTimeout(() => {
      if (q.trim().length > 0) searchAll();
      else setResults([]);
    }, 300);
    return () => clearTimeout(d);
  }, [q]);

     useEffect(() => {
    if (q.length > 0) return;

    const current = placeholderWords[fakeIndex];
    const speed = isDeleting ? 40 : 70;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setFakeText(current.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (!isDeleting && charIndex === current.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && charIndex > 0) {
        setFakeText(current.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else {
        setIsDeleting(false);
        setFakeIndex((fakeIndex + 1) % placeholderWords.length);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [fakeText, charIndex, isDeleting, fakeIndex, q]);


  // ============================================================
  // 🔥 SEARCH
  // ============================================================
  async function searchAll() {
    setLoading(true);

    const { data: products } = await supabase
      .from("products")
      .select("id, title, price, old_price, main_img, gallery")
      .ilike("title", `%${q}%`)
      .limit(20);

    const { data: mains } = await supabase
      .from("main_categories")
      .select("id, title, slug")
      .ilike("title", `%${q}%`);

    const { data: subs } = await supabase
      .from("sub_categories")
      .select("id, title, slug, main_id")
      .ilike("title", `%${q}%`);

    const { data: servers } = await supabase
      .from("server_categories")
      .select("id, title, slug, sub_id")
      .ilike("title", `%${q}%`);

    const final = [];

    (products || []).forEach((p) => final.push({ type: "product", ...p }));

    (mains || []).forEach((m) =>
      final.push({ type: "main", title: m.title, mainSlug: m.slug })
    );

    (subs || []).forEach((s) =>
      final.push({
        type: "sub",
        title: s.title,
        subSlug: s.slug,
        mainSlug: mains.find((m) => m.id === s.main_id)?.slug,
      })
    );

    (servers || []).forEach((c) => {
      const parent = subs.find((s) => s.id === c.sub_id);
      final.push({
        type: "server",
        title: c.title,
        serverSlug: c.slug,
        subSlug: parent?.slug,
        mainSlug: mains.find((m) => m.id === parent?.main_id)?.slug,
      });
    });

    setResults(final);
    setLoading(false);
  }

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
    }
  }

  // ============================================================
  //  🔥 RENDER — TRENDYOL BEYAZ
  // ============================================================
  return (
  <div className="relative w-full max-w-xl mx-auto md:max-w-xl px-2">

    {/* INPUT */}
    <div
      className={`
        flex items-center gap-2 
        bg-white 
        border border-gray-300 
        rounded-xl shadow-sm
        ${small ? "px-3 py-1.5 text-sm" : "px-4 py-3"}
        md:py-2
      `}
    >
      <Search className="text-gray-500" size={20} />

      <div className="relative flex-1">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-transparent outline-none text-gray-800 text-base md:text-sm"
        />

        {q.length === 0 && (
          <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-base md:text-sm">
            Örn: {fakeText}
            <span className="animate-pulse ml-0.5">|</span>
          </div>
        )}
      </div>

      {q.length > 0 && (
        <X
          onClick={() => setQ("")}
          className="cursor-pointer text-gray-500 hover:text-[#f27a1a]"
        />
      )}
    </div>

    {/* RESULTS */}
    {results.length > 0 && (
      <div className="absolute mt-2 z-[999999] bg-white border border-gray-300 rounded-xl shadow-lg max-h-[300px] overflow-y-auto left-0 right-0">
        {results.map((r, i) => (
          <div
            key={i}
            onClick={() => go(r)}
            className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
          >
            {r.type === "product" ? (
              <div className="flex items-center gap-3 w-full">
                <img
                  src={r.main_img || r.gallery?.[0]}
                  className="w-12 h-12 rounded-lg object-cover border"
                />

                <div className="flex flex-col flex-1">
                  <span className="text-gray-900 text-sm font-medium truncate">
                    {r.title}
                  </span>

                  <div className="flex items-center gap-2 mt-0.5">
                    {r.old_price > r.price && (
                      <span className="text-red-600 text-xs font-bold">
                        %{Math.round(((r.old_price - r.price) / r.old_price) * 100)}
                      </span>
                    )}

                    {r.old_price > r.price && (
                      <span className="text-gray-400 text-xs line-through">
                        ₺{r.old_price.toLocaleString("tr-TR")}
                      </span>
                    )}

                    <span className="text-[#f27a1a] text-sm font-bold">
                      ₺{r.price.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-800 text-sm">
                <FolderSearch size={18} className="text-[#f27a1a]" />
                {r.title}
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* NO RESULT */}
    {q.length > 0 && !loading && results.length === 0 && (
      <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg p-3 text-center text-gray-500 text-sm">
        Sonuç bulunamadı
      </div>
    )}
  </div>
);

}
