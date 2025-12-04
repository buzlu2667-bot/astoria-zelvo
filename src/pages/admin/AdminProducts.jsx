import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AddProductModal from "./AddProductModal";
import { sendTelegramMessage } from "../../lib/sendTelegramMessage";

export default function AdminProducts() {

  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);  
  const [editData, setEditData] = useState(null); // 🔥 Düzenleme Modu

  

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    setProducts(data || []);
  }

  // 🔥 ÜRÜN SİLME
  async function deleteProduct(id) {
    const yes = confirm("❗ Ürünü silmek istediğine emin misin?");
    if (!yes) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Silme sırasında hata oluştu!");
      return;
    }

    window.dispatchEvent(new CustomEvent("toast", {
      detail: { type: "success", text: "🗑 Ürün silindi!" }
    }));

    load();
  }

  // 🔥 DÜZENLEME MODALINI BAŞLAT
  function editProduct(p) {
    setEditData(p);  
  }


  return (
    <div className="p-6 text-white">

      {/* BAŞLIK + BUTON */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ürünler</h1>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-[#00ffbb30] border border-[#00ffbb70] rounded-xl text-[#00ffdd] hover:bg-[#00ffbb50]"
        >
          ➕ Yeni Ürün Ekle
        </button>
      </div>

      {/* ÜRÜN LİSTESİ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {products.map((p) => (
          <div key={p.id} className="bg-[#111] border border-[#222] p-3 rounded-xl relative">

          {/* 🔥 DÜZENLE / SİL / TELEGRAM */}
<div className="absolute top-2 right-2 flex flex-col gap-2 z-20">

  {/* Düzenle */}
  <button
    onClick={() => editProduct(p)}
    className="
      w-9 h-9
      flex items-center justify-center
      rounded-lg
      bg-blue-600/80 backdrop-blur 
      border border-blue-300/50
      text-white text-lg
      shadow-[0_0_10px_rgba(0,120,255,0.5)]
      hover:bg-blue-600 transition
    "
  >
    ✏️
  </button>

  {/* Sil */}
  <button
    onClick={() => deleteProduct(p.id)}
    className="
      w-9 h-9
      flex items-center justify-center
      rounded-lg
      bg-red-600/80 backdrop-blur
      border border-red-300/50
      text-white text-lg
      shadow-[0_0_10px_rgba(255,0,0,0.5)]
      hover:bg-red-600 transition
    "
  >
    🗑
  </button>

 {/* Telegram */}
<button
  onClick={async () => {
    await sendTelegramMessage(p);

    window.dispatchEvent(new CustomEvent("toast", {
      detail: {
        type: "success",
        text: "📤 Telegram mesajı gönderildi!"
      }
    }));
  }}
  className="
    w-9 h-9
    flex items-center justify-center
    rounded-lg
    bg-green-600/80 backdrop-blur
    border border-green-300/50
    text-white text-lg
    shadow-[0_0_10px_rgba(0,255,100,0.5)]
    hover:bg-green-600 transition
  "
>
  📤
</button>


</div>


            <img
              src={p.main_img}
              className="w-full h-32 object-cover rounded-lg"
            />

           <div className="mt-2">
  <p className="font-semibold text-white text-sm line-clamp-1">
    {p.title}
  </p>

  {/* 📌 Eğer indirim varsa göster */}
  {p.old_price > p.price ? (
    <div className="flex items-center gap-2 mt-1">

      {/* Eski Fiyat */}
      <span className="text-xs text-red-400 line-through">
        {p.old_price}₺
      </span>

      {/* Yeni Fiyat */}
      <span className="text-sm text-green-400 font-bold">
        {p.price}₺
      </span>

      {/* % İNDİRİM */}
      <span className="text-xs bg-green-600/30 text-green-300 px-2 py-[2px] rounded-md border border-green-500/40">
        %{Math.round(((p.old_price - p.price) / p.old_price) * 100)}
      </span>
    </div>
  ) : (
    // İndirim yoksa sadece yeni fiyat
    <p className="text-sm text-gray-300 mt-1">{p.price}₺</p>
  )}
</div>


          </div>
        ))}
      </div>

      {/* 🔥 YENİ ÜRÜN EKLE MODAL */}
      {open && !editData && (
        <AddProductModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            load();
          }}
        />
      )}

      {/* 🔥 ÜRÜN DÜZENLEME MODAL */}
      {editData && (
        <AddProductModal
          initialData={editData}     // ← Düzenlenecek ürün
          onClose={() => setEditData(null)}
          onSuccess={() => {
            setEditData(null);
            load();
          }}
        />
      )}

    </div>
  );
}
