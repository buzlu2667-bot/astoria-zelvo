import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProductForm({ onProductAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return null;
    const fileName = `${Date.now()}_${image.name}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, image);
    if (error) {
      console.error(error);
      alert("Görsel yüklenemedi: " + error.message);
      return null;
    }
    const { data: publicUrl } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return alert("Ürün adı ve fiyat zorunlu!");
    setLoading(true);
    const imageUrl = await handleUpload();

    const { data, error } = await supabase
      .from("products")
      .insert([{ name, description, price, stock: stock || 0, image_url: imageUrl }])
      .select()
      .single();

    setLoading(false);
    if (error) return alert("Hata: " + error.message);
    onProductAdded(data);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImage(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border rounded-xl p-4 mb-6 bg-gray-50"
    >
      <h3 className="font-semibold mb-3">Yeni Ürün Ekle</h3>
      <div className="grid grid-cols-2 gap-4">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Ürün Adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Fiyat (₺)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Stok"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2 col-span-2"
          placeholder="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="col-span-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
      >
        {loading ? "Ekleniyor..." : "Ürünü Kaydet"}
      </button>
    </form>
  );
}
