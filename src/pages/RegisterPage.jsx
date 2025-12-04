import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {

  function translateError(msg) {
  if (!msg) return "Bir hata oluştu.";

  msg = msg.toLowerCase();

  if (msg.includes("password")) return "Şifre en az 6 karakter olmalıdır.";
  if (msg.includes("email")) return "Geçerli bir e-posta adresi giriniz.";
  if (msg.includes("user already registered")) return "Bu e-posta adresi zaten kayıtlı.";
  if (msg.includes("invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (msg.includes("rate limit")) return "Çok fazla deneme yaptınız, lütfen tekrar deneyin.";

  return "Bir hata oluştu. Lütfen tekrar deneyin.";
}

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    document.body.classList.add("login-page");

    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    // 1) AUTH → kullanıcı oluştur
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          phone: phone,
        },
      },
    });

   if (error) {
  setErr(translateError(error.message));
  return;
}

    // 2) profiles tablosunu güncelle (gerekirse)
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email,
        username: username,
        full_name: fullName,
        phone: phone,
      });
    }

    setMsg("✔️ Kayıt başarılı! Lütfen e-postanı doğrula.");

    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: {
          type: "info",
          text: "📨 Hesabın oluşturuldu! Lütfen e-posta adresini doğrula.",
          duration: 8000,
        },
      })
    );
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
 <div className="absolute inset-0"></div>

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
          Kayıt Ol
        </h2>

        <form className="flex flex-col gap-5" onSubmit={handleRegister}>
          
          {/* FULL NAME */}
          <input
            type="text"
            placeholder="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-4 rounded-lg bg-black/40 border border-white/10 focus:border-yellow-400 text-white"
            required
          />

          {/* PHONE */}
          <input
            type="tel"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-4 rounded-lg bg-black/40 border border-white/10 focus:border-yellow-400 text-white"
            required
          />

          {/* USERNAME */}
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-4 rounded-lg bg-black/40 border border-white/10 focus:border-yellow-400 text-white"
            required
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="E-posta adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-4 rounded-lg bg-black/40 border border-white/10 focus:border-yellow-400 text-white"
            required
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                p-4 rounded-lg bg-black/40 border border-white/10 
                w-full text-white
                focus:border-yellow-400
              "
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-4 text-gray-300 hover:text-yellow-300 transition"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* MESSAGES */}
          {err && <p className="text-red-400 text-sm">{err}</p>}
          {msg && <p className="text-emerald-400 text-sm">{msg}</p>}

          <button
            className="
              w-full py-3 mt-2 rounded-lg 
              bg-gradient-to-r from-yellow-400 to-rose-400 
              text-black font-bold
              shadow-[0_0_20px_rgba(255,215,0,0.35)]
              hover:brightness-110 transition
            "
          >
            Kayıt Ol
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-yellow-300 hover:underline transition">
            Zaten hesabın var mı? Giriş Yap
          </Link>
        </div>

        {/* KVKK - Aydınlatma / Gizlilik / Üyelik Sözleşmesi */}
<div className="text-sm text-gray-300 mt-6 leading-relaxed text-center px-2">
  Kişisel verileriniz,
  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event("open-kvkk"))}
    className="text-yellow-300 font-semibold hover:underline mx-1"
  >
    Aydınlatma Metni
  </button>
  kapsamında işlenmektedir. “Kayıt Ol” butonuna basarak
  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event("open-gizlilik"))}
    className="text-yellow-300 font-semibold hover:underline mx-1"
  >
    Gizlilik Politikası
  </button>
  ile
  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event("open-uyelik"))}
    className="text-yellow-300 font-semibold hover:underline mx-1"
  >
    Üyelik ve Hizmet Sözleşmesi
  </button>
  ’ni okuduğunuzu ve kabul ettiğinizi onaylıyorsunuz.
</div>

      </div>
    </div>
  );
}
