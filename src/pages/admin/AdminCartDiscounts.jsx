import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminCartDiscounts() {
  const [rows, setRows] = useState([]);
  const [minQty, setMinQty] = useState("");
  const [percent, setPercent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("cart_discounts")
      .select("*")
      .order("min_quantity", { ascending: true });

    setRows(data || []);
  }

  async function addRule() {
    if (!minQty || !percent) {
      alert("Boş bırakma kanka");
      return;
    }

    setLoading(true);

    await supabase.from("cart_discounts").insert([
      {
        min_quantity: Number(minQty),
        discount_percent: Number(percent),
        active: true,
      },
    ]);

    setMinQty("");
    setPercent("");
    setLoading(false);
    load();
  }

  async function removeRule(id) {
    if (!window.confirm("Silinsin mi?")) return;
    await supabase.from("cart_discounts").delete().eq("id", id);
    load();
  }

  async function toggleRule(id, active) {
  await supabase
    .from("cart_discounts")
    .update({ active: !active })
    .eq("id", id);

  load();
}


  return (
    <div className="max-w-4xl mx-auto mt-24 p-6 bg-white rounded-2xl shadow-xl text-gray-800">

      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🛒 Sepet İndirim Kuralları
      </h1>

      {/* ➕ EKLE */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="number"
          placeholder="Min ürün adedi (örn: 2)"
          value={minQty}
          onChange={(e) => setMinQty(e.target.value)}
          className="
            w-full
            bg-white
            text-gray-800
            placeholder-gray-400
            border border-gray-300
            px-4 py-3
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-orange-400
          "
        />

        <input
          type="number"
          placeholder="İndirim % (örn: 5)"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          className="
            w-full
            bg-white
            text-gray-800
            placeholder-gray-400
            border border-gray-300
            px-4 py-3
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-orange-400
          "
        />

        <button
          onClick={addRule}
          disabled={loading}
          className="
            bg-[#f27a1a]
            text-white
            px-6
            rounded-lg
            font-bold
            hover:opacity-90
            disabled:opacity-50
          "
        >
          Ekle
        </button>
      </div>

      {/* 📋 LİSTE */}
      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="
              flex items-center justify-between
              bg-gray-50
              border border-gray-200
              rounded-lg
              px-4 py-3
            "
          >
            <div className="text-gray-700 font-medium">
              <b>{r.min_quantity}</b> ürün →{" "}
              <span className="text-green-600 font-bold">
                %{r.discount_percent}
              </span>{" "}
              indirim
            </div>

          <div className="flex items-center gap-3">
  <button
    onClick={() => toggleRule(r.id, r.active)}
    className={`
      px-3 py-1 rounded-md text-sm font-bold
      ${r.active
        ? "bg-green-100 text-green-700"
        : "bg-gray-200 text-gray-600"}
    `}
  >
    {r.active ? "Açık" : "Kapalı"}
  </button>

  <button
    onClick={() => removeRule(r.id)}
    className="text-red-600 font-bold hover:underline"
  >
    Sil
  </button>
</div>

          </div>
        ))}
      </div>
    </div>
  );
}
