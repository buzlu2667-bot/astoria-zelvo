// 📄 src/pages/admin/AdminScrollText.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Save } from "lucide-react";

export default function AdminScrollText() {
  const [form, setForm] = useState({
    text: "",
    bg_color: "#000000",
    text_color: "#ffffff",
    height_px: 40,
    speed: 1,
    active: false,
  });

  // 📌 Mevcut ayarları yükle
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("scroll_text")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) setForm(data);
  }

  // 📌 Kaydet
  async function save() {
    const { error } = await supabase
      .from("scroll_text")
      .update({
        text: form.text,
        bg_color: form.bg_color,
        text_color: form.text_color,
        height_px: form.height_px,
        speed: form.speed,
        active: form.active,
      })
      .eq("id", 1);

    if (error)
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "danger", text: "❌ Kaydedilemedi!" },
        })
      );
    else
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "✨ Kayan yazı güncellendi!" },
        })
      );
  }

  return (
   <div className="p-6 mt-24">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">
        📝 Kayan Yazı Ayarları
      </h1>

      <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-6">

        {/* Aktif / Pasif */}
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm((f) => ({ ...f, active: e.target.checked }))
            }
          />
          <span className="text-gray-300">Kayan yazı aktif mi?</span>
        </label>

        {/* Yazı */}
        <div>
          <label className="text-gray-400 text-sm">Yazı</label>
          <input
            type="text"
            value={form.text}
            onChange={(e) =>
              setForm((f) => ({ ...f, text: e.target.value }))
            }
            className="w-full p-3 mt-1 bg-black border border-white/10 rounded-lg"
          />
        </div>

        {/* Arka plan rengi */}
        <div>
          <label className="text-gray-400 text-sm">Arka Plan Rengi</label>
          <input
            type="color"
            value={form.bg_color}
            onChange={(e) =>
              setForm((f) => ({ ...f, bg_color: e.target.value }))
            }
          className="
  w-14 h-14 
  rounded-xl 
  cursor-pointer 
  border-2 border-white/20 
  shadow-[0_0_15px_rgba(255,215,0,0.25)] 
  hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]
  transition-all duration-300 
  bg-black
  p-[2px]
"
          />
        </div>

        {/* Yazı rengi */}
        <div>
          <label className="text-gray-400 text-sm">Yazı Rengi</label>
          <input
            type="color"
            value={form.text_color}
            onChange={(e) =>
              setForm((f) => ({ ...f, text_color: e.target.value }))
            }
            className="
  w-14 h-14 
  rounded-xl 
  cursor-pointer 
  border-2 border-white/20 
  shadow-[0_0_15px_rgba(255,215,0,0.25)] 
  hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]
  transition-all duration-300 
  bg-black
  p-[2px]
"
          />
        </div>

        {/* Yükseklik */}
        <div>
          <label className="text-gray-400 text-sm">Yükseklik (px)</label>
          <input
            type="number"
            value={form.height_px}
            onChange={(e) =>
              setForm((f) => ({ ...f, height_px: Number(e.target.value) }))
            }
            className="w-full p-3 mt-1 bg-black border border-white/10 rounded-lg"
          />
        </div>

        {/* Hız */}
        <div>
          <label className="text-gray-400 text-sm">Hız</label>
          <input
            type="number"
            value={form.speed}
            onChange={(e) =>
              setForm((f) => ({ ...f, speed: Number(e.target.value) }))
            }
            className="w-full p-3 mt-1 bg-black border border-white/10 rounded-lg"
          />
        </div>

        <button
          onClick={save}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-rose-400 rounded-lg text-black font-bold flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );
}
