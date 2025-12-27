
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

// ✅ HEADER + BANNER + KAYAN YAZI TOPLAM YÜKSEKLİĞİNİ HESAPLA
useEffect(() => {
  const offset =
    (scrollText?.active
      ? scrollText.height_px
      : headerBanner?.height_px || 0) +
    72; // header yüksekliği (sabit)

  document.documentElement.style.setProperty(
    "--header-offset",
    `${offset}px`
  );
}, [scrollText, headerBanner]);


// ⭐ Scroll Text varsa body'e class ekle / kaldır
useEffect(() => {
  if (scrollText?.active) {
    document.body.classList.add("has-scroll-text");
  } else {
    document.body.classList.remove("has-scroll-text");
  }

  // cleanup (component unmount olursa)
  return () => {
    document.body.classList.remove("has-scroll-text");
  };
}, [scrollText]);

const [profile, setProfile] = useState(null);

useEffect(() => {
  async function loadProfile() {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .maybeSingle();

    setProfile(data);
  }

  loadProfile();
}, [session]);

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
.or(`is_global.eq.true,user_id.eq.${user.id},user_email.eq.${user.email}`)
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

    <style>
{`
  @media (max-width: 380px) {
    .header-mobile-top {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 6px !important;
    }

    .header-mobile-top .logo-block {
      margin-right: auto !important;
    }

    .header-mobile-top .search-block {
      width: 100% !important;
    }
  }
`}
</style>


 {/* 🔥 TOP SLOT (Kayan Yazı / Banner AYNI KONUM) */}
<div
  className="fixed top-0 left-0 w-full z-[10000]"
  style={{
    height: scrollText?.active
      ? `${scrollText.height_px}px`
      : headerBanner?.height_px
      ? `${headerBanner.height_px}px`
      : "0px",
  }}
>
  {scrollText?.active ? (
    <ScrollingText data={scrollText} />
  ) : headerBanner?.image_url ? (
    <img
      src={headerBanner.image_url}
      alt="Top Banner"
      className="w-full h-full object-cover"
    />
  ) : null}
</div>


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
<header
  className="
    bg-white text-gray-800 border-b border-gray-200 shadow-sm
    z-[9999]
    fixed left-0 w-full
    backdrop-blur-md
  "
  style={{
  top: `${
  scrollText?.active
    ? scrollText.height_px
    : headerBanner?.height_px || 0
}px`,

  }}
>



  {/* ⭐ MOBİL ÜST BAR — SADECE <lg */}
<div className="flex lg:hidden w-full px-3 py-2 items-center gap-3">

  {/* Menü */}
  <button
    onClick={() => setMenuOpen(true)}
    className="p-2 rounded-lg hover:bg-gray-100"
  >
    <Menu className="w-6 h-6 text-gray-800" />
  </button>

  {/* Logo */}
  <Link to="/" className="shrink-0">
    <img src="/logo.png" className="w-10 h-10" />
  </Link>

  {/* Arama */}
  <div onClick={() => setSearchOpen(true)} className="flex-1">
    <div className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-2">
      <Search className="text-gray-500 w-4 h-4" />
      <span className="text-sm text-gray-600 ml-1">Ara...</span>
    </div>
  </div>

  {/* Favori */}
  <Link to="/favorites" className="relative">
    <Heart className="w-6 h-6 text-gray-700" />
    {favCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
        {favCount}
      </span>
    )}
  </Link>
</div>



<div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 py-3">

      {/* 🔥 SOLA YASLANAN BLOK */}
<div className="hidden lg:flex items-center gap-3 md:absolute md:left-4 md:top-1/2 md:-translate-y-1/2 header-mobile-top">



  {/* Menu */}
  <button
    onClick={() => setMenuOpen(true)}
    className="
      rounded-xl p-2 hover:bg-white/5 transition
    "
    aria-label="Menü"
  >
    <Menu className="w-6 h-6" />
  </button>

  {/* Logo + Yazılar */}
 {/* Logo + Yazılar */}
