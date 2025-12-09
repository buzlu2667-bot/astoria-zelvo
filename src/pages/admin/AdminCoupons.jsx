import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const TRY = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "%",
    value: "",
    min_amount: "",
    usage_limit: "",
    is_active: true,
    expires_at: "",
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons(data || []);
  }

 async function saveCoupon(e) {
  e.preventDefault();
  setLoading(true);

  const payload = {
  ...form,
  value: Number(form.value),
  min_amount: form.min_amount ? Number(form.min_amount) : null,
  usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
  // 🔽🔽 EKLEYELİM
  used_count: 0,
  // opsiyonel: tarih alanı boşsa null gönder
  expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
  created_at: new Date().toISOString(),
};


  let res;

  if (editing) {
    res = await supabase.from("coupons").update(payload).eq("id", editing);
  } else {
    res = await supabase.from("coupons").insert([payload]);
  }

  console.log("🔥 INSERT RESULT:", res); // ✅ Hata detayını buraya basıyoruz

  if (res.error) {
    alert("Hata: " + res.error.message);
    console.error(res.error);
    setLoading(false);
    return;
  }

  setLoading(false);
  resetForm();
  fetchCoupons();
}


  function resetForm() {
    setEditing(null);
    setForm({
      code: "",
      type: "%",
      value: "",
      min_amount: "",
      usage_limit: "",
      is_active: true,
      expires_at: "",
    });
  }

  async function remove(id) {
    if (!confirm("Kuponu silmek istiyor musun?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    fetchCoupons();
  }

  return (
   <div className="text-white space-y-6 mt-24">

      <h1 className="text-2xl font-bold text-yellow-400">🎟 Kupon Yönetimi</h1>

      {/* ✅ Kupon Formu */}
      <form
        onSubmit={saveCoupon}
        className="grid grid-cols-2 gap-3 bg-neutral-900 p-4 rounded-lg border border-neutral-700"
      >
        <input
          className="bg-neutral-800 p-2 rounded"
          placeholder="Kod (örn: TECH10)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          required
        />

        <select
          className="bg-neutral-800 p-2 rounded"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="%">% Yüzdelik</option>
          <option value="₺">₺ Sabit</option>
        </select>

        <input
          type="number"
          className="bg-neutral-800 p-2 rounded"
          placeholder="İndirim değeri"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          required
        />

        <input
          type="number"
          className="bg-neutral-800 p-2 rounded"
          placeholder="Min. Sepet Tutarı"
          value={form.min_amount}
          onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
        />

        <input
          type="number"
          className="bg-neutral-800 p-2 rounded"
          placeholder="Kullanım Limiti"
          value={form.usage_limit}
          onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
        />

        <input
          type="datetime-local"
          className="bg-neutral-800 p-2 rounded"
          value={form.expires_at}
          onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
        />

        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Aktif Kupon
        </label>

        <button
          type="submit"
          className="col-span-2 bg-green-600 hover:bg-green-700 rounded p-2 font-bold"
          disabled={loading}
        >
          {editing ? "Güncelle" : "Ekle"}
        </button>
      </form>

      {/* ✅ Kupon Listesi */}
      <table className="w-full text-sm border border-neutral-700 rounded-lg overflow-hidden">
        <thead className="bg-neutral-800">
          <tr className="text-gray-400 text-left">
            <th className="p-3">Kod</th>
            <th className="p-3">Tip</th>
            <th className="p-3">Değer</th>
            <th className="p-3">Min</th>
            <th className="p-3">Limit</th>
            <th className="p-3">Durum</th>
            <th className="p-3 text-center">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="border-t border-neutral-700">
              <td className="p-3 font-bold">{c.code}</td>
              <td className="p-3">{c.type}</td>
              <td className="p-3">{c.type === "%" ? `%${c.value}` : TRY.format(c.value)}</td>
              <td className="p-3">{c.min_amount || "-"}</td>
              <td className="p-3">{c.usage_limit || "-"}</td>
              <td className="p-3">{c.is_active ? "✅ Aktif" : "⛔ Kapalı"}</td>

              <td className="p-3 text-center">
                <button
                  onClick={() => {
                    setEditing(c.id);
                    setForm({
                      code: c.code,
                      type: c.type,
                      value: c.value,
                      min_amount: c.min_amount,
                      usage_limit: c.usage_limit,
                      is_active: c.is_active,
                      expires_at: c.expires_at?.slice(0, 16) || "",
                    });
                  }}
                  className="text-yellow-400 mr-3"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="text-red-500"
                >
                  Sil 🗑️
                </button>
              </td>
            </tr>
          ))}

          {coupons.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-4 text-gray-500">
                Henüz kupon yok.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
