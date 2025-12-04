import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  if (!open) return null;

  async function sendReset() {
    setMsg("");
    setErr("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) return setErr("❌ E-posta bulunamadı veya geçersiz.");

    setMsg("✔️ Şifre sıfırlama bağlantısı gönderildi!");
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="
        relative bg-black/40 backdrop-blur-xl
        border border-yellow-500/30
        shadow-[0_0_40px_rgba(255,215,0,0.25)]
        w-[90%] max-w-md p-8 rounded-2xl z-[10000]
        animate-fadeIn
      ">
        <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
          🔐 Şifre Sıfırla
        </h2>

        <input
          type="email"
          placeholder="E-posta adresi"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white mb-4"
        />

        {err && <p className="text-red-400 mb-3">{err}</p>}
        {msg && <p className="text-green-400 mb-3">{msg}</p>}

        <button
          onClick={sendReset}
          className="w-full py-3 mt-2 rounded-lg 
            bg-gradient-to-r from-yellow-400 to-rose-400 
            text-black font-bold hover:brightness-110 transition"
        >
          Bağlantı Gönder
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity:0; transform:scale(0.95); }
          to { opacity:1; transform:scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn .3s ease-out;
        }
      `}</style>
    </div>
  );
}
