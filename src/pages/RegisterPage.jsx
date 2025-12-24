import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import googleLogo from "../assets/google.png";
import { sendShopAlert } from "../utils/sendShopAlert";
import { Gift, Sparkles, Star, Truck } from "lucide-react";

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
  data: { full_name: fullName, phone },
},

    });

    if (data?.user) {
  await sendShopAlert(`
🆕 YENİ ÜYE (EMAIL)
📧 ${data.user.email}
`);
}


    if (error) {
      setErr(translateError(error.message));
      return;
    }

    if (data.user) {
    await supabase.from("profiles").upsert({
  id: data.user.id,
  email,
  full_name: fullName,
  phone,
});

    }

    setMsg("✔️ Kayıt başarılı! Lütfen e-postanı doğrula.");
  }

 async function googleLogin() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://www.maximorashop.com",
    },
  });
}




  return (
<div className="min-h-screen bg-white flex justify-center px-4 pt-6 md:pt-10">


    <div className="
  max-w-4xl w-full bg-white shadow-2xl rounded-2xl 
  grid grid-cols-1 md:grid-cols-2
">



     {/* SOL PANEL */}
<div className="hidden md:flex flex-col justify-between 
  bg-gradient-to-br from-orange-400 to-orange-600 
  text-white p-12 relative overflow-hidden">

  {/* Arka plan süsleri */}
  <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
  <div className="absolute bottom-0 -right-16 w-72 h-72 bg-white/10 rounded-full blur-2xl" />

  {/* Üst içerik */}
  <div className="relative z-10">
    <h2 className="text-4xl font-extrabold leading-tight drop-shadow-lg">
      Maximora Shop <br /> Ailesine Katıl!
    </h2>

    <p className="mt-4 text-white/90 text-lg">
      Yeni üyelere özel avantajlar seni bekliyor 🎉
    </p>
  </div>

  {/* Icon özellikler */}
  <div className="relative z-10 mt-10 space-y-4 text-sm font-medium">
   {/*
<div className="flex items-center gap-3">
  <Gift size={22} className="text-yellow-200" />
  <span>Yeni Üyelere 100₺ İndirim</span>
</div>
*/}


    <div className="flex items-center gap-3">
      <Truck size={22} className="text-yellow-200" />
      <span>Hızlı & Güvenli Teslimat</span>
    </div>

    <div className="flex items-center gap-3">
      <Star size={22} className="text-yellow-200" />
      <span>Premium Ürün Deneyimi</span>
    </div>

    <div className="flex items-center gap-3">
      <Sparkles size={22} className="text-yellow-200" />
      <span>Yılbaşına Özel Fırsatlar</span>
    </div>
  </div>

  {/* Alt küçük yılbaşı notu */}
  {/*
<div className="relative z-10 mt-8 text-xs text-white/80">
  🎄 Yılbaşı kampanyaları sınırlı süreli
</div>
*/}

</div>

        {/* SAĞ FORM */}
<div className="p-10">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Kayıt Ol
          </h1>

          {/* GOOGLE BUTTON (DÜZELTİLDİ) */}
          <button
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm hover:bg-gray-200 transition font-semibold text-gray-700"
          >
            <img src={googleLogo} className="w-5 h-5" />
            Google ile Devam Et
          </button>

          {/* OR LINE */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 text-sm">veya</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

     {/*
🎁 Yeni Üyelere Özel Kampanya (GEÇİCİ OLARAK KAPATILDI)
<div className="
  mt-5 mb-6 rounded-2xl 
  border border-orange-200 
  bg-gradient-to-br from-orange-50 to-orange-100
  px-4 py-4
  flex items-start gap-3
">
  <div className="
    flex items-center justify-center
    w-10 h-10 rounded-full
    bg-orange-500 text-white
    shadow-md
  ">
    <Gift size={20} />
  </div>

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
*/}




          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-4">
            
            <input
              type="text"
              placeholder="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-500 focus:border-orange-500 outline-none"
              required
            />

            <input
              type="tel"
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-500 focus:border-orange-500 outline-none"
              required
            />

           
            <input
              type="email"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-500 focus:border-orange-500 outline-none"
              required
            />

            {/* Şifre alanı */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-500 focus:border-orange-500 outline-none"
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

            {/* HATA MESAJI */}
            {err && (
              <p className="text-red-500 text-sm font-medium">
                {err}
              </p>
            )}

            {/* BAŞARILI MESAJ */}
            {msg && (
              <p className="text-green-600 text-sm font-semibold">
                {msg}
              </p>
            )}

            <button
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-lg mt-2"
            >
              Kayıt Ol
            </button>
          </form>

          <div className="text-xs text-gray-500 mt-6 leading-relaxed">
  Kişisel verileriniz, <span className="font-semibold">Aydınlatma Metni</span> kapsamında işlenmektedir. 
  “Üye ol” veya “Sosyal Hesap” butonlarından birine basarak 
  <span className="font-semibold"> Gizlilik Politikası </span>
  ile 
  <span className="font-semibold"> Üyelik ve Hizmet Alım Sözleşmesi</span>'ni 
  okuduğunuzu ve kabul ettiğinizi onaylıyorsunuz.
</div>


          <div className="text-center mt-6 text-sm">
            <Link to="/login" className="text-orange-600 font-medium hover:underline">
              Zaten hesabın var mı? Giriş Yap
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
