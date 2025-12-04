
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
import { Heart, ShoppingCart, User2, LogOut, PackageSearch, Menu, ShieldCheck, X, MessageSquare } from "lucide-react";
import { Truck } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ScrollingText from "../components/ScrollingText";
import AccountModal from "../components/AccountModal";
import { UserPlus } from "lucide-react";
import SearchBar from "../components/SearchBar";
import { Search } from "lucide-react";
import { ChevronRight } from "lucide-react";




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
  const navigate = useNavigate();
  // ⭐ Banner Settings
const [headerBanner, setHeaderBanner] = useState(null);
const [scrollText, setScrollText] = useState(null);

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
  const [unreadCount, setUnreadCount] = useState(0);
 
  const [knightOpen, setKnightOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
 



// ✅ Dinamik kategoriler (Supabase'den çek)
const [categories, setCategories] = useState([]);

const [accountModal, setAccountModal] = useState(false);




useEffect(() => {
  
  if (accountModal) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}, [accountModal]);

useEffect(() => {
  if (accountModal) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.remove("modal-open");
  }
}, [accountModal]);

// ⭐ Banner verisini Supabase'den çek
const loadHeaderBanner = async () => {
  const { data } = await supabase
    .from("banner_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!data) return;

  const now = new Date();
  const start = data.start_date ? new Date(data.start_date) : null;
  const end = data.end_date ? new Date(data.end_date) : null;

  let show = data.is_active;

  if (start && now < start) show = false;
  if (end && now > end) show = false;

  if (show) setHeaderBanner(data);
};
 // 🟦 Mesajları yükle
async function loadUnreadMessages() {
  const user = (await supabase.auth.getUser()).data.user;

  
  if (!user) return;

 const { data, error } = await supabase
  .from("messages")
  .select("*")
  .or(`is_global.eq.true,user_id.eq.${user.id}`)
  .eq("is_read", false)
  .eq("hidden_by_user", false);   // ⭐⭐ EKLENECEK SATIR

  if (!error) setUnreadCount(data.length);
  if (!error) {
  setUnreadCount(data.length);

 
}

}

// 🟦 Mesaj silinince unread count’u güncelle
useEffect(() => {
  function refresh() {
    loadUnreadMessages();
  }

  window.addEventListener("refresh-unread", refresh);
  return () => window.removeEventListener("refresh-unread", refresh);
}, [session]);


// 🟡 ⭐⭐ BURAYA EKLİYORSUN ⭐⭐
async function loadScroll() {
 
  const { data } = await supabase
    .from("scroll_text")
    .select("*")
    .eq("id", 1)
    .single();

  setScrollText(data);
}

// 🟦 Session değişince unread mesajları yükle
useEffect(() => {
  if (session) loadUnreadMessages();
}, [session]);

// 🟦 İlk yüklemeler (banner, categories…)


useEffect(() => {
  loadHeaderBanner();
   loadScroll(); 
  (async () => {
     if (session) loadUnreadMessages();
    const { data, error } = await supabase
      .from("main_categories")
      .select("*")
     .order("sort_index", { ascending: true });

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


// 🟦 Realtime: Yeni mesaj gelince güncelle
useEffect(() => {
  const channel = supabase
    .channel("realtime:messages")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
      loadUnreadMessages();
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []); // ❗ BOŞ ARRAY



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

    {/* 🔥 GLOBAL MOBIL ICON KÜÇÜLTÜCÜ */}
    <style>
      {`
        @media (max-width: 640px) {
          .header-icons svg {
            width: 20px !important;
            height: 20px !important;
          }
        }
      `}
    </style>

    {scrollText && scrollText.active && (
  <ScrollingText data={scrollText} />
)}


    {/* ⭐⭐⭐ GLOBAL ÜST BANNER */}
{headerBanner && headerBanner.image_url && (
  <div
    style={{
      width: "100%",
      height: `${headerBanner.height_px}px`,
      backgroundImage: `url(${headerBanner.image_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
    className="cursor-pointer"
  ></div>
)}

{/* ✅ Premium Modal Notification (Center Popup - Final Clean Version) */}
{notificationsReady && notifications.length > 0 && !hideNotification && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
    <div className="bg-[#111] border border-yellow-500/40 rounded-2xl shadow-[0_0_35px_rgba(255,215,0,0.3)] p-4 sm:p-6 w-full max-w-sm sm:max-w-md text-center animate-fadeIn">
      <h2 className="text-yellow-400 text-lg font-bold mb-3">
        🔔 {notifications[0]?.title || "Yeni Duyuru"}
      </h2>

      {/* 📸 Bildirim Görseli (Varsa) */}
{notifications[0]?.image_url && (
  <img
    src={notifications[0].image_url}
    alt="notification-img"
    className="w-full rounded-xl mb-4 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
  />
)}
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
  <header className="bg-[#050505] text-white border-b border-yellow-500/20 shadow-[0_0_20px_rgba(255,215,0,0.08)] z-[999] relative">

  <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 py-3">

          {/* Menu */}
         <button
  onClick={() => setMenuOpen(true)}
  className="
    rounded-xl p-2 hover:bg-white/5 transition
    md:mr-6   /* ⭐ Masaüstünde menüyü sağa 24px kaydırdık */
  "
  aria-label="Menü"
>
  <Menu className="w-6 h-6" />
</button>


         
      {/* ✅ Maximora Logo (Blue + Gold Premium Edition) */}
<Link to="/" className="flex items-center gap-4 group mr-auto">
 {/* ✅ Mavi + Altın Degrade Logo */}
{/* ✅ Mavi + Altın Premium Logo (Net Harf Versiyonu) */}
<img
  src="/logo.png"
  alt="Maximora Logo"
  className="
    w-11 h-11 object-contain 
    drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]
    group-hover:scale-110 
    transition-all duration-300
  "
/>


  

  {/* Yazılar */}
<div className="leading-[1.1] flex flex-col hidden sm:flex">
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
<div className="relative flex items-center gap-7 z-30 header-icons ml-auto">



{/* 🔍 MASAÜSTÜ SEARCH BAR */}
<div className="hidden lg:flex items-center w-[610px] justify-center mx-8">
  <SearchBar />
</div>


{/* 🔍 MOBIL MINI SEARCH BAR (SADECE <768px) */}
<div className="flex lg:hidden items-center w-[220px] sm:w-[220px] mx-2">
  <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-full px-3 py-2 w-full">
    <Search className="text-gray-300 w-4 h-4" />
    <input
      onFocus={() => setSearchOpen(true)}
      placeholder="Ara..."
      className="text-sm bg-transparent text-white placeholder-gray-400 outline-none w-full"
    />
  </div>
</div>






  {/* ❤️ FAVORİLER */}
  <Link
    to="/favorites"
   className="relative rounded-xl p-1 sm:p-2 hover:bg-white/5 transition"
  >
    <Heart className="w-6 h-6 text-pink-400" />
    {favCount > 0 && (
      <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-lg">
        {favCount}
      </span>
    )}
  </Link>

  
        
       {/* 💬 Mesajlar */}
<Link
  to="/mesajlarim"
  className="
    relative rounded-xl p-1 sm:p-2 hover:bg-white/5 transition
    hidden 2xl:flex
  "
>

  <MessageSquare className="w-6 h-6 text-blue-400" />

  {unreadCount > 0 && (
    <span
      className="
        absolute -top-1.5 -right-1.5 
        bg-blue-500 text-white text-[10px]
        min-w-[18px] h-[18px]
        flex items-center justify-center 
        rounded-full font-bold shadow-lg
      "
    >
      {unreadCount}
    </span>
  )}
</Link>





  {/* 🛒 SEPET */}
 <Link
  to="/cart"
  className="relative rounded-xl p-1 sm:p-2 hover:bg-white/5 transition hidden 2xl:flex"
>
    <ShoppingCart className="w-6 h-6 text-yellow-400" />
    {cart?.length > 0 && (
      <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-lg">
        {cart.length}
      </span>
    )}
  </Link>

  {/* 🆕 KAYIT OL BUTONU (Sadece giriş yoksa görünür) */}
{/* 🆕 MOBİLDE BUTON DEĞİL İKON GÖRÜNECEK */}
{!session && (
  <>
    {/* DESKTOP: Kayıt Ol */}
   <Link
  to="/register"
  className="
    hidden lg:flex items-center gap-2
    h-[40px] px-4 min-w-[110px]
    rounded-xl
    bg-blue-500/20 border border-blue-400/40
    hover:bg-blue-500/30 transition
  "
>
  <UserPlus className="w-5 h-5 text-blue-300" />
  <span className="text-xs font-semibold text-blue-200 whitespace-nowrap">
    Kayıt Ol
  </span>
</Link>


    {/* MOBILE: Sadece ikon (UserPlus) */}
   <Link
  to="/register"
  className="hidden"
>

      <UserPlus className="w-6 h-6 text-blue-300" />
    </Link>
  </>
)}

{/* 👤 HESABIM / GİRİŞ YAP */}
<button
  onClick={() => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setAccountModal(true);
  }}
  className="
  account-button
  hidden 2xl:flex
  items-center gap-2
    h-[32px] sm:h-[40px]
    px-2 sm:px-3
    rounded-xl bg-white/10 border border-white/10
    hover:bg-white/20 transition
  "
>
  {/* MOBILE: Sadece ikon */}
<User2 className="sm:hidden w-5 h-5 text-yellow-400" />

  {/* DESKTOP: Yazılı */}
  <User2 className="hidden sm:block w-5 h-5 text-yellow-400" />
 <span className="hidden sm:block text-xs font-semibold text-white whitespace-nowrap">
  {session 
    ? (session.user.user_metadata?.username 
        ? session.user.user_metadata.username 
        : session.user.email.split('@')[0])
    : "Giriş Yap"}
</span>

</button>
</div>

       </div>
      </header>

      



   {/* ⭐⭐ ULTRA PREMIUM LEFT DRAWER — V12 ⭐⭐ */}

{/* Overlay (arka plan blur + tıklayınca kapanır) */}
{menuOpen && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] transition-opacity duration-300"
    onClick={() => setMenuOpen(false)}
  ></div>
)}

<aside
  className={`
    fixed top-0 left-0 h-full w-[300px]
    bg-[rgba(13,13,13,0.78)] backdrop-blur-2xl
    border-r border-yellow-500/20
    shadow-[0_0_50px_rgba(255,215,0,0.25)]
    transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]
    z-[99999]
    ${menuOpen ? "translate-x-0" : "-translate-x-full"}
  `}
>

  {/* Header */}
  <div className="
    flex justify-between items-center
    px-5 py-4 
    border-b border-yellow-500/20 
    bg-black/20
    shadow-[0_0_15px_rgba(255,215,0,0.05)]
  ">
    <h2 className="text-lg font-bold text-yellow-400 tracking-wide">
      KEŞFET 🔥
    </h2>

    <button
      onClick={() => setMenuOpen(false)}
      className="
        p-2 rounded-lg
        hover:bg-white/10 
        text-gray-300
        transition-all
      "
    >
      <X className="w-6 h-6" />
    </button>
  </div>

  {/* Kullanıcı Kartı */}
  <div className="
    px-5 py-4 
    border-b border-yellow-500/10 
    bg-black/10
  ">
    {!session ? (
      <div className="flex gap-3 items-center">
        <User2 className="w-10 h-10 p-2 rounded-xl bg-white/5 text-yellow-300" />
        <div>
          <p className="text-white/80 text-sm">Giriş Yap / Kayıt Ol</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="text-yellow-400 text-xs underline"
          >
            Hesabına giriş yap
          </button>
        </div>
      </div>
    ) : (
      <div className="flex gap-3 items-center">
        <User2 className="w-10 h-10 p-2 rounded-xl bg-white/5 text-yellow-300" />
        <div>
          <p className="text-white/90 font-semibold">
            {session.user.user_metadata?.username ||
              session.user.email.split("@")[0]}
          </p>

          <button
            onClick={() => setAccountModal(true)}
            className="text-yellow-400 text-xs underline"
          >
            Hesabım
          </button>
        </div>
      </div>
    )}
  </div>

  {/* Kategoriler */}
  <nav
    className="
      p-4 flex flex-col gap-3 
      overflow-y-auto 
      max-h-[65vh]
      custom-scroll
    "
  >
    {categories.length === 0 ? (
      <p className="text-gray-400 text-sm">Kategori bulunamadı.</p>
    ) : (
      categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => {
            setMenuOpen(false);
            setTimeout(() => navigate(`/category/${cat.slug}`), 250);
          }}
          className="
            w-full flex items-center justify-between
            bg-white/5 hover:bg-white/10
            px-4 py-3
            rounded-lg
            border border-white/10
            transition-all duration-200
            hover:translate-x-1
            group
          "
        >
          <span className="text-white text-sm font-medium flex items-center gap-2">
            <span
              className="
                w-2 h-2 rounded-full bg-yellow-400
                shadow-[0_0_8px_#facc15]
              "
            ></span>
            {cat.title}
          </span>

          <ChevronRight
            className="
              w-4 h-4 text-gray-400 
              group-hover:text-yellow-400 
              transition
            "
          />
        </button>
      ))
    )}
  </nav>

 {/* Footer */}
<div
  className="
    absolute left-0 w-full px-4 
    pb-6   /* 🔥 Sepeti yukarı alır */
    bottom-10 /* 🔥 10px değil, 40px yukarı çıkarır */
  "
>
  <button
    onClick={() => (window.location.href = "/cart")}
    className="
      flex items-center gap-3 w-full
      bg-yellow-500/20 
      border border-yellow-500/40
      rounded-xl px-4 py-3
      hover:bg-yellow-500/30 transition
      shadow-[0_0_12px_rgba(255,215,0,0.25)]
    "
  >
    <ShoppingCart className="w-5 h-5 text-yellow-300" />
    <span className="text-sm text-yellow-300 font-semibold">
      Sepetim ({cart?.length || 0})
    </span>
  </button>
</div>


</aside>

{/* Scrollbar style */}
<style>
  {`
    .custom-scroll::-webkit-scrollbar { width: 6px; }
    .custom-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 204, 0, 0.4);
      border-radius: 10px;
    }
  `}
</style>



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
{/* 🔍 FULLSCREEN SEARCH MODAL */}
{searchOpen && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[99999] p-6">
    
    {/* Kapat */}
    <button
      onClick={() => setSearchOpen(false)}
      className="text-white text-right mb-3 w-full"
    >
      <X size={32} />
    </button>

    {/* Search Bar */}
    <div className="max-w-2xl mx-auto mt-4">
      <SearchBar />
    </div>
  </div>
)}

{/* 📱 MOBİL ALT BAR — HER ZAMAN GÖRÜNÜR */}
<div
  className="
    fixed bottom-0 left-0 w-full 
    bg-black/80 backdrop-blur-xl
    border-t border-white/10
    flex justify-center gap-10 items-center 
    py-2 z-[99999]
    2xl:hidden
  "
>

  {/* Giriş */}
  {!session && (
    <button
      onClick={() => (window.location.href = '/login')}
      className="flex flex-col items-center text-white"
    >
      <User2 className="w-6 h-6 text-yellow-400" />
      <span className="text-[10px] mt-1">Giriş</span>
    </button>
  )}

  {/* Kayıt Ol */}
  {!session && (
    <button
      onClick={() => (window.location.href = '/register')}
      className="flex flex-col items-center text-white"
    >
      <UserPlus className="w-6 h-6 text-blue-400" />
      <span className="text-[10px] mt-1">Kayıt Ol</span>
    </button>
  )}

  {/* 👤 Hesabım (SADECE login olunca görünür) */}
  {session && (
    <button
      onClick={() => setAccountModal(true)}
      className="flex flex-col items-center text-white"
    >
      <User2 className="w-6 h-6 text-yellow-400" />
     <span className="text-[10px] mt-1">
  {session.user.user_metadata?.username 
    ? session.user.user_metadata.username 
    : session.user.email.split('@')[0]}
</span>

    </button>
  )}

  {/* Mesajlar */}
  <button
    onClick={() => (window.location.href = '/mesajlarim')}
    className="flex flex-col items-center text-white relative"
  >
    <MessageSquare className="w-6 h-6 text-blue-400" />

    {unreadCount > 0 && (
      <span
        className="
          absolute -top-1 -right-3 bg-blue-500 text-white 
          text-[10px] min-w-[16px] h-[16px]
          flex items-center justify-center rounded-full font-bold
        "
      >
        {unreadCount}
      </span>
    )}

    <span className="text-[10px] mt-1">Mesajlar</span>
  </button>

  {/* Sepet */}
  <button
    onClick={() => (window.location.href = '/cart')}
    className="flex flex-col items-center text-white relative"
  >
    <ShoppingCart className="w-6 h-6 text-yellow-300" />

    {cart?.length > 0 && (
      <span
        className="
          absolute -top-1 -right-3 bg-yellow-500 text-black 
          text-[10px] min-w-[16px] h-[16px]
          flex items-center justify-center rounded-full font-bold
        "
      >
        {cart.length}
      </span>
    )}

    <span className="text-[10px] mt-1">Sepet</span>
  </button>

</div>





<AccountModal
  open={accountModal}
  onClose={() => setAccountModal(false)}
   onOrderCheck={() => setOrderCheckOpen(true)}
  session={session}
  isAdmin={isAdmin}
 unreadCount={unreadCount}
/>


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


 