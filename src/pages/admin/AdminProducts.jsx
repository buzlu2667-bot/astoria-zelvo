// ✅ src/pages/admin/AdminProducts.jsx — Premium Product Manager
// - Supabase public URL + local assets desteği
// - Eski fiyat, indirim yüzdesi
// - Stok rozetleri (Tükendi / Az Kaldı / Stokta)
// - Çoklu galeri yükleme (ekleme mantığı)
// - Edit modunda ana görsel & galeri önizleme
// - Thumbnail'lar tam oturur (object-cover + aspect-square)
// - Sağlam hata/bildirimler (window.dispatchEvent('toast', ...))

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// -------------------------------------
// Helpers
// -------------------------------------
const PLACEHOLDER = "/assets/placeholder-product.png";

// Tek satırda her şeyi çözen görsel resolver:
// - http(s) ile başlıyorsa -> direkt kullan
// - boşsa -> placeholder
// - aksi halde 'src/assets/products/<ad>' kabul et
function resolveImage(src) {
  if (!src) return PLACEHOLDER;
  const s = String(src);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // local asset ismi (örn: "canta1.png" ya da "products/canta1.png")
  const clean = s.replace(/^\/?src\/assets\/products\//, "").replace(/^\/+/, "");
  return `/src/assets/products/${clean}`;
}

function toNum(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function pct(oldP, price) {
  const o = toNum(oldP, 0);
  const p = toNum(price, 0);
  if (o > p && p > 0) return Math.round(((o - p) / o) * 100);
  return 0;
}

function stockBadge(stock) {
  const s = toNum(stock, 0);
  if (s <= 0) return { text: "Tükendi", cls: "bg-red-600/20 text-red-400" };
  if (s <= 3) return { text: "Az Kaldı", cls: "bg-yellow-600/20 text-yellow-400" };
  return { text: "Stokta", cls: "bg-green-600/20 text-green-400" };
}

// -------------------------------------
// Component
// -------------------------------------
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // product id
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Previews
  const [preview, setPreview] = useState(null); // ana görsel (file seçilince)
  const [galleryPreviews, setGalleryPreviews] = useState([]); // çoklu dosya önizleme

  // Form
  const [form, setForm] = useState({
    name: "",
    price: "",
    old_price: "",
    stock: "",
    category: "",
    description: "",
    image: null,        // File (primary)
    image_url: null,    // string (public URL or local name)
    gallery_files: [],  // File[] (multiple)
    gallery: [],        // string[] (public URLs or local names)
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast("❌ Ürünler yüklenemedi!", "error");
    }
    setProducts(data || []);
  }

  // ---------------- Uploads ----------------
  async function uploadToBucket(file) {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const fileName = `prod_${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data?.publicUrl || null;
  }

  async function uploadMany(files) {
    const arr = Array.from(files || []);
    const urls = [];
    for (const f of arr) {
      // eslint-disable-next-line no-await-in-loop
      const u = await uploadToBucket(f);
      if (u) urls.push(u);
    }
    return urls;
  }

  // ---------------- Save ----------------
  async function save(e) {
    e.preventDefault();
    try {
      setLoading(true);

      // 1) Ana görsel
      let image_url = form.image_url || null;
      if (form.image) {
        const up = await uploadToBucket(form.image);
        if (up) image_url = up;
      }

      // 2) Galeri (append)
      let gallery = Array.isArray(form.gallery) ? [...form.gallery] : [];
      if (form.gallery_files && form.gallery_files.length > 0) {
        const ups = await uploadMany(form.gallery_files);
        gallery = [...gallery, ...ups];
      }

      // 3) Payload
     const payload = {
  name: form.name,
  price: toNum(form.price, 0),
  old_price: form.old_price ? toNum(form.old_price, null) : null,
  stock: toNum(form.stock, 0),
  // ✅ Eğer kategori boşsa null kaydediyoruz (anasayfa ürünü demek)
  category: form.category.trim() === "" ? null : form.category.trim(),
  description: form.description || null,
  image_url,
  gallery: gallery.length ? gallery : null,
};


      // 4) Insert / Update
      if (editing) {
        await supabase.from("products").update(payload).eq("id", editing);
      } else {
        await supabase.from("products").insert([payload]);
      }

      toast("✅ Ürün kaydedildi!", "success");
      resetForm();
      setShowForm(false);
      setEditing(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast("❌ Kayıt sırasında hata oluştu!", "error");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      price: "",
      old_price: "",
      stock: "",
      category: "",
      description: "",
      image: null,
      image_url: null,
      gallery_files: [],
      gallery: [],
    });
    setPreview(null);
    setGalleryPreviews([]);
  }

  // ---------------- Remove ----------------
  async function remove(id, image_url, gallery = []) {
    if (!confirm("Ürünü silmek istiyor musun?")) return;

    try {
      // Best-effort storage cleanup:
      const keys = [];
      const tryPush = (url) => {
        if (typeof url === "string" && url.includes("/product-images/")) {
          const k = url.split("/product-images/")[1];
          if (k) keys.push(k);
        }
      };
      if (image_url) tryPush(image_url);
      (gallery || []).forEach(tryPush);
      if (keys.length) {
        await supabase.storage.from("product-images").remove(keys);
      }
    } catch (e) {
      console.warn("Storage cleanup warning:", e?.message);
    }

    await supabase.from("products").delete().eq("id", id);
    toast("🗑️ Ürün silindi!", "error");
    fetchProducts();
  }

  // ---------------- Filtered ----------------
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    return (products || []).filter((p) => {
      const n = (p.name || "").toLowerCase();
      const c = (p.category || "").toLowerCase();
      return n.includes(s) || c.includes(s);
    });
  }, [products, search]);

  // ---------------- UI ----------------
  return (
    <div className="animate-slide-in bg-neutral-950 text-white rounded-2xl p-6 shadow-lg border border-neutral-800">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-yellow-400">Ürün Yönetimi</h1>

        <div className="flex gap-3">
          <input
            placeholder="Ara (ad / kategori)…"
            className="px-3 py-2 text-sm bg-neutral-800 rounded-lg border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => {
              const opening = !showForm;
              setShowForm(opening);
              if (opening) {
                setEditing(null);
                resetForm();
              }
            }}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
          >
            {showForm ? "Kapat" : "Yeni Ürün"}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={save}
          className="bg-neutral-900 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 border border-neutral-700"
        >
          {/* Name */}
          <input
            className="bg-neutral-800 rounded p-2 border border-neutral-700 focus:ring-1 focus:ring-yellow-500"
            placeholder="Ürün Adı"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />

          {/* Category */}
          <input
            className="bg-neutral-800 rounded p-2 border border-neutral-700 focus:ring-1 focus:ring-yellow-500"
            placeholder="Kategori (Çanta / Cüzdan / E-Pin…)"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />

          {/* Price */}
          <input
            className="bg-neutral-800 rounded p-2 border border-neutral-700 focus:ring-1 focus:ring-yellow-500"
            placeholder="Fiyat (₺)"
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />

          {/* Old Price */}
          <input
            className="bg-neutral-800 rounded p-2 border border-neutral-700 focus:ring-1 focus:ring-yellow-500"
            placeholder="Eski Fiyat (₺)"
            type="number"
            min="0"
            value={form.old_price}
            onChange={(e) => setForm((f) => ({ ...f, old_price: e.target.value }))}
          />

          {/* Stock */}
          <input
            className="bg-neutral-800 rounded p-2 border border-neutral-700 focus:ring-1 focus:ring-yellow-500"
            placeholder="Stok"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            required
          />

          {/* Main image file */}
          <input
            type="file"
            accept="image/*"
            className="bg-neutral-800 rounded p-2 border border-neutral-700 col-span-2"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setForm((fm) => ({ ...fm, image: f }));
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />

          {/* Main image preview */}
          <div className="col-span-2 flex items-center gap-3">
            <div className="w-[96px] h-[96px] rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800">
              <img
                src={preview || resolveImage(form.image_url)}
                alt="preview"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-xs text-neutral-400">
              Ana görsel. (Dosya seçmezsen mevcut <strong>image_url</strong> korunur)
            </div>
          </div>

          {/* Gallery multiple */}
          <div className="col-span-2">
            <label className="text-sm text-neutral-300 mb-1 block">
              Galeri Görselleri (çoklu)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="bg-neutral-800 rounded p-2 border border-neutral-700 w-full"
              onChange={(e) => {
                const fl = e.target.files ? Array.from(e.target.files) : [];
                setForm((fm) => ({ ...fm, gallery_files: fl }));
                setGalleryPreviews(fl.map((f) => URL.createObjectURL(f)));
              }}
            />

            {(galleryPreviews.length > 0 || (form.gallery && form.gallery.length > 0)) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {galleryPreviews.map((p, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="w-16 h-16 rounded-md overflow-hidden border border-neutral-700 bg-neutral-800"
                  >
                    <img
                      src={p}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
                {(form.gallery || []).map((u, idx) => (
                  <div
                    key={`old-${idx}`}
                    className="w-16 h-16 rounded-md overflow-hidden border border-neutral-700 bg-neutral-800"
                  >
                    <img
                      src={resolveImage(u)}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-neutral-500 mt-1">
              Yeni yüklediklerin mevcut galeriye <b>eklenir</b>. (Silme desteği istenirse ekleriz.)
            </p>
          </div>

          {/* Description */}
          <textarea
            className="bg-neutral-800 rounded p-2 border border-neutral-700 col-span-2"
            rows={3}
            placeholder="Açıklama"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <button
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded col-span-2 font-semibold disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : editing ? "Güncelle" : "Kaydet"}
          </button>
        </form>
      )}

      {/* List */}
      <div className="overflow-x-auto border border-neutral-800 rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900">
            <tr className="border-b border-neutral-800 text-gray-400">
              <th className="p-3">Görsel</th>
              <th className="p-3">Ad</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Fiyat</th>
              <th className="p-3">Eski</th>
              <th className="p-3">%İnd.</th>
              <th className="p-3">Stok</th>
              <th className="p-3 text-center">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const rate = pct(p.old_price, p.price);
              const b = stockBadge(p.stock);
              const priceLabel = `₺${toNum(p.price, 0).toLocaleString("tr-TR")}`;
              const oldLabel =
                p.old_price ? `₺${toNum(p.old_price, 0).toLocaleString("tr-TR")}` : "-";

              return (
                <tr
                  key={p.id}
                  className="border-b border-neutral-800 hover:bg-neutral-900/50 transition"
                >
                  <td className="p-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800">
                     <img
                      src={
                        p.image_url?.startsWith("http")
                         ? p.image_url
                          : `/products/${p.image_url?.replace(/^\/+/, "")}`
                           }
                             alt={p.name}
                           className="w-full h-full object-cover object-center"
                          loading="lazy"
                          decoding="async"
                          />


                    </div>
                  </td>

                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.category || "-"}</td>

                  <td className="p-3">{priceLabel}</td>
                  <td className="p-3">{oldLabel}</td>

                  <td className="p-3">
                    {rate > 0 ? (
                      <span className="px-2 py-0.5 text-xs rounded bg-red-600/20 text-red-400 font-semibold">
                        %{rate}
                      </span>
                    ) : (
                      <span className="text-neutral-500">-</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${b.cls}`}>{b.text}</span>
                    <span className="text-neutral-300 ml-2">{toNum(p.stock, 0)}</span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          setEditing(p.id);
                          setShowForm(true);
                          setPreview(null);
                          setGalleryPreviews([]);
                          setForm({
                            name: p.name || "",
                            price: p.price ?? "",
                            old_price: p.old_price ?? "",
                            stock: p.stock ?? "",
                            category: p.category || "",
                            description: p.description || "",
                            image: null,
                            image_url: p.image_url || null,
                            gallery_files: [],
                            gallery: Array.isArray(p.gallery) ? p.gallery : [],
                          });
                        }}
                        className="text-yellow-400 hover:text-yellow-500"
                      >
                        Düzenle
                      </button>

                      <button
                        onClick={() => remove(p.id, p.image_url, p.gallery)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Sil 🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-400" colSpan={8}>
                  Kriterlere uygun ürün bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------------------------
// Toast helper
// -------------------------------------
function toast(text, type = "info") {
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: { type, text },
    })
  );
}
