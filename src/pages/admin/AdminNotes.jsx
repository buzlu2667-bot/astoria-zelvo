import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const TABLE = "admin_notes";

export default function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    (async () => {
      await fetchNotes();
      subscribeRealtime();
    })();

    return () => {
      try {
        supabase.removeAllChannels?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotes() {
    setStatus("loading");
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, message, author, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ fetchNotes error:", error);
      setStatus("error");
      return;
    }
    console.log("✅ fetchNotes len:", data?.length ?? 0);
    setNotes(data || []);
    setStatus("ok");
  }

  function subscribeRealtime() {
    const ch = supabase
      .channel("realtime-notes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          console.log("🔥 Realtime INSERT:", payload.new);
          setNotes((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe((s) => {
        console.log("📡 Realtime status:", s);
      });

    // güvene almak için:
    setTimeout(() => {
      if (notes.length === 0) fetchNotes();
    }, 1500);

    return ch;
  }

  async function addNote(e) {
    e.preventDefault();
    const text = msg.trim();
    if (!text) return;

    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email || "anon@guest";

    const { error } = await supabase
      .from(TABLE)
      .insert([{ message: text, author: email }]);

    if (error) {
      console.error("❌ insert error:", error);
      alert("Not eklenemedi: " + (error.message || "bilinmeyen hata"));
      return;
    }
    setMsg("");
  }

  return (
    <div className="bg-gray-900 text-white rounded-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Canlı Notlar</h1>

      <form onSubmit={addNote} className="flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 bg-gray-800 px-3 py-2 rounded-lg outline-none"
          placeholder="Yeni not yaz..."
        />
        <button className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg">
          Ekle
        </button>
      </form>

      {status === "loading" && <p className="text-gray-400">Yükleniyor…</p>}
      {status === "error" && (
        <p className="text-red-400">Notlar alınamadı. Konsolu kontrol et.</p>
      )}

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {notes.length === 0 && status === "ok" && (
          <p className="text-gray-400">Henüz not yok.</p>
        )}

        {notes.map((n) => (
          <div key={n.id} className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">
              {new Date(n.created_at).toLocaleString("tr-TR")} — {n.author}
            </div>
            <p>{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
