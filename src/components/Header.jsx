// ✅ PREMIUM HEADER — v10 (full)
// - Admin e-posta: buzlu2667@gmail.com + admin@admin.com
// - Cart sayfasında “Giriş” butonu asla görünmez
// - Premium glass drawer, gold glow, sade ikon set
import { useNavigate } from "react-router-dom";
import { STATUS_BADGE } from "../utils/statusBadge";
import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { supabase } from "../lib/supabaseClient";
import { Heart, ShoppingCart, User2, LogOut, PackageSearch, Menu, ShieldCheck, X } from "lucide-react";
import { Truck } from "lucide-react";


function useFavoriteCount() {
  const { favorites } = useFavorites();
  return Array.isArray(favorites) ? favorites.length : 0;
}


const initialLogin = { email: "", password: "", show: false };
const initialSignup = { email: "", password: "", show: false };
const initialReset = { email: "" };

export default function Header() {
  const { session, isRecovering } = useSession();
  const { cart } = useCart();
  const favCount = useFavoriteCount();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
  const handler = () => {
    setLoginOpen(true);
    setSignupOpen(false);
    setResetOpen(false);
  };

  window.addEventListener("force-login", handler);
  return () => window.removeEventListener("force-login", handler);
}, []);


  const [login, setLogin] = useState(initialLogin);
  const [signup, setSignup] = useState(initialSignup);
  const [reset, setReset] = useState(initialReset);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [orderCheckOpen, setOrderCheckOpen] = useState(false);
