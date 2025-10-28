import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const TABLE = "admin_notes";

export default function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [msg, setMsg] = useState("");

useEffect(() => {
  console.log("✅ useEffect Çalıştı");
  fetchNotes();

  const subscription = supabase
    .channel("realtime-notes")
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: TABLE },
      (payload) => {
        console.log("🔥 Realtime Yeni Veri:", payload.new);
        setNotes((prev) => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, []);

async function fetchNotes() {
  console.log("📌 fetchNotes çağırıldı");

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("id", { ascending: false })
    .limit(50);

  console.log("📌 Supabase data:", data);
  console.log("📌 Supabase error:", error);

  setNotes(data || []);
}



 async function fetchNotes() {
  const { data } = await supabase
    .from(TABLE)
    .select("*")
    .order("id", { ascending: false });

  setNotes(data || []);
}


  async function addNote(e) {
    e.preventDefault();
    if (!msg.trim()) return;

    const { data: session } = await supabase.auth.getUser();
    const email = session?.user?.email || "Admin";

    await supabase.from(TABLE).insert([
      {
        message: msg,
        author: email,
        created_at: new Date().toISOString(), // ✅ güvenli tarih fix
      },
    ]);

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
        <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 rounded-lg font-semibold">
          Ekle
        </button>
      </form>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 min-h-[200px]">
        {notes.length === 0 && (
          <p className="text-gray-400">Henüz not yok.</p>
        )}

        {notes.map((note) => (
          <div key={note.id} className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
            <div className="text-xs text-yellow-400 mb-1">
              {note.created_at ? new Date(note.created_at).toLocaleString("tr-TR") : "Tarih Yok"} — {note.author}
            </div>
            <p className="font-medium text-white">{note.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
