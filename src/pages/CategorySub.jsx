import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ProductCardVertical from "../components/ProductCardVertical";
import { Home,Sparkles } from "lucide-react";

const pretty = (s) =>
  (s || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function CategorySub() {
  const { mainSlug, subSlug } = useParams();

  const [products, setProducts] = useState([]);
  const [subCat, setSubCat] = useState(null);
  const [loading, setLoading] = useState(true);

  // Breadcrumb label (DB title varsa onu kullan, yoksa slug’ı güzelleştir)
  const mainLabel = useMemo(() => pretty(mainSlug), [mainSlug]);
  const subLabel = useMemo(
    () => subCat?.title || pretty(subSlug),
    [subCat?.title, subSlug]
  );

  useEffect(() => {
    let alive = true;

    async function loadData() {
      setLoading(true);

      const { data: sub, error: subErr } = await supabase
        .from("sub_categories")
        .select("*")
        .eq("slug", subSlug)
        .maybeSingle();

      if (!alive) return;
      if (subErr) console.error(subErr);

      setSubCat(sub);

      if (!sub) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data: prods, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .eq("sub_id", sub.id)
        .order("created_at", { ascending: false });

      if (!alive) return;
      if (prodErr) console.error(prodErr);

      setProducts(prods || []);
      setLoading(false);
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [mainSlug, subSlug]);

  if (loading)
    return (
      <p className="text-center text-white mt-20 animate-pulse">
        Yükleniyor...
      </p>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-10 text-white">

      {/* ✅ BREADCRUMB */}
    <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
  <Link
    to="/"
    className="inline-flex items-center gap-1 font-medium hover:text-gray-900 transition"
  >
    <Home className="w-4 h-4" />
    <span>Ana Sayfa</span>
  </Link>

  <span className="text-gray-300">/</span>

  <Link
    to={`/category/${mainSlug}`}
    className="font-medium text-gray-600 hover:text-gray-900 transition"
  >
    {mainLabel}
  </Link>

  <span className="text-gray-300">/</span>

  {/* AKTİF SAYFA */}
  <span className="font-semibold text-gray-900">
    {subLabel}
  </span>
</nav>

     {/* ✅ PREMIUM BAŞLIK */}
<div className="mb-6">
  <div
   className="
  relative overflow-hidden rounded-3xl
  border border-white/10 bg-gray-900/85 backdrop-blur
  shadow-[0_18px_60px_-40px_rgba(0,0,0,0.85)]
  px-5 py-5 sm:px-6 sm:py-6
"

  >
    {/* Glow */}
    <div className="
      pointer-events-none absolute inset-0
    bg-[radial-gradient(600px_circle_at_25%_20%,rgba(249,115,22,0.35),transparent_60%)]
    " />

    <div className="relative flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="
          w-12 h-12 sm:w-14 sm:h-14 rounded-2xl
          bg-gradient-to-br from-orange-500/20 to-white/5
          border border-orange-500/20
          flex items-center justify-center
        ">
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-orange-300" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs
                          bg-white/5 border border-white/10 text-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-300" />
            {mainLabel}
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {subLabel}
          </h1>

        <p className="mt-1 text-sm text-gray-200">
            En yeni ürünleri aşağıdan keşfet.
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 rounded-2xl px-3 py-2
                      bg-white/5 border border-white/10 text-gray-200">
        <span className="text-xs">Toplam</span>
        <span className="font-bold text-white">{products.length}</span>
      </div>
    </div>
  </div>
</div>


      {/* ÜRÜNLER */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCardVertical key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-yellow-400">Yakında ...</h2>
          <p className="text-gray-400">Bu kategoride ürün bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
