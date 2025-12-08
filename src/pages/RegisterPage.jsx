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
    document.body.classList.remove("login-page");
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          phone,
        },
      },
    });

    if (error) {
      setErr(translateError(error.message));
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        username,
        full_name: fullName,
        phone,
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
    <div className="min-h-screen flex justify-center items-start bg-[#fafafa] pt-[120px] pb-10 px-4">


      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Kayıt Ol
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 
            text-[#333] placeholder-gray-400 bg-white
            focus:outline-none focus:border-[#f27a1a]"
            required
          />

          <input
            type="tel"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 
            text-[#333] placeholder-gray-400 bg-white
            focus:outline-none focus:border-[#f27a1a]"
            required
          />

          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 
            text-[#333] placeholder-gray-400 bg-white
            focus:outline-none focus:border-[#f27a1a]"
            required
          />

          <input
            type="email"
            placeholder="E-posta adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 
            text-[#333] placeholder-gray-400 bg-white
            focus:outline-none focus:border-[#f27a1a]"
            required
          />

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 
              text-[#333] placeholder-gray-400 bg-white
              focus:outline-none focus:border-[#f27a1a]"
              required
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-3 text-gray-500 hover:text-[#f27a1a]"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {err && <p className="text-red-500 text-sm">{err}</p>}
          {msg && <p className="text-green-600 text-sm">{msg}</p>}

          <button
            className="w-full py-3 bg-[#f27a1a] text-white rounded-xl font-bold hover:bg-[#d96a0f] transition"
          >
            Kayıt Ol
          </button>
        </form>

        {/* KVKK - Aydınlatma / Gizlilik / Üyelik Sözleşmesi */}
<div className="text-xs text-gray-500 mt-6 leading-relaxed text-center px-2">
  Kişisel verileriniz,
  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event("open-kvkk"))}
    className="text-[#f27a1a] font-semibold hover:underline mx-1"
  >
    Aydınlatma Metni
  </button>
  kapsamında işlenmektedir. “Kayıt Ol” butonuna basarak
  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event("open-gizlilik"))}
    className="text-[#f27a1a] font-semibold hover:underline mx-1"
  >
    Gizlilik Politikası
  </button>
  ile
  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event("open-uyelik"))}
    className="text-[#f27a1a] font-semibold hover:underline mx-1"
  >
    Üyelik ve Hizmet Sözleşmesi
  </button>
  ’ni okuduğunuzu ve kabul ettiğinizi onaylıyorsunuz.
</div>


        <div className="text-center mt-6 text-sm">
          <Link to="/login" className="text-[#f27a1a] hover:underline">
            Zaten hesabın var mı? Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
