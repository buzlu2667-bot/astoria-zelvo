
// ✅ PREMIUM HEADER — v10 (full)
// - Admin e-posta: buzlu2667@gmail.com + admin@admin.com
// - Cart sayfasında “Giriş” butonu asla görünmez
// - Premium glass drawer, gold glow, sade ikon set
import { supabase } from "../lib/supabaseClient";
import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_BADGE } from "../utils/statusBadge";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { Heart, ShoppingCart, User2, LogOut, PackageSearch, Menu, ShieldCheck, X } from "lucide-react";
import { Truck } from "lucide-react";
import { v4 as uuidv4 } from "uuid";


function useFavoriteCount() {
  const { favorites } = useFavorites();
  return Array.isArray(favorites) ? favorites.length : 0;
}


const initialLogin = { email: "", password: "", show: false };
const initialSignup = { email: "", password: "", username: "", show: false };
const initialReset = { email: "" };

export default function Header() {
  const { session, isRecovering } = useSession();
  const { cart } = useCart();
    const [clientId, setClientId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("client_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("client_id", id);
    }
    setClientId(id);
  }, []);

  const favCount = useFavoriteCount();
  const location = useLocation();

  
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [knightOpen, setKnightOpen] = useState(false);
 



// ✅ Dinamik kategoriler (Supabase'den çek)
const [categories, setCategories] = useState([]);

useEffect(() => {
  (async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("❌ Kategoriler alınamadı:", error);
    else setCategories(data || []);
  })();
}, []);


  const [login, setLogin] = useState(initialLogin);
  const [signup, setSignup] = useState(initialSignup);
  const [reset, setReset] = useState(initialReset);
 const [loginError, setLoginError] = useState("");
const [signupError, setSignupError] = useState("");
const [resetError, setResetError] = useState("");
const [signupMsg, setSignupMsg] = useState("");
const [resetMsg, setResetMsg] = useState("");

const [accountOpen, setAccountOpen] = useState(false);

