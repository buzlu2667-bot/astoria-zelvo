
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminNotificationForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("info");
  const [linkUrl, setLinkUrl] = useState("");
  const [duration, setDuration] = useState("none"); // ⏱️ yeni: süre
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expiresAt, setExpiresAt] = useState(""); // 🔥 manuel bitiş zamanı


  async function fetchNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, is_active, created_at, expires_at")
      .order("created_at", { ascending: false });

    if (!error) setNotifications(data || []);
    else console.error("Bildirim çekme hatası:", error.message);
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sendNotification = async () => {
    if (!title || !message) {
      alert("Başlık ve mesaj boş olamaz!");
      return;
    }

   // ⏱️ Süre seçimine göre expires_at hesapla
const now = new Date();
const expires = expiresAt ? new Date(expiresAt).toISOString() : null;


    setLoading(true);
    const { error } = await supabase.from("notifications").insert([
      {
        title,
        message,
        level,
        link_url: linkUrl || null,
        is_active: true,
        starts_at: now.toISOString(),
expires_at: expires, // 🔥 artık senin seçtiğin tarih kaydediliyor

      },
    ]);
    setLoading(false);

    if (error) {
      console.error(error);
      alert("❌ Bildirim gönderilemedi!");
    } else {
      alert("✅ Bildirim gönderildi!");
      setTitle("");
      setMessage("");
      setLinkUrl("");
      setLevel("info");
      setDuration("none");
      fetchNotifications();
    }
  };

  async function toggleNotification(id, active) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_active: active })
      .eq("id", id);

    if (error) alert("❌ Güncellenemedi: " + error.message);
    else {
      alert(active ? "✅ Bildirim açıldı!" : "🔕 Bildirim kapatıldı!");
      fetchNotifications();
    }
  }
  // 🗑️ Bildirim Silme Fonksiyonu
async function deleteNotification(id) {
  if (!confirm("⚠️ Bu bildirimi kalıcı olarak silmek istiyor musun?")) return;

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) alert("❌ Silinemedi: " + error.message);
  else {
    alert("🗑️ Bildirim silindi!");
    fetchNotifications(); // listeyi yeniler
  }
}

  return (
    <div className="bg-neutral-900 border border-yellow-700/40 rounded-xl p-5 max-w-3xl mx-auto mt-6 shadow-lg">
      <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">
        🔔 Bildirim Gönder (Admin)
      </h2>

      {/* 🔧 Yeni Bildirim Formu */}
      <div className="space-y-3 mb-6">
        <div>
          <label className="block text-gray-300 text-sm mb-1">Başlık</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Yeni İndirim!"
            className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-yellow-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">Mesaj</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesaj içeriğini buraya yaz..."
            className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 h-24 resize-none focus:ring-2 focus:ring-yellow-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Düzey</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-gray-200"
            >
              <option value="info">Bilgilendirme</option>
              <option value="sale">İndirim / Kampanya</option>
              <option value="coupon">Kupon</option>
              <option value="warning">Uyarı</option>
            </select>
          </div>

         {/* ⏰ Bitiş Tarihi ve Saati */}
<div>
  <label className="block text-gray-300 text-sm mb-1">Bitiş Tarihi / Saati</label>
  <input
    type="datetime-local"
    value={expiresAt}
    onChange={(e) => setExpiresAt(e.target.value)}
    className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-gray-200"
  />
  <p className="text-xs text-gray-500 mt-1">
    Boş bırakırsan süresiz olur (örnek: 2025-11-08 22:15)
  </p>
</div>

        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">Bağlantı (opsiyonel)</label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/kampanya"
            className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-yellow-500 outline-none"
          />
        </div>

        <button
          onClick={sendNotification}
          disabled={loading}
          className={`w-full py-2 mt-3 font-semibold rounded-lg transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-600 to-red-700 hover:opacity-90"
          }`}
        >
          {loading ? "Gönderiliyor..." : "Bildirimi Gönder"}
        </button>
      </div>

      {/* 📋 Bildirim Listesi */}
      <h3 className="text-lg font-bold text-yellow-300 mb-2 border-t border-yellow-500/20 pt-4">
        Mevcut Bildirimler
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm">Henüz bildirim yok.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center justify-between bg-neutral-800 border ${
                n.is_active
                  ? "border-green-600/40"
                  : "border-red-600/40 opacity-60"
              } rounded-lg p-3`}
            >
              <div>
                <p className="font-semibold text-yellow-400">{n.title}</p>
                <p className="text-gray-300 text-sm">{n.message}</p>
                {n.expires_at && (
                  <p className="text-xs text-amber-400 mt-1">
                    ⏰ Bitiş:{" "}
                    {new Date(n.expires_at).toLocaleString("tr-TR")}
                  </p>
                )}
              </div>
              {/* 🗑️ Silme Butonu */}
<button
  onClick={() => deleteNotification(n.id)}
  className="mr-2 px-2 py-1 rounded bg-gray-700 hover:bg-red-700 text-white text-xs font-semibold transition"
  title="Kalıcı olarak sil"
>
  ✖
</button>

              <button
                onClick={() => toggleNotification(n.id, !n.is_active)}
                className={`px-3 py-1 rounded text-sm font-semibold transition ${
                  n.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {n.is_active ? "Kapat 🔕" : "Aç 🔔"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
