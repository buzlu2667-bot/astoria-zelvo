import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // ⭐ MODERN ICONLAR
import ForgotPasswordModal from "../components/ForgotPasswordModal";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
  // Login sayfasında body'e arka plan uygula
  document.body.classList.add("login-page");

  return () => {
    document.body.classList.remove("login-page");
  };
}, []);


async function handleLogin(e) {
  e.preventDefault();
  setError("");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed")) {

      // 🔥 MAIL ONAY TOAST
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "warning",
            text: " Lütfen e-posta adresini doğrula!",
            duration: 6000,
          },
        })
      );

      setError(" E-posta adresini doğrulaman gerekiyor.");
      return;
    }

    // 🔥 ŞİFRE YANLIŞ
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: {
          type: "danger",
          text: "❌ E-posta veya şifre hatalı!",
        },
      })
    );

    setError("❌ E-posta veya şifre hatalı!");
    return;
  }

  // 🔥 LOGIN BAŞARILI
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "success",
        text: "Giriş başarılı! Hoş geldin 👑",
      },
    })
  );

  nav("/");
}



  return (
    <div
      className="
        min-h-screen flex items-center justify-center relative
        bg-black text-white p-6
      "
      style={{
        backgroundImage: `url('/login-bg.jpg')`, 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Arka plan overlay */}
    <div className="absolute inset-0"></div>

      {/* GLASS CONTAINER */}
      <div
        className="
          relative w-full max-w-md p-10 rounded-2xl 
          bg-black/40 backdrop-blur-2xl 
          border border-yellow-500/30 
          shadow-[0_0_40px_rgba(255,215,0,0.25)]
          animate-fadeIn
        "
      >
        <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-8 tracking-wide">
          Giriş Yap
        </h2>

        {/* FORM */}
        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          
          {/* Email */}
          <input
            type="email"
            placeholder="E-posta adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              p-4 rounded-lg w-full 
              bg-black/40 border border-white/10 
              text-white
              focus:outline-none focus:border-yellow-400 
              transition
            "
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                p-4 rounded-lg w-full 
                bg-black/40 border border-white/10 
                text-white
                focus:outline-none focus:border-yellow-400 
                transition
              "
              required
            />

            {/* MODERN EYE ICON */}
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-4 text-gray-300 hover:text-yellow-300 transition"
            >
              {showPass ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* LOGIN BUTTON */}
          <button
            className="
              w-full py-3 mt-2 rounded-lg 
              bg-gradient-to-r from-yellow-400 to-rose-400 
              text-black font-bold
              shadow-[0_0_20px_rgba(255,215,0,0.35)]
              hover:brightness-110 transition
            "
          >
            Giriş Yap
          </button>
        </form>

        {/* ✔ ALT LİNKLER */}
        <div className="text-center mt-6 flex flex-col gap-2">

          {/* Şifremi Unuttum */}
        <button
  type="button"
  onClick={() => setForgotOpen(true)}
  className="text-gray-300 hover:text-yellow-300 text-sm transition"
>
   Şifremi Unuttum
</button>

          {/* Kayıt ol */}
          <Link
            to="/register"
            className="text-yellow-300 hover:underline transition"
          >
            Hesabın yok mu? Kayıt Ol
          </Link>
        </div>
      </div>

        {/* 🔥 MODAL TAM BURAYA EKLENECEK */}
  <ForgotPasswordModal
    open={forgotOpen}
    onClose={() => setForgotOpen(false)}
  />

    </div>
    
  );
}

/* Fade-in animasyonu */
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn {
  from { opacity:0; transform:translateY(10px); }
  to { opacity:1; transform:translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn .6s ease-out;
}
`;
document.head.appendChild(style);
