import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRecovery = async () => {
      try {
        const hash = window.location.hash;
        const query = new URLSearchParams(window.location.search);

        // hem eski (#) hem yeni (code) formatı destekle
        if (hash.includes("type=recovery") || query.get("access_token") || query.get("code")) {
          console.log("🔗 Şifre sıfırlama bağlantısı doğrulandı");
          setLoading(false);
        } else {
          setErrorMsg("Geçersiz veya süresi dolmuş bağlantı.");
        }
      } catch (err) {
        console.error("Bağlantı kontrol hatası:", err);
        setErrorMsg("Bağlantı doğrulanamadı.");
      } finally {
        setLoading(false);
      }
    };
    checkRecovery();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!password.trim()) {
      setErrorMsg("Yeni şifre boş olamaz.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      console.log("✅ Şifre başarıyla değiştirildi");
      setSuccess(true);

      setTimeout(async () => {
        await supabase.auth.signOut();
        await supabase.auth.refreshSession();
        navigate("/signin", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("Şifre sıfırlama hatası:", err);
      setErrorMsg("Şifre güncellenemedi, lütfen tekrar deneyin.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400">
        <p className="animate-pulse">Bağlantı kontrol ediliyor...</p>
      </div>
    );
  }

  if (errorMsg && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
        <div className="bg-zinc-900 p-6 rounded-xl border border-red-700 shadow-lg w-[360px] text-center">
          <p>{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400">
      <div className="bg-zinc-900 p-8 rounded-xl border border-yellow-600 shadow-[0_0_25px_rgba(255,200,0,0.25)] w-[360px] text-center">
        <h2 className="text-2xl font-bold mb-6">🔐 Yeni Şifre Belirle</h2>

        {!success ? (
          <form onSubmit={handleReset}>
            <input
              type="password"
              placeholder="Yeni şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-3 rounded bg-zinc-800 text-white border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg text-black font-semibold hover:scale-105 transition-transform"
            >
              Şifreyi Güncelle
            </button>
          </form>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto border-4 border-green-500 rounded-full border-t-transparent animate-spin-slow" />
            <p className="text-green-400 font-semibold mt-4">Şifre değiştirildi 🎉</p>
            <p className="text-gray-400 text-sm mt-1">Giriş ekranına yönlendiriliyorsun…</p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin-slow { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        .animate-spin-slow { animation: spin-slow 2s linear infinite; }
      `}</style>
    </div>
  );
}
