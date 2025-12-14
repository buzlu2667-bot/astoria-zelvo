// 📄 src/pages/Messages.jsx — PREMIUM HEADER (DARK) + WHITE CARDS
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { Megaphone, MessageCircle, Trash2, Home, Mail } from "lucide-react";
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
    const onVis = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
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
    await supabase.from("messages").update({ hidden_by_user: true }).eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));

    window.dispatchEvent(new CustomEvent("refresh-unread"));
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "Mesaj silindi!", duration: 3000 },
      })
    );
  }

  // küçük helperlar
  const totalLabel = useMemo(() => `${messages.length} mesaj`, [messages.length]);

  // ---------------------------------------------------------------------
  // LOGIN YOKSA
  // ---------------------------------------------------------------------
  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-16">
          {/* Premium header */}
          <div className="
            relative overflow-hidden rounded-3xl
            border border-gray-200 bg-gray-50
            shadow-[0_18px_60px_-40px_rgba(0,0,0,0.25)]
            px-5 py-6 sm:px-7 sm:py-7
          ">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_circle_at_15%_20%,rgba(249,115,22,0.20),transparent_55%)]" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>

              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-wide text-gray-500">
                  Hesap
                </div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  Mesajlarım
                </h1>
                <p className="mt-1 text-sm sm:text-base text-gray-600">
                  Mesajlarını görebilmek için giriş yapmalısın.
                </p>

                <div className="mt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center
                      px-5 py-3 rounded-xl bg-orange-600 text-white font-semibold
                      hover:bg-orange-700 transition"
                  >
                    Giriş Yap
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* alt boşluk */}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // LOGIN VARSA
  // ---------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16">

        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-gray-800">
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold">Mesajlarım</span>
        </nav>

        {/* Premium header (koyu) */}
        <div className="
          relative overflow-hidden rounded-3xl
          border border-white/10 bg-gray-900/85 backdrop-blur
          shadow-[0_18px_60px_-40px_rgba(0,0,0,0.85)]
          px-5 py-6 sm:px-7 sm:py-7
        ">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_circle_at_15%_20%,rgba(249,115,22,0.35),transparent_60%)]" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-300" />
              </div>

              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-wide text-gray-300">
                  Bildirim Merkezi
                </div>

                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Mesajlarım
                </h1>

                <p className="mt-1 text-sm sm:text-base text-gray-200">
                  Sistem ve özel mesajlarını burada takip edebilirsin.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <div className="text-xs text-gray-300">Toplam</div>
              <div className="mt-1 text-sm font-semibold text-white">{totalLabel}</div>
            </div>
          </div>
        </div>

        {/* İçerik */}
        <div className="mt-8">
          {loading && <p className="text-gray-500">Yükleniyor...</p>}

          {!loading && messages.length === 0 && (
            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-gray-700 font-semibold">Henüz mesajınız yok.</p>
              <p className="text-gray-500 text-sm mt-1">Yeni mesaj geldiğinde burada görünecek.</p>
            </div>
          )}

          <div className="space-y-5">
            {messages.map((m) => {
              const isGlobal = m.is_global;

              return (
                <div
                  key={m.id}
                  className="
                    relative p-5 rounded-2xl bg-white
                    border border-gray-200 shadow-sm
                    hover:shadow-md transition-all
                  "
                >
                  {/* Badge */}
                  <div
                    className={`
                      absolute -top-3 left-4 px-3 py-[3px] rounded-full text-xs font-semibold
                      ${isGlobal ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-orange-50 text-orange-700 border border-orange-200"}
                    `}
                  >
                    {isGlobal ? "Sistem Mesajı" : "Özel Mesaj"}
                  </div>

                  {/* Sil */}
                  <button
                    onClick={() => hideMessage(m.id)}
                    className="
                      absolute right-3 top-3 p-2 rounded-full
                      bg-red-50 hover:bg-red-100 border border-red-200
                      transition
                    "
                    aria-label="Mesajı sil"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                  {/* Başlık + ikon */}
                  <div className="flex items-center gap-3 mt-3">
                    {isGlobal ? (
                      <Megaphone className="w-6 h-6 text-blue-600" />
                    ) : (
                      <MessageCircle className="w-6 h-6 text-orange-600" />
                    )}

                    <h3 className="text-lg font-semibold text-gray-900">
                      {m.title || "Başlıksız"}
                    </h3>
                  </div>

                  {/* Mesaj */}
                  <p className="text-gray-600 mt-3 leading-relaxed">
                    {m.message}
                  </p>

                  {/* Tarih */}
                  <p className="text-xs text-gray-400 mt-4">
                    {new Date(m.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
