import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const TABLE = "admin_notes";

export default function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchNotes();

    const subscription = supabase
      .channel("realtime-notes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          setNotes((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchNotes() {
    const { data } = await supabase
      .from(TABLE)
      .select("*")
      .order("id", { ascending: false })
      .limit(50);

    setNotes(data || []);
  }

  async function addNote(e) {
    e.preventDefault();
    if (!msg.trim()) return;

    const { data: session } = await supabase.auth.getUser();
    const email = session?.user?.email || "admin";

    await supabase.from(TABLE).insert([
      { message: msg, author: email }
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
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg"
        >
          Ekle
        </button>
      </form>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {notes.length === 0 && (
          <p className="text-gray-400">Henüz not yok.</p>
        )}

        {notes.map((note) => (
          <div key={note.id} className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">
              {new Date(note.created_at).toLocaleString("tr-TR")} — {note.author}
            </div>
            <p>{note.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
