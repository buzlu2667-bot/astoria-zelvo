// 📄 src/pages/Messages.jsx — BEYAZ PREMIUM TASARIM V2
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Megaphone, MessageCircle, Trash2 } from "lucide-react";
import { useSession } from "../context/SessionContext";
import { Link } from "react-router-dom";


export default function Messages() {
  const { session } = useSession();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------
  // MESAJLARI YÜKLE
  // -----------------------------------------------------
  useEffect(() => {
    if (!session) return;
    loadMessages();
    sessionStorage.removeItem("new_message_toast");
  }, [session]);

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

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("hidden_by_user", false)
      .or(`is_global.eq.true,user_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    setMessages(data || []);
    setLoading(false);
  }

  async function hideMessage(id) {
    await supabase
      .from("messages")
      .update({ hidden_by_user: true })
      .eq("id", id);

    setMessages(prev => prev.filter(m => m.id !== id));

    window.dispatchEvent(new CustomEvent("refresh-unread"));
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "Mesaj silindi!", duration: 3000 },
      })
    );
  }

  // ---------------------------------------------------------------------
  // BEYAZ TASARIM BAŞLANGICI
  // ---------------------------------------------------------------------
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center py-20 text-gray-700">
     <h1 className="text-3xl font-extrabold mb-6 tracking-wide flex items-center gap-2 text-gray-900">
  <MessageCircle 
    className="w-7 h-7 text-yellow-500 drop-shadow-[0_0_6px_rgba(255,200,0,0.6)]" 
    strokeWidth={2.4}
  />
  Mesajlarım
</h1>



        <p className="text-gray-600 mb-6 text-lg">
          Mesajlarını görebilmek için giriş yapmalısın.
        </p>

        <Link
          to="/login"
          className="px-5 py-3 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-400 transition"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-6 text-gray-800">

      {/* Başlık */}
    <h1 className="text-3xl font-extrabold mb-6 tracking-wide flex items-center gap-2 text-gray-900">
  <MessageCircle 
    className="w-7 h-7 text-yellow-500 drop-shadow-[0_0_6px_rgba(255,200,0,0.6)]" 
    strokeWidth={2.4}
  />
  Mesajlarım
</h1>


      {loading && <p className="text-gray-500">Yükleniyor...</p>}

      {!loading && messages.length === 0 && (
        <p className="text-gray-500 text-lg">Henüz mesajınız yok.</p>
      )}

      <div className="space-y-6 animate-fadeIn">
        {messages.map(m => {
          const isGlobal = m.is_global;

          return (
            <div
              key={m.id}
              className="
                relative p-5 rounded-2xl bg-white 
                border border-gray-200 shadow-md
                transition-all duration-300
              "
            >

              {/* Silme butonu */}
              <button
                onClick={() => hideMessage(m.id)}
                className="
                  absolute right-3 top-3 p-2 rounded-full
                  bg-red-50 hover:bg-red-100 border border-red-200
                  transition
                "
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>

              {/* Badge */}
              <div
                className={`
                  absolute -top-3 left-4 px-3 py-[3px] rounded-full text-xs font-semibold text-white
                  ${isGlobal ? "bg-blue-500" : "bg-pink-500"}
                `}
              >
                {isGlobal ? "Sistem Mesajı" : "Özel Mesaj"}
              </div>

              {/* Başlık + ikon */}
              <div className="flex items-center gap-3 mt-3">
                {isGlobal ? (
                  <Megaphone className="w-6 h-6 text-blue-500" />
                ) : (
                  <MessageCircle className="w-6 h-6 text-pink-500" />
                )}

                <h3 className="text-lg font-semibold">{m.title || "Başlıksız"}</h3>
              </div>

              {/* Mesaj içeriği */}
              <p className="text-gray-600 mt-3 leading-relaxed">{m.message}</p>

              {/* Tarih */}
              <p className="text-xs text-gray-400 mt-4">
                {new Date(m.created_at).toLocaleString("tr-TR")}
              </p>

            </div>
          );
        })}
      </div>
    </div>
  );
}
