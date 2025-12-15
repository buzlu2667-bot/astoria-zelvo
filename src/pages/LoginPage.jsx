import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import googleLogo from "../assets/google.png";
import { Gift, Sparkles } from "lucide-react";

export default function LoginPage() {



  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);



  useEffect(() => {
    document.body.classList.remove("login-page");
  }, []);

  // ❌ NORMAL GİRİŞ
  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("❌ E-posta veya şifre hatalı!");
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "error", text: "❌ E-posta veya şifre hatalı!" },
        })
      );
      return;
    }

    // ✔ BAŞARILI
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "Giriş başarılı! 👑" },
      })
    );

    setTimeout(() => nav("/"), 500);
  }

  // 🔥 GOOGLE GİRİŞ
  async function googleLogin() {
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "info", text: "Google yönlendiriliyor..." },
      })
    );

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }


 

  return (
<div className="bg-[#f5f5f5] flex justify-center px-4 pt-6">


  <div
  className="
    login-scroll
    w-full max-w-md bg-white shadow-2xl rounded-2xl
    border border-gray-200
    p-6 md:p-10
    max-h-[90svh]
    overflow-y-auto
    overscroll-contain
  "
>




        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Giriş Yap
        </h1>

        {/* Google Login */}
        <button
          onClick={googleLogin}
          className="
            w-full flex items-center justify-center gap-3 
            py-3 border border-gray-300 rounded-xl 
            bg-white shadow-sm hover:bg-gray-100 
            transition font-semibold text-gray-800
          "
        >
      <img src={googleLogo} className="w-5 h-5" />
          <span className="text-gray-800 font-medium">
            Google ile Devam Et
          </span>
        </button>


        {/* OR Line */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-sm">veya</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

       {/* 🎁 Yeni Üyelere Özel Kampanya */}
<div className="
  mt-5 mb-6 rounded-2xl 
  border border-orange-200 
  bg-gradient-to-br from-orange-50 to-orange-100
  px-4 py-4
  flex items-start gap-3
">

  {/* ICON */}
  <div className="
    flex items-center justify-center
    w-10 h-10 rounded-full
    bg-orange-500 text-white
    shadow-md
  ">
    <Gift size={20} />
  </div>

  {/* TEXT */}
  <div className="text-left">
    <p className="text-sm font-bold text-orange-700 flex items-center gap-1">
      Yeni Üyelere Özel 100 ₺ İndirim
      <Sparkles size={14} className="text-orange-500" />
    </p>

    <p className="text-sm text-orange-600 mt-1">
      Kayıt olan kullanıcılara özel tanımlanır.
    </p>

    <p className="text-[11px] text-orange-500 mt-1">
      * Kampanya dönemsel olarak geçerlidir.
    </p>
  </div>
</div>



        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresi"
            className="
              w-full px-4 py-3 rounded-xl border border-gray-300 
              text-black placeholder-gray-400
              bg-white focus:outline-none focus:border-orange-500
            "
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className="
                w-full px-4 py-3 rounded-xl border border-gray-300 
                text-black placeholder-gray-400
                bg-white focus:outline-none focus:border-orange-500
              "
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-3 text-gray-500 hover:text-orange-500 transition"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            className="
              w-full py-3 bg-orange-500 text-white rounded-xl 
              font-bold hover:bg-orange-600 transition shadow-md
            "
          >
            Giriş Yap
          </button>
        </form>

        {/* Forgot + Register */}
        <div className="flex flex-col items-center mt-6 gap-2">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-gray-500 text-sm hover:text-orange-600"
          >
            Şifremi Unuttum
          </button>

          <Link
            to="/register"
            className="text-orange-600 font-semibold hover:underline text-sm"
          >
            Hesabın yok mu? Kayıt Ol
          </Link>
        </div>

      </div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