// 🟡 Hesabım menüsü dışına tıklayınca kapansın
useEffect(() => {
  function handleClickOutside(e) {
    if (
      !e.target.closest(".account-menu") &&
      !e.target.closest(".account-button")
    ) {
      setAccountOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


  const [orderCheckOpen, setOrderCheckOpen] = useState(false);
const [orderId, setOrderId] = useState("");
const [orderPhone, setOrderPhone] = useState("");
const [foundOrder, setFoundOrder] = useState(null);
const [hideNotification, setHideNotification] = useState(false);
const [notificationsReady, setNotificationsReady] = useState(false);
// 🔔 1️⃣ Realtime Dinleme
useEffect(() => {
  const channel = supabase
    .channel("realtime:notifications")
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
      if (payload.eventType === "INSERT" && payload.new?.is_active) {
        setNotifications([payload.new]);
        setHideNotification(false);
      } else if (payload.eventType === "UPDATE") {
        if (payload.new?.is_active) {
          setNotifications([payload.new]);
          setHideNotification(false);
        } else {
          setHideNotification(true);
        }
      }
    })
    .subscribe();

  setTimeout(() => setNotificationsReady(true), 800);
  return () => supabase.removeChannel(channel);
}, []);

// 🧭 2️⃣ Offline fetch
useEffect(() => {
  (async () => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
  .from("notifications")
  .select("*")
  .eq("is_active", true)
  .or(`expires_at.is.null,expires_at.gt.${now}`) // ⏰ Süresi geçmemiş veya süresiz olanlar
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

    if (data?.length > 0) {
      const notif = data[0];

      // 🧠 Artık clientId’yi kontrol ediyoruz (giriş yapmadıysa)
      const { data: dismissed } = await supabase
        .from("notification_dismiss")
        .select("id")
        .eq("notification_id", notif.id)
        .eq("user_email", session?.user?.email || clientId);

      const key = `closed_notification_${notif.id}`;
      const cookieExists = document.cookie.includes(`${key}=true`);
      const localExists = localStorage.getItem(key) === "true";

      if (!cookieExists && !localExists && dismissed?.length === 0) {
        setNotifications([notif]);
        setHideNotification(false);
      }
    }
  })();
}, [clientId, session]);


  // ✅ Admin mail fix
  const isAdmin = useMemo(
    () =>
      session?.user?.email === "buzlu2667@gmail.com" ||
      session?.user?.email === "admin@admin.com",
    [session]
  );

  // Cart/Dashboard/Orders sayfasında login butonunu gizle
  const hideLoginBtn =
    !!session ||
    isRecovering ||
    location.pathname.startsWith("/cart") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/orders");

  // ---- Auth handlers
async function handleLogin(e) {
  e.preventDefault();
  setLoginError("");

  const { error } = await supabase.auth.signInWithPassword({
    email: (login.email || "").trim(),
    password: login.password || "",
  });

  if (error) {
    const msg =
      error.message?.includes("Invalid login credentials") ||
      error.message?.includes("Invalid")
        ? "E-posta veya şifre hatalı!"
        : "Lütfen e-postanı onayla ve tekrar giriş yap!";

    setLoginError(msg);
    return;
  }

  setLogin(initialLogin);
  setLoginOpen(false);

  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "success",
        text: "✅ Giriş başarılı! 👑 Hoş geldin!",
      },
    })
  );

  setTimeout(() => {
    const redirectTo =
      localStorage.getItem("redirect_after_login") || "/";
    localStorage.removeItem("redirect_after_login");
    window.location.href = redirectTo;
  }, 1400);
}




 async function handleSignup(e) {
  e.preventDefault();
  setSignupError("");
  setSignupMsg("");

 const { data, error } = await supabase.auth.signUp({
  email: signup.email.trim(),
  password: signup.password,
  options: {
    data: {
      username: signup.username.trim()
    }
  }
});


  if (error) {
  let msg = error.message; // ✅ önce msg tanımla
  if (msg.includes("Password should be at least 6 characters")) {
    msg = "Şifre en az 6 karakter olmalıdır.";
  } else if (msg.includes("Email not confirmed")) {
    msg = " Lütfen e-postanı onayla ve tekrar giriş yap!";
  }
  setSignupError(msg); // ✅ Türkçeye çevrilmiş hali bastır
  return;
}


  // ✅ Kullanıcıya ekranda da bilgi verelim
  setSignupMsg("✅🎉 Kayıt başarılı! Lütfen e-posta adresine gelen onay linkine tıkla, ardından giriş yapabilirsin.");

  // ✅ Drawer'ı kapat (toast görünür olsun)
  setTimeout(() => {
  setSignupOpen(false);
}, 4000); // ✅ 1.5 sn sonra kapanır

  // ✅ Toast bildirimi gönderelim
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "info",
        text: "📨💛💫 E-posta adresine doğrulama bağlantısı gönderildi! Lütfen mailini kontrol et.",
         duration: 23000
      },
    })
  );

  // ✅ Formu sıfırla (güzel dursun)
  setSignup(initialSignup);
}


 async function handleReset(e) {
  e.preventDefault();
  setResetError("");
  setResetMsg("");

  const { error } = await supabase.auth.resetPasswordForEmail(
    (reset.email || "").trim()
  );

  if (error) setResetError(error.message);
  else setResetMsg("📨 E-postanı kontrol et!");
}


 const go = (to, protect = false) => {
  if (protect && (!session || isRecovering)) {
    // ✅ Şu anda bulunduğu sayfayı hatırla
    localStorage.setItem("redirect_after_login", to);

    setLoginOpen(true);
  } else {
    window.location.href = to;
  }
};

