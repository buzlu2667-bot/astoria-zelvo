import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";


export default function AdminHome() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [hfEndAt, setHfEndAt] = useState("");

  const filteredProducts = products.filter(p =>
  p.title.toLowerCase().includes(search.toLowerCase())
);


  // -------------------------
  // ⭐ 1) HAFTANIN FIRSATI
  // -------------------------
const [hfList, setHfList] = useState([]);
  const [hfProduct, setHfProduct] = useState("");
  const [hfDiscount, setHfDiscount] = useState("");
  const [hfNote, setHfNote] = useState("");

  const [hfActive, setHfActive] = useState(true);
  const [editingHaftaId, setEditingHaftaId] = useState(null);


  // -------------------------
  // ⭐ 2) KAMPANYALAR (TrendYol Tipi)
  // -------------------------
  const [campaigns, setCampaigns] = useState([]);
  const [campaignProducts, setCampaignProducts] = useState({});

  useEffect(() => {
    loadProducts();
    loadHafta();
    loadCampaigns();
  }, []);

  // -------------------------------------
  // ÜRÜNLERİ ÇEK
  // -------------------------------------
  async function loadProducts() {
   const { data } = await supabase
  .from("products")
  .select("id, title, main_img")
  .order("id", { ascending: false });  // 🔥 EN YENİ EN ÜSTTE


    setProducts(data || []);
  }

  // -------------------------------------
  // ⭐ Haftanın Fırsatı YÜKLE
  // -------------------------------------
 async function loadHafta() {
  const { data, error } = await supabase
    .from("haftanin_firsati")
    .select("*, products(id,title,main_img)")
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) console.error("LOAD HAFTA ERROR:", error);
  setHfList(data || []);
}


  // ⭐ Haftanın Fırsatı KAYDET
 async function saveHafta() {
  if (!hfProduct) return alert("Ürün seç!");

  const payload = {
    product_id: hfProduct,
    discount_percent: Number(hfDiscount) || 0,
    note: hfNote || "",
    active: hfActive,
    end_at: hfEndAt ? new Date(hfEndAt).toISOString() : null,
    updated_at: new Date(),
  };

  let error;

  if (editingHaftaId) {
    // ✏️ DÜZENLE
    ({ error } = await supabase
      .from("haftanin_firsati")
      .update(payload)
      .eq("id", editingHaftaId));
  } else {
    // ➕ YENİ EKLE
    ({ error } = await supabase
      .from("haftanin_firsati")
      .insert([payload]));
  }

  if (error) {
    console.error("SAVE HAFTA ERROR:", error);
    return alert("Hata var, console bak.");
  }

  // 🔄 FORM RESET
  setHfProduct("");
  setHfDiscount("");
  setHfNote("");
  setHfActive(true);
  setHfEndAt("");
  setEditingHaftaId(null);

  loadHafta();
  alert(editingHaftaId ? "Güncellendi!" : "Eklendi!");
}

// ✅ Haftanın Fırsatı: Sil
async function deleteHafta(id) {
  const { error } = await supabase.from("haftanin_firsati").delete().eq("id", id);
  if (error) console.error("DELETE HAFTA ERROR:", error);
  loadHafta();
}

