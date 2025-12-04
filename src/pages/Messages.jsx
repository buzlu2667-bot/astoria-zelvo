import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Megaphone, MessageCircle, Trash2 } from "lucide-react";
import { useSession } from "../context/SessionContext";
import { Link } from "react-router-dom";

export default function Messages() {
  const { session } = useSession();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Hooks HER ZAMAN burda, return'dan önce değil!
  useEffect(() => {
    if (!session) return;
    loadMessages();
    sessionStorage.removeItem("new_message_toast");
  }, [session]);


  // -----------------------------------------------------
// SEKMEDEN GERİ GELİNCE MESAJLARI YENİLE
// -----------------------------------------------------
useEffect(() => {
  const refresh = async () => {
    if (!session) return;
    await loadMessages();
  };

  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });

  return () => {
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}, [session]);


  async function loadMessages() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("hidden_by_user", false)
      .or(`is_global.eq.true,user_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!error) setMessages(data);
    setLoading(false);
  }

  async function hideMessage(id) {
    await supabase
      .from("messages")
      .update({ hidden_by_user: true })
      .eq("id", id);

    setMessages((prev) => prev.filter((m) => m.id !== id));
    window.dispatchEvent(new CustomEvent("refresh-unread"));

    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: {
          type: "success",
          text: " Mesaj silindi!",
          duration: 3000,
        },
      })
    );
  }

  // 🔥 HATA YOK — return EN SONDA ✔
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-white py-20">
        <h1 className="text-3xl font-extrabold mb-4 tracking-wide 
          bg-gradient-to-r from-yellow-400 to-amber-300 
          bg-clip-text text-transparent">
          Mesajlarım
        </h1>
        <p className="text-gray-400 mb-6 text-lg">
          Mesajlarını görebilmek için giriş yapmalısın.
        </p>
        <Link
          to="/login"
          className="px-5 py-3 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-400 transition"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">

      <h1 className="text-3xl font-extrabold mb-6 tracking-wide 
        bg-gradient-to-r from-yellow-400 to-amber-300 
        bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
        Mesajlarım
      </h1>

      {loading && <p className="text-gray-400">Yükleniyor...</p>}

      {!loading && messages.length === 0 && (
        <p className="text-gray-500 text-lg">Henüz mesajınız yok.</p>
      )}

      <div className="space-y-5 animate-fadeIn">
        {messages.map((m) => {
          const isGlobal = m.is_global;

          return (
            <div
              key={m.id}
              className={`relative p-5 rounded-2xl bg-black/40 backdrop-blur-xl 
                border shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-300
                ${isGlobal
                  ? "border-blue-400/40 shadow-[0_0_25px_rgba(80,150,255,0.3)]"
                  : "border-rose-400/40 shadow-[0_0_25px_rgba(255,100,150,0.3)]"}
              `}
            >
              <button
                onClick={() => hideMessage(m.id)}
                className="absolute right-3 top-3 p-2 rounded-full
                  bg-red-600/10 hover:bg-red-600/20 border border-red-500/30
                  shadow-[0_0_12px_rgba(255,50,50,0.45)] hover:shadow-[0_0_18px_rgba(255,70,70,0.7)] transition-all duration-300 backdrop-blur-md">
                <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
              </button>

              <div className={`absolute -top-3 left-4 px-3 py-[3px] rounded-full text-xs font-semibold
                ${isGlobal ? "bg-blue-500 text-white" : "bg-rose-500 text-white"}`}>
                {isGlobal ? "Sistem Mesajı" : "Özel Mesaj"}
              </div>

              <div className="flex items-center gap-3 mt-3">
                {isGlobal ? (
                  <Megaphone className="w-6 h-6 text-blue-400" />
                ) : (
                  <MessageCircle className="w-6 h-6 text-rose-400" />
                )}

                <h3 className="text-xl font-bold">
                  {m.title || "Başlıksız"}
                </h3>
              </div>

              <p className="text-gray-300 mt-3 leading-relaxed">{m.message}</p>

              <p className="text-xs text-gray-500 mt-4">
                {new Date(m.created_at).toLocaleString("tr-TR")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
