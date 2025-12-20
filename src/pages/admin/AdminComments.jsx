import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSession } from "../../context/SessionContext";
import { useNavigate } from "react-router-dom";

export default function AdminComments() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return navigate("/");

    (async () => {
      // admin mi?
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (!prof?.is_admin) {
        navigate("/");
        return;
      }

      // onay bekleyen yorumlar
     const { data } = await supabase
  .from("comments")
  .select(`
    id,
    text,
    rating,
    created_at,
    name,
    product_id,
    approved,
    products ( title )
  `)
  .eq("approved", false)
  .order("created_at", { ascending: false });


      setComments(data || []);
      setLoading(false);
    })();
  }, [session, navigate]);

  if (loading) return <p className="p-6">Yükleniyor…</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        🛠️ Yorum Onay Paneli
      </h1>

      {comments.length === 0 && (
        <p className="text-gray-500">Onay bekleyen yorum yok.</p>
      )}

    {comments.map((c) => (
  <div
    key={c.id}
    className="
      mb-5
      rounded-2xl
      border border-gray-200
      bg-white
      shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]
      p-5
      transition
      hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]
    "
  >
    {/* ÜST BAR */}
    <div className="flex items-start justify-between gap-4">
      <div>
        {/* İSİM */}
        <p className="text-lg font-bold text-gray-900 leading-tight">
          {c.name}
        </p>

        {/* ÜRÜN */}
        <span className="
          inline-block mt-1
          text-xs font-semibold
          text-indigo-700
          bg-indigo-50
          border border-indigo-200
          px-2 py-[2px]
          rounded-full
        ">
          {c.products?.title}
        </span>
      </div>

      {/* YILDIZ */}
      <div className="flex items-center gap-1 text-orange-500">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < c.rating ? "opacity-100" : "opacity-20"}
          >
            ★
          </span>
        ))}
      </div>
    </div>

    {/* YORUM METNİ */}
    <p className="
      mt-4
      text-gray-700
      text-sm
      leading-relaxed
      bg-gray-50
      border border-gray-200
      rounded-xl
      px-4 py-3
    ">
      {c.text}
    </p>

    {/* ALT BAR */}
    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
      {/* TARİH */}
      <span className="text-xs text-gray-400">
        {new Date(c.created_at).toLocaleString("tr-TR")}
      </span>

      {/* AKSİYONLAR */}
      <div className="flex gap-2">
        <button
        onClick={async () => {
  // 1️⃣ Yorumu onayla
  await supabase
    .from("comments")
    .update({ approved: true })
    .eq("id", c.id);

  // 2️⃣ Rating güncelle
  const { data: ratings } = await supabase
    .from("comments")
    .select("rating")
    .eq("product_id", c.product_id)
    .eq("approved", true);

  if (ratings?.length) {
    const total = ratings.reduce((s, r) => s + r.rating, 0);
    const avg = total / ratings.length;

    await supabase
      .from("products")
      .update({
        rating_avg: Number(avg.toFixed(1)),
        rating_count: ratings.length,
      })
      .eq("id", c.product_id);
  }

  // 3️⃣ Listeden kaldır
  setComments((prev) =>
    prev.filter((x) => x.id !== c.id)
  );

  // ✅ TOAST
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "success",
        text: "Yorum onaylandı ve ürüne eklendi ✅",
      },
    })
  );
}}

          className="
            px-4 py-2
            rounded-xl
            bg-emerald-600
            text-white
            text-sm font-semibold
            hover:bg-emerald-700
            transition
          "
        >
          ✓ Onayla
        </button>

        <button
        onClick={async () => {
  await supabase
    .from("comments")
    .delete()
    .eq("id", c.id);

  setComments((prev) =>
    prev.filter((x) => x.id !== c.id)
  );

  // 🗑️ TOAST
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "error",
        text: "Yorum silindi ❌",
      },
    })
  );
}}

          className="
            px-4 py-2
            rounded-xl
            bg-red-600
            text-white
            text-sm font-semibold
            hover:bg-red-700
            transition
          "
        >
          ✕ Sil
        </button>
      </div>
    </div>
  </div>
))}

    </div>
  );
}
