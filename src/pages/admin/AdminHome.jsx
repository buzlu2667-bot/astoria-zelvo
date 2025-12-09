import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";


export default function AdminHome() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(p =>
  p.title.toLowerCase().includes(search.toLowerCase())
);


  // -------------------------
  // ⭐ 1) HAFTANIN FIRSATI
  // -------------------------
  const [hf, setHf] = useState(null);
  const [hfProduct, setHfProduct] = useState("");
  const [hfDiscount, setHfDiscount] = useState("");
  const [hfNote, setHfNote] = useState("");

  const [hfActive, setHfActive] = useState(true);

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
    const { data } = await supabase
      .from("haftanin_firsati")
      .select("*")
      .maybeSingle();

    if (data) {
      setHf(data);
      setHfProduct(data.product_id);
      setHfDiscount(data.discount_percent);
      setHfNote(data.note);
      setHfActive(data.active);

    }
  }

  // ⭐ Haftanın Fırsatı KAYDET
  async function saveHafta() {
    if (!hf) {
      await supabase.from("haftanin_firsati").insert([
        {
          product_id: hfProduct,
          discount_percent: Number(hfDiscount),
          note: hfNote,
           active: hfActive
        },
      ]);
    } else {
      await supabase
        .from("haftanin_firsati")
        .update({
          product_id: hfProduct,
          discount_percent: Number(hfDiscount),
          note: hfNote,
          updated_at: new Date(),
           active: hfActive
        })
        .eq("id", hf.id);
    }

    loadHafta();
    alert("Haftanın Fırsatı Kaydedildi!");
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
          Kaydet
        </button>
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