useEffect(() => {
  const pending = localStorage.getItem("pending_add_to_cart");
  if (pending && session) {
    const product = JSON.parse(pending);
    window.dispatchEvent(new CustomEvent("cart-add", { detail: product }));
    localStorage.removeItem("pending_add_to_cart");
  }
  
}, [session]);
async function fetchOrder() {
  setFoundOrder(null);

  if (!orderId || !orderPhone) return;

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      status,
      order_items (
        product_name,
        quantity
      )
    `)
    .eq("id", orderId)
    .eq("phone", orderPhone)
    .single();

  if (error || !data) {
    window.dispatchEvent(new CustomEvent("toast", {
      detail: { type: "danger", text: "❌ Sipariş bulunamadı!" },
    }));
    return;
  }

  setFoundOrder({
    ...data,
    items: data.order_items ?? []
  });
}
function renderStatus(status) {
  switch (status) {
    case "pending":
    case "awaiting_payment":
      return "⚠ Bekleyen Ödeme";
    case "processing":
      return "🟣 Hazırlanıyor";
    case "shipped":
      return "🚚 Kargoda";
    case "delivered":
      return "✅ Teslim Edildi";
    case "cancelled":
      return "❌ İptal Edildi";
    default:
      return "❓ Bilinmeyen Durum";
  }
}
async function closeNotification() {
  try {
    const notif = notifications[0];
    if (!notif) return;

    const key = `closed_notification_${notif.id}`;
    localStorage.setItem(key, "true");
    document.cookie = `${key}=true; max-age=31536000; path=/`;

   await supabase.from("notification_dismiss").insert({
  user_email: session?.user?.email || clientId, // ✅ benzersiz kimlik
  notification_id: notif.id,
});


    // ✅ Eğer süresizse, sunucuda da kapat
    if (!notif.expires_at) {
      await supabase
        .from("notifications")
        .update({ is_active: false })
        .eq("id", notif.id);
    }

    setHideNotification(true);

    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "info", text: "🔕 Bildirim kapatıldı." },
      })
    );
  } catch (err) {
    console.error("❌ Bildirim kapatma hatası:", err.message);
  }
}


 
  return (
    <>
{/* ✅ Premium Modal Notification (Center Popup - Final Clean Version) */}
{notificationsReady && notifications.length > 0 && !hideNotification && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
    <div className="bg-[#111] border border-yellow-500/40 rounded-2xl shadow-[0_0_35px_rgba(255,215,0,0.3)] p-4 sm:p-6 w-full max-w-sm sm:max-w-md text-center animate-fadeIn">
      <h2 className="text-yellow-400 text-lg font-bold mb-3">
        🔔 {notifications[0]?.title || "Yeni Duyuru"}
      </h2>
      <p className="text-gray-300 mb-5 leading-snug">
        {notifications[0]?.message || "Yeni bir bildirim var."}
      </p>

      <button
        onClick={closeNotification}
        className="bg-gradient-to-r from-yellow-400 to-rose-400 text-black font-semibold py-2 px-6 rounded-lg hover:brightness-110 transition"
      >
        Kapat
      </button>
    </div>
  </div>
)}

      {/* TOPBAR */}
   <header className="bg-[#050505] text-white border-b border-yellow-500/20 shadow-[0_0_20px_rgba(255,215,0,0.08)] z-[60]">

  <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 py-3">

          {/* Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-xl p-2 hover:bg-white/5 transition"
            aria-label="Menü"
          >
            <Menu className="w-6 h-6" />
          </button>

         
      {/* ✅ Maximora Logo (Blue + Gold Premium Edition) */}
<Link to="/" className="flex items-center gap-4 group mobile-hide-logo">
 {/* ✅ Mavi + Altın Degrade Logo */}
{/* ✅ Mavi + Altın Premium Logo (Net Harf Versiyonu) */}
<div
  className="
    logo-circle
    w-11 h-11 rounded-full 
    bg-gradient-to-br from-blue-500 via-blue-400 to-yellow-400
    flex items-center justify-center 
    text-white font-extrabold text-lg
    shadow-[0_0_25px_rgba(80,150,255,0.5)]
    group-hover:shadow-[0_0_35px_rgba(255,215,0,0.7)]
    group-hover:scale-110
    transition-all duration-300
  "
>

  <span
    className="
      text-white 
      drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]
      group-hover:text-blue-100
      group-hover:drop-shadow-[0_0_10px_rgba(80,150,255,0.9)]
      transition-all duration-500
    "
  >
    M
  </span>
</div>


  {/* Yazılar */}
  <div className="leading-[1.1] flex flex-col">
    {/* MAXIMORA */}
    <span
      className="
        text-xl font-extrabold tracking-wide 
        bg-gradient-to-r from-white to-white
        bg-clip-text text-transparent 
        transition-all duration-500
        group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-yellow-400
      "
    >
      MAXIMORA
    </span>

    {/* Alt yazı */}
    <span className="text-[10px] tracking-[0.3em] text-blue-400 uppercase group-hover:text-yellow-400 transition">
      Lifestyle & Tech Store
    </span>
  </div>
</Link>


  {/* Right Nav — HESABIM DROPDOWN */}
<div className="relative flex items-center gap-3 z-30 header-icons">


  {/* ❤️ FAVORİLER */}
  <Link
    to="/favorites"
    className="relative rounded-xl p-2 hover:bg-white/5 transition"
  >
    <Heart className="w-6 h-6 text-pink-400" />
    {favCount > 0 && (
      <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-lg">
        {favCount}
      </span>
    )}
  </Link>

  {/* 🛒 SEPET */}
  <Link
    to="/cart"
    className="relative rounded-xl p-2 hover:bg-white/5 transition"
  >
    <ShoppingCart className="w-6 h-6 text-yellow-400" />
    {cart?.length > 0 && (
      <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-lg">
        {cart.length}
      </span>
    )}
  </Link>

 {/* 👤 HESABIM BUTTON */}
<button
  onClick={() => {
    setLoginOpen(false);
    setSignupOpen(false);
    setResetOpen(false);
    setAccountOpen(!accountOpen);
  }}
  className="
    account-button
    flex items-center gap-2 px-3 py-2 rounded-xl
    bg-white/10 border border-white/10
    hover:bg-white/20 transition
  "
>

    <User2 className="w-5 h-5 text-yellow-400" />

    <div className="leading-tight text-left hidden sm:block">
      <div className="text-[10px] text-gray-300">HESABIM</div>
      <div className="text-xs font-bold">
        {session ? session.user.email.split('@')[0].toUpperCase() : "Giriş Yap"}
      </div>
    </div>
  </button>

  {/* ⬇️ DROPDOWN */}
  {accountOpen && (
  <div
    className="
      account-menu
      absolute right-0 top-full mt-2 w-56 
      bg-[#111] border border-white/10 rounded-xl shadow-xl
      z-[1500] animate-fadeIn
    "
  >

      {session ? (
        <>
          <button
            onClick={() => {
              setAccountOpen(false);
              go("/dashboard", true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 text-sm"
          >
            <User2 className="w-5 h-5 text-purple-400" />
            Profilim
          </button>

          <button
            onClick={() => {
              setAccountOpen(false);
              go("/orders", true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 text-sm"
          >
            <PackageSearch className="w-5 h-5 text-yellow-400" />
            Siparişlerim
          </button>
             <button
      onClick={() => setOrderCheckOpen(true)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition text-sm"
    >
      <PackageSearch className="w-5 h-5 text-blue-400" />
      Sipariş Sorgula
    </button>
          <button
            onClick={() => {
              setAccountOpen(false);
              go("/favorites", true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 text-sm"
          >
            <Heart className="w-5 h-5 text-rose-400" />
            Favorilerim
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setAccountOpen(false);
                window.location.href = "/admin";
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 text-sm text-yellow-400 font-semibold"
            >
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              Admin Paneli
            </button>
          )}

          <button
            onClick={async () => {
              setAccountOpen(false);
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/10 text-sm text-red-300"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            Çıkış Yap
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setAccountOpen(false);
              setLoginOpen(true);
            }}
            className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm"
          >
            Giriş Yap
          </button>

          <button
            onClick={() => {
              setAccountOpen(false);
              setSignupOpen(true);
            }}
            className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm"
          >
            Kayıt Ol
          </button>
        </>
      )}
    </div>
  )}
</div>


        </div>
      </header>

      {/* LEFT DRAWER (Premium Glass) */}
      {/* ✅ Sağ Login Drawer Overlay - dışa tıklayınca kapanır */}
{loginOpen && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
    onClick={() => setLoginOpen(false)}
  ></div>
)}
{/* ✅ Menu Overlay (outside click closes menu) */}
{menuOpen && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
    onClick={() => setMenuOpen(false)}
  ></div>
)}

      <aside
        className={`fixed top-0 left-0 h-full w-80 backdrop-blur-xl bg-[rgba(10,10,10,0.75)] border-r border-yellow-500/25 shadow-[0_0_40px_rgba(255,215,0,0.15)] transform transition-transform duration-300 z-[999] ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-yellow-400">Keşfet</h2>
          <button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 hover:bg-white/10 transition" aria-label="Kapat">
            <X className="w-6 h-6" />
          </button>
        </div>

  

        {/* ✅ Dinamik kategoriler */}
<nav className="p-5 flex flex-col gap-3">
  {categories.length === 0 ? (
    <p className="text-gray-400 text-sm">Kategori bulunamadı.</p>
  ) : (
    categories.map((cat) => (
      <CategoryLink
        key={cat.id}
        to={`/category/${encodeURIComponent(cat.slug)}`}
        text={cat.name}
        setMenuOpen={setMenuOpen}
      />
    ))
  )}
</nav>

      </aside>
{/* ✅ Premium Login Drawer */}
<div
  className={`fixed top-0 right-0 h-full w-96 bg-black/70 backdrop-blur-2xl border-l border-yellow-500/20
  shadow-[0_0_45px_rgba(255,215,0,0.25)] transform transition-transform duration-300 z-[9999]
  ${loginOpen ? "translate-x-0" : "translate-x-full"}`}
  onClick={(e) => e.stopPropagation()} // ✅ Drawer içinde tıklayınca kapanmayı engeller
>
  <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
    <h2 className="text-lg font-bold text-yellow-400">Giriş Yap</h2>
    <button
      onClick={() => setLoginOpen(false)}
      className="text-gray-300 hover:text-yellow-300 transition"
    >
      ✕
    </button>
  </div>

  <form onSubmit={handleLogin} className="px-6 py-4 space-y-5">

  
    {/* Email */}
    <div>
      <label className="text-sm text-gray-400">E-posta</label>
      <input
        type="email"
        value={login.email}
        onChange={(v) => setLogin({ ...login, email: v.target.value })}
        required
        className="w-full p-3 rounded-lg bg-[#1b1b1b] border border-yellow-500/20 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none"
      />
    </div>

    {/* Parola */}
<label className="text-sm text-gray-400">Şifre</label>
<div className="relative">
  <input
    type={login.show ? "text" : "password"}
    value={login.password}
    onChange={(v) => setLogin({ ...login, password: v.target.value })}
    required
    className="w-full p-3 rounded-lg bg-[#1b1b1b] border border-yellow-500/20 focus:border-yellow-400 focus:ring-0"
  />

  <button
  type="button"
  onClick={() => setLogin(s => ({ ...s, show: !s.show }))}
  className="absolute right-3 top-3 text-gray-300 hover:text-yellow-300 transition"
  aria-label={login.show ? "Şifreyi gizle" : "Şifreyi göster"}
>
  {/* ✅ TERSİNİ KOYDUK */}
  {login.show ? (
    /* Şifre görünüyorken => Eye (göz açık) */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    /* Şifre gizliyken => Çizgili göz */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  )}
</button>

</div>


    {/* Login Button */}
    <button
      type="submit"
      className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-rose-400 text-black font-semibold hover:brightness-110 transition"
    >
      Giriş Yap
    </button>
 {loginError && (
      <p className="text-red-400 text-sm text-center">{loginError}</p>
    )}

    {/* Links */}
    <div className="flex justify-between text-sm pt-1">
      <button
        type="button"
        onClick={() => {
          setLoginOpen(false);
          setResetOpen(true);
        }}
        className="text-gray-400 hover:text-yellow-300 transition"
      >
        Şifremi Unuttum
      </button>

      <button
        type="button"
        onClick={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
        className="text-gray-400 hover:text-yellow-300 transition"
      >
        Kayıt Ol
      </button>
    </div>
  </form>
</div>
{/* ✅ Signup Drawer */}
{!loginOpen && signupOpen && (
  <>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
      onClick={() => setSignupOpen(false)}
    ></div>

    <div
      className={`fixed top-0 right-0 h-full w-96 bg-black/70 backdrop-blur-2xl border-l border-yellow-500/20
      shadow-[0_0_45px_rgba(255,215,0,0.25)] transform transition-transform duration-300 z-[9999]`}
      onClick={(e) => e.stopPropagation()}
    >
     <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative">

  {/* ✅ Geri Butonu */}
  <button
    onClick={() => {
      setSignupOpen(false);
      setLoginOpen(true);
    }}
    className="absolute left-6 text-gray-300 hover:text-yellow-300 transition"
    aria-label="Geri"
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>

  <h2 className="text-lg font-bold text-yellow-400 mx-auto">Kayıt Ol</h2>

  {/* ✅ Premium X Butonu */}
  <button
    onClick={() => setSignupOpen(false)}
    className="text-gray-300 hover:text-red-400 transition"
    aria-label="Kapat"
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>

</div>


        
      <form onSubmit={handleSignup} className="px-6 py-4 space-y-5">
        <div>
  
    <input
      type="text"
      placeholder="Kullanıcı Adı"
      required
      value={signup.username}
      onChange={(v) => setSignup({ ...signup, username: v.target.value })}
      className="mt-1 w-full p-3 rounded-lg bg-[#1b1b1b] border border-yellow-500/20"
    />
  </div>
  
        <input type="email" placeholder="E-posta" required
          value={signup.email}
          onChange={(v) => setSignup({ ...signup, email: v.target.value })}
          className="w-full p-3 rounded-lg bg-[#1b1b1b] border border-yellow-500/20 focus:ring-yellow-400"
        />

      
<div className="relative">
  <input
    type={signup.show ? "text" : "password"}
    placeholder="Şifre"
    required
    value={signup.password}
    onChange={(v) => setSignup({ ...signup, password: v.target.value })}
    className="w-full p-3 rounded-lg bg-[#1b1b1b] border border-yellow-500/20 focus:ring-0"
  />

  {/* ✅ Premium Göz */}
  <button
    type="button"
    onClick={() => setSignup(s => ({ ...s, show: !s.show }))}
    className="absolute right-3 top-3 text-gray-300 hover:text-yellow-300 transition"
    aria-label={signup.show ? "Şifreyi gizle" : "Şifreyi göster"}
  >
    {signup.show ? (
      // ✅ Şifre görünüyorsa => Açık göz
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) : (
      // ✅ Şifre gizliyse => Çizgili göz
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3l18 18" />
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
</div>


        {signupError && <p className="text-red-400 text-sm">{signupError}</p>}
         {signupMsg && <p className="text-emerald-400 text-sm">{signupMsg}</p>}


        <button className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-rose-400 text-black font-semibold">Kayıt Ol</button>
      </form>
    </div>
  </>
)}
{/* ✅ Password Reset Drawer */}
{!loginOpen && !signupOpen && resetOpen && (
  <>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
      onClick={() => setResetOpen(false)}
    ></div>

    <div
      className={`fixed top-0 right-0 h-full w-96 bg-black/70 backdrop-blur-2xl border-l border-yellow-500/20
      shadow-[0_0_45px_rgba(255,215,0,0.25)] transform transition-tr99]`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
        <h2 className="text-lg font-bold text-yellow-400">Şifre Sıfırla</h2>
        <button onClick={() => setResetOpen(false)} className="text-gray-300 hover:text-yellow-300">✕</button>
      </div>

      <form onSubmit={handleReset} className="px-6 py-4 space-y-5">
        <input type="email" placeholder="E-posta adresin" required
          value={reset.email}
          onChange={(v) => setReset({ email: v.target.value })}
          className="w-full p-3 rounded-lg bg-[#1b1b1b] border border-yellow-500/20 focus:ring-yellow-400"
        />

        {resetError && <p className="text-red-400 text-sm">{resetError}</p>}
      {resetMsg && <p className="text-emerald-400 text-sm">{resetMsg}</p>}


        <button className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-rose-400 text-black font-semibold">
          Sıfırlama Bağlantısını Gönder
        </button>
      </form>
    </div>
  </>
)}
{/* ✅ Sipariş Sorgulama Modali */}
{orderCheckOpen && (
  <div 
    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
    onClick={() => setOrderCheckOpen(false)}
  >
    <div 
      className="bg-neutral-900 text-white rounded-2xl p-6 w-full max-w-md border border-purple-500/30 shadow-[0_0_30px_rgba(160,60,255,0.25)]"
      onClick={(e)=>e.stopPropagation()}
    >
      <h2 className="text-xl font-bold mb-4 text-purple-400">📦 Sipariş Sorgula</h2>

      <input
        type="number"
        placeholder="Sipariş ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full p-3 rounded-lg bg-black border border-purple-500/20 focus:ring-purple-400 mb-3"
      />

      <input
        type="text"
        placeholder="Telefon Numaranız"
        value={orderPhone}
        onChange={(e) => setOrderPhone(e.target.value)}
        className="w-full p-3 rounded-lg bg-black border border-purple-500/20 focus:ring-purple-400 mb-5"
      />

      <button
        onClick={fetchOrder}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-yellow-400 text-black font-semibold hover:brightness-110 transition"
      >
        🔍 Sorgula
      </button>

      {foundOrder && (
        <div className="mt-6 bg-black/60 p-4 rounded-lg border border-purple-500/20">
          <p className="text-lg font-bold">Sipariş #{foundOrder.id}</p>
          <p className="text-sm text-gray-300">{foundOrder.created_at}</p>
{/* ✅ Premium Animated Status Badge */}
<div className="flex items-center gap-2 text-lg mt-3">
  <span
    className={`px-3 py-1 rounded-full text-xs font-bold border ${
      STATUS_BADGE[foundOrder.status]?.cls || ""
    } shadow-[0_0_12px_rgba(168,85,247,0.7)] border-purple-400/50 status-blink`}
  >
    {STATUS_BADGE[foundOrder.status]?.text || STATUS_BADGE[foundOrder.status]?.txt || "Durum Yok"}


    {foundOrder.status === "awaiting_payment" && (
      <span className="ml-2 text-yellow-400">⚠️</span>
    )}
    {foundOrder.status === "processing" && (
      <span className="ml-2 text-purple-400 gear-spin">⚙️</span>
    )}
    {foundOrder.status === "shipped" && (
      <span className="truck-anim ml-2">🚚</span>
    )}
    {foundOrder.status === "delivered" && (
      <span className="ml-2">✅</span>
    )}
    {foundOrder.status === "cancelled" && (
      <span className="ml-2">❌</span>
    )}
  </span>
</div>


          {foundOrder.items.map((item, i) => (
            <p key={i} className="text-sm text-gray-200">
              • {item.product_name} x{item.quantity}
            </p>
          ))}
        </div>
      )}
    </div>
  </div>
)}



    </>
  );
}
/* --- tiny components --- */
function Bubble({ value, tone = "emerald" }) {
  const color = tone === "rose" ? "bg-rose-500" : tone === "emerald" ? "bg-emerald-500" : "bg-yellow-400";
  return (
    <span className={`absolute -top-1.5 -right-2 ${color} text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold`}>
      {value}
    </span>
  );
}

function CategoryLink({ to, text, soon, setMenuOpen }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    if (soon) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "danger", text: "⛔ Yakında!" },
        })
      );
      return;
    }

    // ✅ Önce drawer yumuşak kapanır
    setMenuOpen(false);

    // ✅ Drawer kapanma animasyonu bitince yönlendir
    setTimeout(() => {
      navigate(to);
    }, 250);
  };

  return (
    <a
      href={soon ? "#" : to}
      onClick={handleClick}
      className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 transition"
    >
      <span>{text}</span>

      {soon && (
        <span className="text-[10px] px-2 py-[2px] rounded-full border border-yellow-400/50 text-yellow-300 bg-yellow-400/10">
          Yakında
        </span>
      )}
    </a>
  );
}



function Drawer({ open, onClose, title, children }) {
  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-[#111]/95 backdrop-blur-xl text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] transform transition-transform duration-300 z-[9999] ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-semibold text-yellow-400">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">✕</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Input({ onChange, ...props }) {
  return (
    <input
      {...props}
      onChange={(e) => onChange?.(e?.target?.value ?? "")}
      className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none"
    />
  );
}
function PasswordInput({ value, onChange, show, setShow, ...props }) {
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none"
      />
      <button type="button" onClick={() => setShow?.(!show)} className="absolute right-3 top-2 text-gray-400 hover:text-yellow-300">
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
  
}
