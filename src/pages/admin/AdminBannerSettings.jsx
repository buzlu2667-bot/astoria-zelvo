// 📄 src/pages/admin/AdminBannerSettings.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Upload, Save, Eye, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminBannerSettings() {
  const [form, setForm] = useState({
    image_url: "",
    height_px: 160,
    is_active: false,
    start_date: "",
    end_date: "",
  });

  const [uploading, setUploading] = useState(false);

  // ------------------------------------------------
  // 📌 1) VAR OLAN VERİYİ GETİR
  // ------------------------------------------------
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase
      .from("banner_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) {
      setForm({
        image_url: data.image_url || "",
        height_px: data.height_px || 160,
        is_active: data.is_active,
        start_date: data.start_date || "",
        end_date: data.end_date || "",
      });
    }
  }

  // ------------------------------------------------
  // 📌 2) GÖRSEL YÜKLEME
  // ------------------------------------------------
  async function uploadImage(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `banner_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      setForm((f) => ({ ...f, image_url: urlData.publicUrl }));

      toast.success("Banner görseli yüklendi!");
    } catch (err) {
      console.error(err);
      toast.error("Yükleme hatası!");
    }

    setUploading(false);
  }

  // ------------------------------------------------
  // 📌 3) KAYDET
  // ------------------------------------------------
async function saveSettings() {
  const { error } = await supabase
    .from("banner_settings")
    .update({
      image_url: form.image_url,
      height_px: Number(form.height_px),
      is_active: form.is_active,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    })
    .eq("id", 1);

  if (error) {
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "danger", text: "Kaydedilemedi!" },
      })
    );
  } else {
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "Banner başarıyla güncellendi!" },
      })
    );
  }
}


  return (
 <div className="p-6 mt-24">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">
        🖼 Banner Ayarları
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* SOL FORM */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-6">

          {/* Aktif / Pasif */}
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
            />
            <span className="text-gray-300">Banner aktif mi?</span>
          </label>

          {/* Height */}
          <div>
            <label className="text-gray-400 text-sm">Yükseklik (px)</label>
            <input
              type="number"
              value={form.height_px}
              onChange={(e) =>
                setForm((f) => ({ ...f, height_px: e.target.value }))
              }
              className="w-full p-3 mt-1 bg-black border border-white/10 rounded-lg"
            />
          </div>

         {/* Başlangıç Tarihi - Opsiyonel */}
<div>
  <label className="text-gray-400 text-sm">Başlangıç Tarihi (İsteğe Bağlı)</label>
  <input
    type="datetime-local"
    value={form.start_date || ""}
    placeholder="Opsiyonel"
    onChange={(e) =>
      setForm((f) => ({ ...f, start_date: e.target.value }))
    }
    className="w-full p-3 mt-1 bg-black border border-white/10 rounded-lg"
  />
  <span className="text-xs text-gray-500">Boş bırakırsan tarih kontrolü yapılmaz.</span>
</div>

{/* Bitiş Tarihi - Opsiyonel */}
<div>
  <label className="text-gray-400 text-sm">Bitiş Tarihi (İsteğe Bağlı)</label>
  <input
    type="datetime-local"
    value={form.end_date || ""}
    placeholder="Opsiyonel"
    onChange={(e) =>
      setForm((f) => ({ ...f, end_date: e.target.value }))
    }
    className="w-full p-3 mt-1 bg-black border border-white/10 rounded-lg"
  />
  <span className="text-xs text-gray-500">Boş bırakabilirsin.</span>
</div>


          {/* Görsel yükleme */}
          <div>
            <label className="text-gray-400 text-sm">Banner Görseli</label>

            <div className="flex items-center gap-3 mt-2">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                <Upload className="w-5 h-5" />
                <span>Dosya Seç</span>
                <input type="file" className="hidden" onChange={uploadImage} />
              </label>

              {uploading && <span className="text-yellow-400">Yükleniyor...</span>}
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-rose-400 rounded-lg text-black font-bold flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Ayarları Kaydet
          </button>
        </div>

        {/* SAĞ PREVIEW */}
        <div>
          <h2 className="text-lg text-gray-300 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" /> Ön İzleme
          </h2>

          {form.image_url ? (
            <div
              style={{
                width: "100%",
                height: `${form.height_px}px`,
                backgroundImage: `url(${form.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="rounded-xl border border-white/10 shadow-lg"
            ></div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/20 rounded-xl text-gray-500">
              <ImageIcon className="w-10 h-10 mb-2" />
              Banner görseli yok
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
