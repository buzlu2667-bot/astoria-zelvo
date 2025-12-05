import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

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

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "danger", text: "❌ E-posta veya şifre hatalı!" },
        })
      );
      setError("❌ E-posta veya şifre hatalı!");
      return;
    }

    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "Giriş başarılı! 👑" },
      })
    );

    nav("/");
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#fafafa] px-4">

      {/* CARD */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Giriş Yap
        </h1>

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
              text-[#333] placeholder-gray-400
              bg-white
              focus:outline-none focus:border-[#f27a1a]
            "
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
                text-[#333] placeholder-gray-400
                bg-white
                focus:outline-none focus:border-[#f27a1a]
              "
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-3 text-gray-500 hover:text-[#f27a1a]"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* BUTTON */}
          <button
            className="
              w-full py-3 bg-[#f27a1a] text-white rounded-xl 
              font-bold hover:bg-[#d96a0f] transition
            "
          >
            Giriş Yap
          </button>
        </form>

        {/* LINKS */}
        <div className="flex flex-col items-center mt-6 gap-2">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-gray-500 text-sm hover:text-[#f27a1a]"
          >
            Şifremi Unuttum
          </button>

          <Link
            to="/register"
            className="text-[#f27a1a] font-semibold hover:underline text-sm"
          >
            Hesabın yok mu? Kayıt Ol
          </Link>
        </div>
      </div>

      {/* Şifre reset modal */}
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
