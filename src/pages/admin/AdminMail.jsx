import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminMail() {
  const [mode, setMode] = useState("global");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase.from("profiles").select("email");
    setUsers(data || []);
  }

 async function sendMail() {
  const to = mode === "global"
    ? users.map((u) => u.email)
    : [email];

  const res = await fetch(
    "https://tvsfhhxxligbqrcqtprq.supabase.co/functions/v1/send-admin-mail",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        admin_key: "BURAK_SPECIAL_777",
        to,
        subject,
        html: message, // 🔥 Artık HTML gidiyor!
      }),
    }
  );

  const json = await res.json();


  if (json.ok) alert("Mail gönderildi!");
  else alert("Mail gönderilemedi");
}




  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">📧 Admin Mail Paneli</h1>

      <div className="bg-black/40 p-4 rounded-xl border border-yellow-500/20">

        <div className="mb-4">
          <label className="font-semibold">Gönderim Türü:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-gray-900 border p-2 rounded-lg ml-3"
          >
            <option value="global">🌍 Tüm Kullanıcılara Mail</option>
            <option value="single">👤 Belirli Kullanıcıya Mail</option>
          </select>
        </div>

        {mode === "single" && (
          <input
            type="email"
            placeholder="Kullanıcı E-Postası"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-3 rounded-lg bg-black border border-yellow-500/30"
          />
        )}

        <input
          type="text"
          placeholder="Konu"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 mb-3 rounded-lg bg-black border border-yellow-500/30"
        />

        <textarea
          placeholder="Mesaj içeriği..."
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 mb-3 rounded-lg bg-black border border-yellow-500/30"
        />

        <button
          onClick={sendMail}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold"
        >
          📩 Mail Gönder
        </button>
      </div>
    </div>
  );
}