const [orderId, setOrderId] = useState("");
const [orderPhone, setOrderPhone] = useState("");
const [foundOrder, setFoundOrder] = useState(null);


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
  setError("");

  const { error } = await supabase.auth.signInWithPassword({
    email: (login.email || "").trim(),
    password: login.password || "",
  });

  if (error) {
    setError(error.message);
  } else {
    setLogin(initialLogin);
    setLoginOpen(false);

    // ✅ Toast göster
    window.dispatchEvent(new CustomEvent("toast", {
      detail: {
        type: "success",
        text: "✅ Giriş başarılı! 👑 Hoş geldin!"
      }
    }));

    // ✅ Toast görünürken bekle → sonra yönlendir
    setTimeout(() => {
      const redirectTo =
        localStorage.getItem("redirect_after_login") || "/";
      localStorage.removeItem("redirect_after_login");

      window.location.href = redirectTo;
    }, 1400);
  }
}


  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const { error } = await supabase.auth.signUp({
      email: (signup.email || "").trim(),
      password: signup.password || "",
    });
    if (error) setError(error.message);
    else setMessage("✅ Kayıt başarılı! Giriş yapabilirsiniz.");
  }
  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(
      (reset.email || "").trim()
    );
    if (error) setError(error.message);
    else setMessage("📩 E-postanı kontrol et!");
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

  return (
    <>
      {/* TOPBAR */}
      <header className="bg-[#050505] text-white border-b border-yellow-500/20 shadow-[0_0_20px_rgba(255,215,0,0.08)] z-[60] overflow-hidden">
  <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 py-3">

          {/* Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-xl p-2 hover:bg-white/5 transition"
            aria-label="Menü"
          >
            <Menu className="w-6 h-6" />
          </button>

         
         {/* ✅ AZ CIRCLE LOGO */}
<Link to="/" className="flex items-center gap-4 group">
  <div
    className="
      w-11 h-11 rounded-full 
      bg-gradient-to-br from-yellow-300 to-amber-500
      flex items-center justify-center 
      text-black font-extrabold text-lg
      shadow-[0_0_18px_rgba(255,215,100,0.55)]
      group-hover:shadow-[0_0_30px_rgba(255,215,100,0.85)]
      group-hover:scale-110
      transition-all duration-300
    "
  >
    AZ
  </div>

  <div className="leading-[1.1] flex flex-col">
    <span className="text-xl font-extrabold tracking-wide">
      ASTORIA <span className="text-gray-300">ZELVO</span>
    </span>

    <span className="text-[10px] tracking-[0.3em] text-gray-400 uppercase">
      Lifestyle & Tech Store
    </span>
  </div>
</Link>

     {/* Right Nav */}
          <div className="flex items-center gap-2 sm:gap-6 flex-wrap justify-end min-w-0 overflow-x-visible">
            <button
  onClick={() => setOrderCheckOpen(true)}
  aria-label="Sipariş Sorgula"
  className="hover:text-purple-400 transition"
>
  <Truck className="w-6 h-6" />
</button>

            <button onClick={() => go("/favorites", true)} aria-label="Favoriler" className="relative hover:text-rose-400 transition">
              <Heart className="w-6 h-6" />
              {favCount > 0 && <Bubble value={favCount} tone="rose" />}
            </button>

            <button onClick={() => go("/orders", true)} aria-label="Siparişlerim" className="hover:text-yellow-300 transition">
              <PackageSearch className="w-6 h-6" />
            </button>
            

            {session && (
              <button onClick={() => go("/dashboard", true)} aria-label="Hesabım" className="hover:text-yellow-300 transition">
                <User2 className="w-6 h-6" />
              </button>
            )}

            <button onClick={() => go("/cart")} aria-label="Sepetim" className="relative hover:text-emerald-400 transition">
              <ShoppingCart className="w-6 h-6" />
              {cart?.length > 0 && <Bubble value={cart.length} tone="emerald" />}
            </button>

            {/* Login / Logout */}
{!session && !isRecovering && !location.pathname.startsWith("/cart") && (
  <button
    onClick={() => setLoginOpen(true)}
    className="text-xs px-3 py-1 rounded-md font-semibold bg-gradient-to-r from-yellow-400 to-rose-400 text-black hover:brightness-110 transition"
  >
    Giriş
  </button>
)}

{/* Admin */}
{session && isAdmin && (
  <button
    onClick={() => (window.location.href = "/admin")}
    className="px-3 py-[6px] rounded bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-300 transition shadow-[0_0_12px_rgba(255,215,0,0.35)]"
    title="Admin Panel"
  >
    <ShieldCheck className="w-4 h-4 inline-block mr-1" />
    Admin
  </button>
)}

{/* Logout */}
{session && (
  <button
    onClick={async () => {
      await supabase.auth.signOut();

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            text: "👋 Çıkış yapıldı! Tekrar bekleriz!"
          }
        })
      );

      setTimeout(() => {
        const redirectTo =
          localStorage.getItem("redirect_after_login") || "/";
        localStorage.removeItem("redirect_after_login");
        window.location.href = redirectTo;
      }, 1400);
    }}
    className="flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-400 transition"
  >
    <LogOut className="w-4 h-4" />
    Çıkış
  </button>
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
        <nav className="p-5 flex flex-col gap-3">
        <CategoryLink to="/category/canta" text="Çanta" setMenuOpen={setMenuOpen} />
          <CategoryLink text="Cüzdan" soon setMenuOpen={setMenuOpen} />
          <CategoryLink text="E-Pin" soon setMenuOpen={setMenuOpen} />
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
{signupOpen && (
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
        <input type="email" placeholder="E-posta" required
          value={signup.email}
          onChange={(v) => setSignup({ ...signup, email: v.target.value })}
          className="w-full p-3 rounded-lg bg-[#1b1b1b] border border-yellow-500/20 focus:ring-yellow-400"
        />

       <label className="text-sm text-gray-400">Şifre</label>
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


        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-emerald-400 text-sm">{message}</p>}

        <button className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-rose-400 text-black font-semibold">Kayıt Ol</button>
      </form>
    </div>
  </>
)}
{/* ✅ Password Reset Drawer */}
{resetOpen && (
  <>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
      onClick={() => setResetOpen(false)}
    ></div>

    <div
      className={`fixed top-0 right-0 h-full w-96 bg-black/70 backdrop-blur-2xl border-l border-yellow-500/20
      shadow-[0_0_45px_rgba(255,215,0,0.25)] transform transition-transform duration-300 z-[9999]`}
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

        {message && <p className="text-emerald-400 text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

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
{/* ✅ Premium Status Badge */}
    <div className="flex items-center gap-2 text-lg mt-3">
      <span className={STATUS_BADGE[foundOrder.status]?.cls}>
        {STATUS_BADGE[foundOrder.status]?.text}
      </span>
      <span>
        {STATUS_BADGE[foundOrder.status]?.icon}
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
