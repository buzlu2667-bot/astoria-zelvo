import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { X, Upload, Images, ImagePlus, Loader } from "lucide-react";


function localToISO(localStr) {
  const [date, time] = localStr.split("T");
  return `${date}T${time}:00`; // DOKUNMA – browser artık UTC’ye çeviremez
}

function isoToLocal(iso) {
  return iso.slice(0, 16);
}




// ⚡ Türkçe – emoji – boşluk temizleyici
function sanitizeFilename(name) {
  return name
    .normalize("NFD")                 // ç, ğ, ö → c, g, o
    .replace(/[\u0300-\u036f]/g, "")  // aksanları sil
    .replace(/[^a-zA-Z0-9.\-_]/g, "_"); // boşluk, emoji, Türkçe karakterleri _ yap
}


export default function AddProductModal({ onClose, onSuccess, initialData }) {
  
  const [load, setLoad] = useState(false);

  const [mainCats, setMainCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [serverCats, setServerCats] = useState([]);

  

  // 🔥 DÜZENLEME MODU → initialData GELDİYSE FORMU DOLDUR
useEffect(() => {
  if (initialData) {
    setForm({
      title: initialData.title ?? "",
      description: initialData.description ?? "",
      price: initialData.price ?? "",
      old_price: initialData.old_price ?? "",
      cost_price: initialData.cost_price ?? "",
      stock: initialData.stock ?? "",

      main_id: initialData.main_id || "",
      sub_id: initialData.sub_id || "",
      server_id: initialData.server_id || "",
      is_new: initialData.is_new || false,
      is_popular: initialData.is_popular || false,
      is_featured: initialData.is_featured || false,
       colors: initialData.colors || "" ,
       is_selected: initialData.is_selected || false,

       
       deal_active: initialData.deal_active || false,
deal_end_at: initialData.deal_end_at
  ? isoToLocal(initialData.deal_end_at)
  : "",


       
    });

    // kategorileri yükle
    if (initialData.main_id) loadSub(initialData.main_id);
    if (initialData.sub_id) loadServer(initialData.sub_id);
  }
}, [initialData]);


 const [form, setForm] = useState({
  title: "",
  description: "",
  price: "",
  old_price: "", 
 cost_price: "",   
  stock: "",
  main_id: "",
  sub_id: "",
  server_id: "",
  is_new: false,     
  is_popular: false,
is_featured: false,
 is_suggested: false, 
  is_selected: false,
 colors: "",

 // ⏱ SAYAÇ
  deal_active: false,
  deal_end_at: "",

});


  // FOTO STATE
  const [mainImg, setMainImg] = useState(null);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    loadMain();
  }, []);

  async function loadMain() {
    const { data } = await supabase.from("main_categories").select("*");
    setMainCats(data || []);
  }

  async function loadSub(id) {
    const { data } = await supabase
      .from("sub_categories")
      .select("*")
      .eq("main_id", id);

    setSubCats(data || []);
  }

  async function loadServer(id) {
    const { data } = await supabase
      .from("server_categories")
      .select("*")
      .eq("sub_id", id);

    setServerCats(data || []);
  }

  // ----------------------------------------
  // FOTO UPLOAD HELPER
  // ----------------------------------------
  async function uploadFile(file, path) {
    const { error } = await supabase.storage
      .from("products")
      .upload(path, file, {
        upsert: true,
      });

    if (error) throw error;

    return supabase.storage
      .from("products")
      .getPublicUrl(path).data.publicUrl;
  }

  // ----------------------------------------
  // ÜRÜN KAYDET
  // ----------------------------------------
  async function save() {
   // Kategori mecbur değil artık
if (!form.title || !form.price) {
  alert("Lütfen Ürün Başlığı ve Fiyatını girin!");
  return;
}


    setLoad(true);

    // Ana foto
    let mainUrl = null;
    if (mainImg) {
     mainUrl = await uploadFile(
  mainImg,
  `main/${Date.now()}-${sanitizeFilename(mainImg.name)}`
);

    }

    // Galeri
    let galleryUrls = [];
    for (const g of gallery) {
    const url = await uploadFile(
  g,
  `gallery/${Date.now()}-${sanitizeFilename(g.name)}`
);

      galleryUrls.push(url);
    }


// --------------------------------------------------
// 🔥 EĞER initialData varsa → INSERT değil UPDATE!
// --------------------------------------------------
if (initialData) {
  const { error } = await supabase
    .from("products")
    .update({
      title: form.title,
      description: form.description,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
     cost_price:
    form.cost_price === ""
      ? null
      : Number(form.cost_price),
      stock: Number(form.stock || 0),
      main_id: form.main_id || null,
      sub_id: form.sub_id || null,
      server_id: form.server_id || null,
      is_new: form.is_new,
      is_popular: form.is_popular,
      is_featured: form.is_featured,
      is_selected: form.is_selected,
      is_suggested: form.is_suggested,
       colors: form.colors,

       deal_active: form.deal_active,
deal_end_at: form.deal_active
  ? localToISO(form.deal_end_at)
  : null,




      // fotoğraflar sadece yeni seçildiyse güncellenecek
      ...(mainImg && { main_img: mainUrl }),
      ...(gallery.length > 0 && { gallery: galleryUrls }),
    })
    .eq("id", initialData.id);

  setLoad(false);

  if (!error) {
    onSuccess();
    onClose();
  }
  
  return; // ⬅ UPDATE BİTTİ
}



  const { error } = await supabase.from("products").insert({
  title: form.title,
  description: form.description,

  price: Number(form.price),
  old_price: form.old_price ? Number(form.old_price) : null,

  cost_price:
    form.cost_price === ""
      ? null
      : Number(form.cost_price),

  stock: Number(form.stock || 0),

  main_id: form.main_id || null,
  sub_id: form.sub_id || null,
  server_id: form.server_id || null,

  deal_active: form.deal_active,
 deal_end_at: form.deal_active
  ? localToISO(form.deal_end_at)
  : null,



  is_new: form.is_new,
  is_popular: form.is_popular,
  is_featured: form.is_featured,
  is_suggested: form.is_suggested,
  is_selected: form.is_selected,

  colors: form.colors,

  main_img: mainUrl,
  gallery: galleryUrls,
});


    setLoad(false);

    if (!error) {
      onSuccess();
      onClose();
    } else {
      console.error(error);
      alert("Kayıt hatası!");
    }
  }

  return (
   <div className="
  fixed inset-0 bg-black/60 backdrop-blur-sm z-50 
  flex justify-center items-start 
  pt-[100px]            /* ⭐ MODALI AŞAĞI İTİYOR   */
">

<div className="
  w-[95%] max-w-[700px]
  max-h-[90vh]               /* ⭐ MAX YÜKSEKLİK */
  overflow-y-auto            /* ⭐ SCROLL */
  bg-[#0d0d0d]
  border border-[#1f1f1f]
  p-6 rounded-2xl
  shadow-[0_0_20px_#00ffbb50]
  relative
">


        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-red-400"
        >
          <X size={28} />
        </button>

        <h1 className="text-xl font-bold mb-4 text-white">
          🛒 Yeni Ürün Ekle (Maximora Premium)
        </h1>

        <div className="grid grid-cols-2 gap-4">

          {/* Title */}
          <input
            type="text"
            placeholder="Ürün başlığı"
            className="input-premium"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
{/* Old Price */}
<input
  type="number"
  placeholder="Eski Fiyat ₺ (İndirim Etiketi)"
  className="input-premium"
  value={form.old_price}
  onChange={(e) => setForm({ ...form, old_price: e.target.value })}
/>
{/* 🔥 Vitrin Ayarları */}
<div className="col-span-2 grid grid-cols-3 gap-3 mt-2 text-white">

  {/* ⏱ ÜRÜN SAYAÇ AYARI */}
<div className="col-span-2 mt-4 p-3 border border-[#333] rounded-lg text-white">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={form.deal_active}
      onChange={(e) =>
        setForm({ ...form, deal_active: e.target.checked })
      }
    />
    <span>⏱ Bu üründe sayaç olsun</span>
  </label>

  {form.deal_active && (
    <input
      type="datetime-local"
      className="input-premium mt-3"
      value={form.deal_end_at}
      onChange={(e) =>
        setForm({ ...form, deal_end_at: e.target.value })
      }
    />
  )}
</div>


  {/* Yeni Gelen */}
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={form.is_new}
      onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
    />
    <span>🆕 Yeni</span>
  </label>

  {/* Popüler */}
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={form.is_popular}
      onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
    />
    <span>⭐ Popüler</span>
  </label>

  {/* Öne Çıkan */}
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={form.is_featured}
      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
    />
    <span>🔥 Öne Çıkan</span>
  </label>
<label className="flex items-center gap-2 text-white">
  <input
    type="checkbox"
    checked={form.is_selected}
    onChange={(e) => setForm({ ...form, is_selected: e.target.checked })}
  />
  <span>⭐ Seçili Ürün (Ücretsiz Kargo)</span>
</label>

</div>

{/* İlginizi Çekebilir */}
<label className="flex items-center gap-2 mt-2 text-white">
  <input
    type="checkbox"
    checked={form.is_suggested}
    onChange={(e) => setForm({ ...form, is_suggested: e.target.checked })}
  />
  <span>🎯 İlginizi Çekebilir</span>
</label>


{/* Yeni ürün etiketi */}
<div className="flex items-center gap-2 text-white">
  <input
    type="checkbox"
    checked={form.is_new}
    onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
  />
  <span className="text-sm">🔥 Yeni Ürün</span>
</div>

          {/* Price */}
          <input
            type="number"
            placeholder="Fiyat ₺"
            className="input-premium"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          {/* Maliyet (Cost Price) */}
<input
  type="number"
  placeholder="Maliyet ₺"
  className="input-premium"
  value={form.cost_price}
  onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
/>


          {/* Stock */}
          <input
            type="number"
            placeholder="Stok"
            className="input-premium"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          {/* Main Category */}
          <select
            className="input-premium"
            value={form.main_id}
            onChange={(e) => {
              setForm({ ...form, main_id: e.target.value, sub_id: "", server_id: "" });
              loadSub(e.target.value);
            }}
          >
            <option value="">Ana Kategori Seç</option>
            {mainCats.map((c) => (
              <option value={c.id} key={c.id}>{c.title}</option>
            ))}
          </select>

          {/* Sub Category */}
          <select
            className="input-premium"
            value={form.sub_id}
            disabled={!form.main_id}
            onChange={(e) => {
              setForm({ ...form, sub_id: e.target.value, server_id: "" });
              loadServer(e.target.value);
            }}
          >
            <option value="">Alt Kategori</option>
            {subCats.map((c) => (
              <option value={c.id} key={c.id}>{c.title}</option>
            ))}
          </select>

          {/* Server Category */}
          <select
            className="input-premium"
            value={form.server_id}
            disabled={!form.sub_id}
            onChange={(e) => setForm({ ...form, server_id: e.target.value })}
          >
            <option value="">Server / İç Kategori</option>
            {serverCats.map((c) => (
              <option value={c.id} key={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <textarea
          placeholder="Açıklama"
          className="input-premium w-full mt-4 h-28 resize-none"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* ⭐ Ürün Renkleri */}
<textarea
  placeholder="Renkler (ör: kırmızı, mavi, siyah)"
  className="input-premium w-full mt-4 h-24 resize-none"
  value={form.colors}
  onChange={(e) => setForm({ ...form, colors: e.target.value })}
/>



        {/* ANA FOTO */}
        <div className="mt-4">
          <label className="text-white font-semibold mb-1 block">
            📌 Ana Foto
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMainImg(e.target.files[0])}
            className="text-white"
          />

          {mainImg && (
            <img
              src={URL.createObjectURL(mainImg)}
              alt="preview"
              className="w-32 h-32 object-cover mt-2 rounded-lg border border-[#222]"
            />
          )}
        </div>

        {/* GALERİ */}
        <div className="mt-4">
          <label className="text-white font-semibold mb-1 block">
            🖼 Yan Foto Galerisi (Sınırsız)
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setGallery([...gallery, ...Array.from(e.target.files)])
            }
            className="text-white"
          />

          {gallery.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {gallery.map((g, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(g)}
                  className="w-20 h-20 object-cover rounded border border-[#222]"
                />
              ))}
            </div>
          )}
        </div>

        {/* Kaydet */}
        <button
          onClick={save}
          className="mt-6 w-full py-3 rounded-xl bg-[#00ffbb20] border border-[#00ffbb50] text-[#00ffdd] hover:bg-[#00ffbb40] transition font-semibold flex justify-center items-center gap-2"
        >
          {load && <Loader className="animate-spin" size={20} />}
          ÜRÜNÜ KAYDET
        </button>
      </div>
    </div>
  );
}