<Link
  to="/"
  className="
    logo-block flex items-center gap-3 
    z-[50] relative shrink-0
    w-[120px]    /* 🔥 LOGO BLOĞU SABİT GÇŞLİK */
  "
>




  {/* Logo */}
 <img
  src="/logo.png"
  alt="Maximora Logo"
  className="
    w-12 h-12
    sm:w-10 sm:h-10
    object-contain
    drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]
    transition-all duration-300
  "
/>


  {/* Yazılar */}
  <div className="leading-[1.1] flex flex-col hidden sm:flex">

   <div className="relative flex items-center gap-[1px]">
  {/* MAT SİYAH YAZI */}
  <span className="text-gray-900 font-extrabold tracking-wide text-xl">
    MAXI
  </span>

  {/* GOLD AKSENT – SADECE M */}
  <span className="text-[#C9A24D] font-extrabold tracking-wide text-xl">
    M
  </span>

  {/* DEVAM */}
  <span className="text-gray-900 font-extrabold tracking-wide text-xl">
    ORA
  </span>
</div>

    {/* Alt yazı */}
    <span className="text-[10px] tracking-[0.3em] text-blue-400 uppercase group-hover:text-yellow-400 transition">
      Lifestyle & Tech Store
    </span>

  </div>

</Link>

</div>


  {/* Right Nav — HESABIM DROPDOWN */}
<div className="flex items-center gap-7 header-icons ml-auto shrink-0 z-[20]">


{/* 🔍 MASAÜSTÜ SEARCH BAR */}
<div className="
  hidden lg:flex items-center 
  w-[380px] xl:w-[480px] 2xl:w-[555px]
  justify-center mx-auto
">
  <SearchBar />
</div>


  {/* ❤️ FAVORİLER */}
 <Link
  to="/favorites"
className="relative rounded-xl p-1 sm:p-2 hover:bg-white/5 transition hidden lg:flex"
>

   <Heart className="w-6 h-6 text-gray-700" />
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
 <ShoppingCart className="w-6 h-6 text-[#f27a1a]" />
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
   {/* 🆕 KAYIT OL — TRENDYOL STİLİ */}
<Link
  to="/register"
  className="
    hidden 2xl:flex items-center gap-2
    px-3 py-2
    rounded-xl
    border border-gray-200
    hover:bg-gray-100
    transition
  "
>
  <UserPlus className="w-5 h-5 text-gray-700" />

  <span className="text-sm font-medium text-gray-700">
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
{/* 👤 Giriş Yap / Hesabım BUTONU — TRENDYOL STİLİ */}
<button
  onClick={() => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setAccountModal(true);
  }}
  className="
    hidden 2xl:flex items-center gap-2
    px-3 py-2
    rounded-xl
    border border-gray-200
    hover:bg-gray-100
    transition
  "
>
  <User2 className="w-5 h-5 text-gray-700" />

  {!session ? (
    <span className="text-sm font-medium text-gray-700">
      Giriş Yap
    </span>
  ) : (
    <div className="flex flex-col leading-tight text-left">
      <span className="text-sm font-semibold text-gray-800">Hesabım</span>
  <span className="text-xs font-semibold text-gray-800 max-w-[110px] truncate tracking-wide">
  {profile?.full_name || session.user.email.split("@")[0]}



      </span>
    </div>
  )}
</button>


</div>

       </div>
      </header>

      
 
{/* 🌌 MAXIMORA PREMIUM GLASS DRAWER */}

{menuOpen && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
    onClick={() => setMenuOpen(false)}
  ></div>
)}

<aside
  className={`
    fixed top-0 left-0 h-full w-[320px]
    bg-[#0b0f14]/90 backdrop-blur-2xl
    text-white
    border-r border-white/10
    shadow-[0_0_80px_rgba(0,255,200,0.18)]
    transition-transform duration-300 
    z-[99999]
    ${menuOpen ? "translate-x-0" : "-translate-x-full"}
  `}
