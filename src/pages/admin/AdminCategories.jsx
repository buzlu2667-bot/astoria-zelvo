// ✅ src/admin/AdminCategories.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("❌ Kategoriler alınamadı:", error);
    else setCategories(data || []);
    setLoading(false);
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const addCategory = async () => {
    const name = newCat.trim();
    if (!name) return alert("Kategori adı boş olamaz!");
    if (!newImage) return alert("Bir görsel seçmelisin!");

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    // ✅ 1. Görseli yükle
    const fileExt = newImage.name.split(".").pop();
    const fileName = `${slug}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("category-images")
      .upload(fileName, newImage);

    if (uploadError) {
      console.error("❌ Görsel yükleme hatası:", uploadError);
      alert("Görsel yüklenemedi!");
      return;
    }

    // ✅ 2. Public URL al
    const { data: publicUrlData } = supabase.storage
      .from("category-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // ✅ 3. Veritabanına kaydet
    const { error } = await supabase
      .from("categories")
      .insert([{ name, slug, image_url: imageUrl }]);

    if (error) {
      console.error("❌ Kategori ekleme hatası:", error);
      alert("Kategori eklenemedi!");
    } else {
      setNewCat("");
      setNewImage(null);
      fetchCategories();
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "✅ Kategori eklendi!" },
        })
      );
    }
  };

  const deleteCategory = async (id, name) => {
    if (!window.confirm(`'${name}' kategorisini silmek istediğine emin misin?`))
      return;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("❌ Silme hatası:", error);
      alert("Silme işlemi başarısız!");
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "🗑️ Kategori silindi!" },
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto bg-neutral-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-yellow-400 mb-5">
          📦 Kategori Yönetimi
        </h1>

        {/* ✅ Yeni kategori ekleme alanı */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Yeni kategori adı..."
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 outline-none"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 transition"
          />
          <button
            onClick={addCategory}
            className="bg-yellow-500 text-black px-5 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
          >
            ➕ Ekle
          </button>
        </div>

        {/* ✅ Liste */}
        {loading ? (
          <p className="text-gray-400">⏳ Kategoriler yükleniyor...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-center">Henüz kategori yok.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="border-b border-gray-700 text-gray-400">
              <tr>
                <th className="text-left py-2 px-2">Görsel</th>
                <th className="text-left py-2 px-2">Ad</th>
                <th className="text-left py-2 px-2">Slug</th>
                <th className="text-right py-2 px-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-gray-800 hover:bg-white/5 transition-all"
                >
                  <td className="py-3 px-2">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-700"
                      />
                    ) : (
                      <span className="text-gray-500">Yok</span>
                    )}
                  </td>
                  <td className="py-3 px-2 font-semibold text-white">
                    {cat.name}
                  </td>
                  <td className="px-2 text-gray-400">{cat.slug}</td>
                  <td className="text-right px-2">
                    <button
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      className="text-red-500 hover:text-red-400 transition"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