// ✅ Haftanın Fırsatı: Aktif/Pasif
async function toggleHaftaActive(id, active) {
  const { error } = await supabase
    .from("haftanin_firsati")
    .update({ active, updated_at: new Date() })
    .eq("id", id);

  if (error) console.error("TOGGLE HAFTA ERROR:", error);
  loadHafta();
}

  // -----------------------------------------------------------------
  // ⭐ TRENDYOL TIPİ KAMPANYALAR: Kampanyalar + içindeki ürünleri yükle
  // -----------------------------------------------------------------
  async function loadCampaignProducts(cList) {
    const map = {};

    for (const c of cList) {
      const { data } = await supabase
       .from("home_campaign_products")
.select("*, products(*)")
.eq("campaign_id", c.id)
.order("id", { ascending: false });

      map[c.id] = data || [];
    }

    setCampaignProducts(map);
  }

  async function loadCampaigns() {
    const { data } = await supabase
      .from("home_campaigns")
      .select("*")
      .order("sort_index", { ascending: true });

    setCampaigns(data || []);
    loadCampaignProducts(data || []);
  }

  // Kampanya ekle
  async function addCampaign() {
    await supabase.from("home_campaigns").insert([
      {
        title: "Yeni Kampanya",
        sub_title: "",
        sort_index: campaigns.length,
        active: true,
      },
    ]);

    loadCampaigns();
  }

  // Kampanya güncelle
  async function updateCampaign(id, field, value) {
    await supabase.from("home_campaigns").update({ [field]: value }).eq("id", id);
    loadCampaigns();
  }

  // Kampanyaya ürün ekle
  async function addProductToCampaign(campaignId, productId) {
    if (!productId) return;

    await supabase.from("home_campaign_products").insert([
      {
        campaign_id: campaignId,
        product_id: productId,
      },
    ]);

    loadCampaigns();
  }

  // Kampanyadan ürün sil
  async function deleteProductFromCampaign(id) {
    await supabase.from("home_campaign_products").delete().eq("id", id);
    loadCampaigns();
  }

  // Stiller
  const inputClass = `
    w-full p-3 rounded-lg mt-1
    bg-[#1d1d1d]
    text-white
    border border-gray-600
    focus:border-yellow-400
  `;

  // -------------------------------------------------------------
  // 🔥 RETURN — SAYFA
  // -------------------------------------------------------------
  return (
   <div className="p-6 text-white mt-24">

      {/* ---------------------⭐ HAFTANIN FIRSATI --------------------- */}
      <h2 className="text-2xl font-bold mb-4">🔥 Haftanın Fırsatı</h2>

      <div className="bg-[#111] p-4 rounded-lg shadow mb-10 border border-gray-700">

        <label className="font-semibold">Ürün Seç</label>
       {/* 🔍 ÜRÜN ARAMA */}
<input
  type="text"
  placeholder="Ürün ara..."
  className={inputClass}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

<select
  className={inputClass}
  value={hfProduct}
  onChange={(e) => setHfProduct(e.target.value)}
>
  <option value="">Seçiniz</option>

  {filteredProducts.map((p) => (
    <option key={p.id} value={p.id}>{p.title}</option>
  ))}
</select>


        <label className="block font-semibold mt-4">İndirim (%)</label>
        <input
          type="number"
          className={inputClass}
          value={hfDiscount}
          onChange={(e) => setHfDiscount(e.target.value)}
        />

        <label className="block font-semibold mt-4">Not</label>
        <input
          className={inputClass}
          value={hfNote}
          onChange={(e) => setHfNote(e.target.value)}
        />

        <label className="block font-semibold mt-4">
  Bitiş Tarihi & Saati
</label>

<input
  type="datetime-local"
  className={inputClass}
  value={hfEndAt}
  onChange={(e) => setHfEndAt(e.target.value)}
/>


        <label className="block font-semibold mt-4">Aktif mi?</label>
<select
  className={inputClass}
  value={hfActive ? "1" : "0"}
  onChange={(e) => setHfActive(e.target.value === "1")}
>
  <option value="1">Aktif</option>
  <option value="0">Pasif</option>
</select>


      <button
  onClick={saveHafta}
  className="mt-4 bg-yellow-500 text-black font-bold px-5 py-2 rounded hover:bg-yellow-400"
>
  {editingHaftaId ? "Güncelle" : "Kaydet"}
</button>

      </div>

      {/* ✅ Ekli Haftanın Fırsatları (son 5) — Kaydet butonunun altı */}
<div className="mt-6">
  <p className="font-bold mb-2">Ekli Fırsatlar (son 5)</p>

  {hfList.length === 0 ? (
    <p className="text-gray-400 text-sm">Henüz eklenmemiş.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {hfList.map((x) => (
        <div
          key={x.id}
          className="bg-black border border-gray-700 rounded-lg p-3 flex gap-3"
        >
          <img
            src={x.products?.main_img}
            className="w-20 h-20 object-cover rounded"
          />

          <div className="flex-1">
            <p className="font-semibold text-sm">{x.products?.title}</p>
            <p className="text-xs text-gray-300 mt-1">
              %{x.discount_percent} — {x.note}
            </p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => toggleHaftaActive(x.id, !x.active)}
                className={`text-xs px-2 py-1 rounded ${
                  x.active ? "bg-yellow-500 text-black" : "bg-gray-600 text-white"
                }`}
              >
                {x.active ? "Aktif" : "Pasif"}
              </button>

              <button
                onClick={() => deleteHafta(x.id)}
                className="text-xs px-2 py-1 rounded bg-red-600"
              >
                Sil
              </button>
              <button
  onClick={() => {
    setEditingHaftaId(x.id);
    setHfProduct(x.product_id);
    setHfDiscount(x.discount_percent);
    setHfNote(x.note || "");
    setHfActive(x.active);
    setHfEndAt(
      x.end_at
        ? new Date(x.end_at).toISOString().slice(0, 16)
        : ""
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  className="text-xs px-2 py-1 rounded bg-blue-600"
>
  Düzenle
</button>

            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


      {/* ----------------⭐ VİTRİN / KAMPANYA BLOKLARI ---------------- */}
      <h2 className="text-2xl font-bold mb-4">🎯 Vitrin / Kampanya Blokları</h2>

      <button
        onClick={addCampaign}
        className="mb-4 bg-green-600 px-4 py-2 rounded text-white"
      >
        + Kampanya Ekle
      </button>

      <div className="space-y-6">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-[#111] p-4 rounded-lg border border-gray-700">

            <input
              className={inputClass}
              value={c.title}
              onChange={(e) => updateCampaign(c.id, "title", e.target.value)}
            />

            <input
              className={inputClass}
              value={c.sub_title}
              onChange={(e) => updateCampaign(c.id, "sub_title", e.target.value)}
            />

            {/* ⭐⭐ İKON + RENK BURAYA EKLENİYOR ⭐⭐ */}
<label className="block font-semibold mt-3">Başlık ikonu</label>
<input
  className={inputClass}
  value={c.icon || ""}
  onChange={(e) => updateCampaign(c.id, "icon", e.target.value)}
  placeholder="örn: Flame, Star, Gift, Sparkles"
/>

<label className="block font-semibold mt-3">Başlık rengi</label>
<input
  className={inputClass}
  type="color"
  value={c.color || "#ff3b30"}
  onChange={(e) => updateCampaign(c.id, "color", e.target.value)}
/>

            <label className="block font-semibold mt-3">Ürün ekle</label>
          {/* 🔍 ÜRÜN ARAMA */}
<input
  type="text"
  placeholder="Ürün ara..."
  className={inputClass}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

<select
  className={inputClass}
  onChange={(e) => addProductToCampaign(c.id, e.target.value)}
>
  <option value="">Seçiniz</option>

  {filteredProducts.map((p) => (
    <option key={p.id} value={p.id}>{p.title}</option>
  ))}
</select>

            <label className="block font-semibold mt-3">Aktif mi?</label>
<select
  className={inputClass}
  value={c.active ? "1" : "0"}
  onChange={(e) => updateCampaign(c.id, "active", e.target.value === "1")}
>
  <option value="1">Aktif</option>
  <option value="0">Pasif</option>
</select>


            {/* Kampanyaya eklenen ürünler */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {(campaignProducts[c.id] || []).map((item) => (
                <div key={item.id} className="relative bg-black rounded p-2">
                  <img
                    src={item.products.main_img}
                    className="w-full h-32 object-cover rounded"
                  />

                  <p className="text-sm mt-1">{item.products.title}</p>

                  <button
                    onClick={() => deleteProductFromCampaign(item.id)}
                    className="absolute top-1 right-1 bg-red-600 text-xs px-2 py-1 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
