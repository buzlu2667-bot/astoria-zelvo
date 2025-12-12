import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";

export default function CategorySub() {
  const { mainSlug, subSlug } = useParams();

  const [products, setProducts] = useState([]);
  const [subCat, setSubCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true; // StrictMode koruması

    async function loadData() {
      setLoading(true);

      // 🔥 ALT KATEGORİ
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

      // 🔥 ÜRÜNLER
    const { data: prods, error: prodErr } = await supabase
  .from("products")
  .select("*")
  .eq("sub_id", sub.id)
  .order("created_at", { ascending: false }); // 🚀 YENİ ÜRÜN EN ÜSTE

        

      if (!alive) return;
      if (prodErr) console.error(prodErr);

      setProducts(prods || []);
      setLoading(false);
    }

    loadData();

    return () => {
      alive = false; // ikinci render’da state çakışmasını engeller
    };
  }, [mainSlug, subSlug]);

 


  if (loading)
    return (
      <p className="text-center text-white mt-20 animate-pulse">
        Yükleniyor...
      </p>
    );

  return (
  <div className="max-w-7xl mx-auto px-4 pt-[110px] pb-10 text-white">
      {/* BAŞLIK */}
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        {subCat?.title}
      </h1>

      {/* ÜRÜNLER */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
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
