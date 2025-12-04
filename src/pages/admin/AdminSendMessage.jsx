import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Users, Globe, Send, UserCheck } from "lucide-react";

export default function AdminSendMessage() {
  const [users, setUsers] = useState([]);
  const [target, setTarget] = useState("global"); // ⭐ Varsayılan GLOBAL
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, username");
    setUsers(data || []);
  }

  async function sendMessage() {
    if (!title || !message) {
      return window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "danger", text: "Başlık ve mesaj zorunludur!" },
        })
      );
    }

    // ⭐ GLOBAL MESAJ
    if (target === "global") {
      await supabase.from("messages").insert({
        title,
        message,
        is_global: true,
        user_id: null,
      });
    }
    // ⭐ KULLANICIYA ÖZEL MESAJ
    else {
      await supabase.from("messages").insert({
        title,
        message,
        user_id: target,
        is_global: false,
      });
    }

    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "Mesaj gönderildi! 🎉" },
      })
    );

    setTitle("");
    setMessage("");
  }

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">

      {/* HEADER */}
      <h1 className="text-3xl font-extrabold mb-6 tracking-wide bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] flex items-center gap-3">
        <Send className="text-yellow-400" />
        Admin Mesaj Gönder
      </h1>

      {/* GLASS CARD */}
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-yellow-500/20 p-6 shadow-[0_0_30px_rgba(255,215,0,0.2)]">

        {/* Mesaj Tipi */}
        <label className="text-sm text-gray-300 mb-2 block">Mesaj Türü</label>
        <div className="flex gap-3 mb-5">

          {/* GLOBAL BUTTON */}
          <button
            onClick={() => setTarget("global")}
            className={`flex items-center gap-2 w-full p-3 rounded-xl border transition
              ${
                target === "global"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-400 shadow-[0_0_15px_rgba(80,150,255,0.6)]"
                  : "bg-black/30 border-white/10 hover:bg-white/5"
              }
            `}
          >
            <Globe className="w-5 h-5" />
            <span>GLOBAL Mesaj</span>
          </button>

          {/* USER BUTTON */}
          <button
            onClick={() => setTarget("")}
            className={`flex items-center gap-2 w-full p-3 rounded-xl border transition
              ${
                target !== "global"
                  ? "bg-gradient-to-r from-yellow-400 to-rose-400 text-black border-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.6)]"
                  : "bg-black/30 border-white/10 hover:bg-white/5"
              }
            `}
          >
            <Users className="w-5 h-5" />
            <span>Kullanıcıya Özel</span>
          </button>
        </div>

        {/* KULLANICI SEÇME DROPDOWN */}
        {target !== "global" && (
          <>
            <label className="text-sm text-gray-300 mb-2 block">
              Kullanıcı Seç
            </label>
            <select
              className="w-full p-3 bg-black/40 border border-yellow-500/30 rounded-xl mb-5"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="">Seçiniz…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} ({u.username})
                </option>
              ))}
            </select>
          </>
        )}

        {/* BAŞLIK */}
        <input
          type="text"
          placeholder="Başlık"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 mb-4 focus:border-yellow-400"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* MESAJ */}
        <textarea
          placeholder="Mesajınız..."
          className="w-full h-40 p-3 rounded-xl bg-black/40 border border-white/10 mb-5 focus:border-yellow-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* SEND BUTTON */}
        <button
          onClick={sendMessage}
          className="w-full py-4 rounded-xl font-bold text-black text-lg bg-gradient-to-r from-yellow-400 to-rose-400 shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:brightness-110 transition flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Gönder
        </button>
      </div>
    </div>
  );
}
