import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { X, Lock } from "lucide-react";

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const sendLink = async () => {
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);

    if (!error) setSent(true);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">

      <div className="bg-white w-[420px] rounded-2xl shadow-xl border border-gray-200 p-8 relative">

        {/* Kapat */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Başlık */}
        <div className="flex flex-col items-center mb-6">
          <Lock size={32} className="text-orange-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Şifre Sıfırla</h2>
          <p className="text-gray-500 text-sm mt-1">
            E-posta adresine sıfırlama bağlantısı gönderilecektir.
          </p>
        </div>

        {!sent ? (
          <>
            <input
              type="email"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full p-3 rounded-xl border border-gray-300 
                bg-white text-gray-800 placeholder-gray-400
                focus:outline-none focus:border-orange-500
              "
            />

            <button
              onClick={sendLink}
              disabled={loading}
              className="
                w-full py-3 mt-4 rounded-xl text-white font-semibold
                bg-orange-500 hover:bg-orange-600 transition
                disabled:opacity-50
              "
            >
              {loading ? "Gönderiliyor..." : "Bağlantı Gönder"}
            </button>
          </>
        ) : (
          <div className="text-center text-green-600 font-medium">
            ✔ Sıfırlama bağlantısı e-postana gönderildi!
          </div>
        )}
      </div>
    </div>
  );
}
