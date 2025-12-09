import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminNotificationForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("info");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [imageFile, setImageFile] = useState(null);

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, is_active, created_at, expires_at, image_url")
      .order("created_at", { ascending: false });

    if (!error) setNotifications(data || []);
    else console.error("Bildirim çekme hatası:", error.message);
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  // -----------------------------------------------------
  // ✅ DOĞRU VE TEK SENDNOTIFICATION FONKSİYONU
  // -----------------------------------------------------
  const sendNotification = async () => {
    if (!title || !message) {
      alert("Başlık ve mesaj boş olamaz!");
      return;
    }

    setLoading(true);

    let uploadedUrl = null;

    // 📸 Görsel varsa önce Storage'a yükle
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `notif_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("notification-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("❌ Görsel yüklenemedi!");
        console.log(uploadError);
        setLoading(false);
        return;
      }

      // 📌 Public URL al
      const { data: publicUrlData } = supabase.storage
        .from("notification-images")
        .getPublicUrl(fileName);

      uploadedUrl = publicUrlData.publicUrl;
    }

    const now = new Date();
    const expires = expiresAt ? new Date(expiresAt).toISOString() : null;

    // 📤 DB'ye kaydet
    const { error } = await supabase.from("notifications").insert([
      {
        title,
        message,
        level,
        link_url: linkUrl || null,
        image_url: uploadedUrl, // ← görsel burada
        is_active: true,
        starts_at: now.toISOString(),
        expires_at: expires,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("❌ Bildirim gönderilemedi!");
      console.log(error);
      return;
    }

    alert("✅ Bildirim gönderildi!");
    setTitle("");
    setMessage("");
    setLinkUrl("");
    setImageFile(null);

    fetchNotifications();
  };

  async function toggleNotification(id, active) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_active: active })
      .eq("id", id);

    if (error) alert("❌ Güncellenemedi: " + error.message);
    else {
      alert(active ? "✅ Bildirim açıldı!" : "🔕 Kapatıldı!");
      fetchNotifications();
    }
  }

  async function deleteNotification(id) {
    if (!confirm("⚠️ Kalıcı olarak silinsin mi?")) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) alert("❌ Silinemedi!");
    else {
      alert("🗑️ Silindi!");
      fetchNotifications();
    }
  }

  return (
  <div className="bg-neutral-900 border border-yellow-700/40 rounded-xl p-5 max-w-3xl mx-auto mt-24 shadow-lg">
      <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">
        🔔 Bildirim Gönder (Admin)
      </h2>

      <div className="space-y-3 mb-6">
        <div>
          <label className="block text-gray-300 text-sm mb-1">Başlık</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
            placeholder="Örn: Yeni Kampanya!"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">Mesaj</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 h-24"
            placeholder="Mesaj gir..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Düzey</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
            >
              <option value="info">Bilgilendirme</option>
              <option value="sale">Kampanya</option>
              <option value="coupon">Kupon</option>
              <option value="warning">Uyarı</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Bitiş Tarihi / Saati
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
            />
          </div>
        </div>

        {/* 📸 Görsel Seç */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">
            Görsel (opsiyonel)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">
            Bağlantı (opsiyonel)
          </label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
            placeholder="/kampanya"
          />
        </div>

        <button
          disabled={loading}
          onClick={sendNotification}
          className="w-full py-2 mt-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold"
        >
          {loading ? "Gönderiliyor..." : "Bildirimi Gönder"}
        </button>
      </div>
    </div>
  );
}
