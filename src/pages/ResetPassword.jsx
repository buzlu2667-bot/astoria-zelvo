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

        if (
          hash.includes("type=recovery") ||
          query.get("access_token") ||
          query.get("code")
        ) {
          setLoading(false);
        } else {
          setErrorMsg("Geçersiz veya süresi dolmuş bağlantı.");
        }
      } catch (err) {
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

      setSuccess(true);

      setTimeout(async () => {
        await supabase.auth.signOut();
        await supabase.auth.refreshSession();
        navigate("/signin", { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMsg("Şifre güncellenemedi, lütfen tekrar deneyin.");
    }
  };

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <p className="text-gray-600 animate-pulse">Bağlantı kontrol ediliyor...</p>
      </div>
    );
  }

  /* -------------------- ERROR -------------------- */
  if (errorMsg && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="bg-white p-6 rounded-xl border border-red-300 shadow-lg w-[360px] text-center">
          <p className="text-red-500 font-medium">{errorMsg}</p>
        </div>
      </div>
    );
  }

  /* -------------------- FORM -------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg w-[380px] text-center">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Yeni Şifre Belirle</h2>

        {!success ? (
          <form onSubmit={handleReset}>
            <input
              type="password"
              placeholder="Yeni şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full p-3 mb-3 rounded-xl 
                border border-gray-300 
                bg-white text-gray-800 
                placeholder-gray-400
                focus:outline-none focus:border-orange-500
              "
            />

            {errorMsg && (
              <p className="text-red-500 text-sm mb-2">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="
                w-full py-3 mt-2 bg-orange-500 text-white 
                rounded-xl font-semibold 
                hover:bg-orange-600 transition
              "
            >
              Şifreyi Güncelle
            </button>
          </form>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto border-4 border-green-500 rounded-full border-t-transparent animate-spin-slow" />
            <p className="text-green-600 font-semibold mt-4">
              Şifre başarıyla değiştirildi 🎉
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Giriş ekranına yönlendiriliyorsun…
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin-slow { 
          0% { transform: rotate(0deg) } 
          100% { transform: rotate(360deg) } 
        }
        .animate-spin-slow { 
          animation: spin-slow 1.8s linear infinite; 
        }
      `}</style>
    </div>
  );
}