>

  {/* HEADER */}
  <div className="flex justify-between items-center px-5 py-5 border-b border-white/10">
    <span className="text-xl font-bold tracking-widest text-emerald-300">MENU</span>
    <button
      onClick={() => setMenuOpen(false)}
      className="p-2 rounded-lg hover:bg-white/10"
    >
      <X className="w-6 h-6 text-white" />
    </button>
  </div>

  {/* USER */}
  <div className="px-5 py-5 border-b border-white/10">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-lg">
        {session
          ? (profile?.full_name || session.user.email)[0].toUpperCase()
          : "?"}
      </div>

      <div>
        <p className="font-semibold">
          {session ? (profile?.full_name || session.user.email) : "Misafir"}
        </p>

        <button
          onClick={() =>
            session ? setAccountModal(true) : (window.location.href = "/login")
          }
          className="text-emerald-300 text-xs mt-1"
        >
          {session ? "Hesabım" : "Giriş Yap"}
        </button>
      </div>
    </div>
  </div>

  {/* KATEGORİLER */}
  <nav className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[65vh]">
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => {
          setMenuOpen(false);
          setTimeout(() => navigate(`/category/${cat.slug}`), 250);
        }}
        className="
          w-full flex justify-between items-center
          px-4 py-3 rounded-xl
          bg-white/5 border border-white/10
          hover:bg-white/10 hover:border-emerald-400/40
          hover:shadow-[0_0_20px_rgba(0,255,200,0.25)]
          transition
        "
      >
        <span className="font-medium">{cat.title}</span>
        <ChevronRight className="text-emerald-300 w-4 h-4" />
      </button>
    ))}
  </nav>

  {/* SEPET */}
  <div className="absolute bottom-5 left-0 w-full px-5">
    <button
      onClick={() => (window.location.href = "/cart")}
      className="
        w-full flex items-center justify-center gap-3
        py-3 rounded-xl
        bg-gradient-to-r from-emerald-400 to-cyan-400
        text-black font-bold
        shadow-[0_0_25px_rgba(0,255,200,0.6)]
        hover:brightness-110 transition
      "
    >
      <ShoppingCart className="w-5 h-5" />
      Sepetim ({cart?.length || 0})
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

{/* 📱 MOBİL ALT BAR — COMPACT PRO VERSION */}
<div
  className={`
    fixed bottom-0 left-0 w-full 
    bg-black/80 backdrop-blur-xl
    border-t border-white/10
    flex justify-center gap-10 items-center 
    py-2 z-[99999]
    2xl:hidden
    ${menuOpen ? "hidden" : ""}
  `}
>


  {/* 🔥 GİRİŞ YAP (SADECE login yoksa) */}
  {!session && (
    <button
      onClick={() => (window.location.href = '/login')}
      className="flex flex-col items-center text-white"
    >
      <User2 className="w-6 h-6 text-gray-300" />
      <span className="text-[10px] mt-1">Giriş</span>
    </button>
  )}

  {/* 🔥 KAYIT OL (SADECE login yoksa) */}
  {!session && (
    <button
      onClick={() => (window.location.href = '/register')}
      className="flex flex-col items-center text-white"
    >
      <UserPlus className="w-6 h-6 text-blue-300" />
      <span className="text-[10px] mt-1">Kayıt Ol</span>
    </button>
  )}

  {/* 🔥 HESABIM (SADECE login varsa) */}
  {session && (
    <button
      onClick={() => setAccountModal(true)}
      className="flex flex-col items-center text-white"
    >
      <User2 className="w-6 h-6 text-yellow-300" />
     <span className="text-[11px] mt-1 font-medium max-w-[70px] truncate leading-tight">
  {profile?.full_name || session.user.email.split("@")[0]}


      </span>
    </button>
  )}

  {/* MESAJLAR */}
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
    <span className="text-[10px] mt-1">Mesaj</span>
  </button>

  {/* SEPET */}
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
<style>
{`
  @media (max-width: 480px) {
    .logo-block {
      margin-right: auto !important;
    }

    .search-block {
      flex: 1 !important;
      max-width: 100% !important;
    }

    header .header-mobile-top {
      gap: 4px !important;
    }
  }
`}
</style>


 