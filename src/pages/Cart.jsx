import { useCart } from "../context/CartContext";
import { useSession } from "../context/SessionContext";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCardCart from "../components/ProductCardCart";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient"; // Eğer yoksa ekle
import { useRef } from "react";
import ProductCardVertical from "../components/ProductCardVertical";
import { Link } from "react-router-dom";
import { Home, ShoppingCart } from "lucide-react";
import { ChevronDown } from "lucide-react";
export default function Cart() {
const {
  cart,
  inc,
  dec,
  removeFromCart,
  subtotal,
  cartExtraDiscount,
  cartExtraDiscountPercent,
  total,

  // 🔥 BURAYI EKLE
  nextDiscountRule,
  remainingForNextDiscount,
   // 🚚 kargo
  remainingForFreeShipping,
  hasFreeShipping,

  clearCart,
} = useCart();


  const { session } = useSession();
  const nav = useNavigate();
const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);


   // ⭐ İLGİNİZİ ÇEKEBİLİR STATE
  const [suggested, setSuggested] = useState([]);
  const suggestedRef = useRef(null);

  const suggestedLeft = () =>
    suggestedRef.current?.scrollBy({ left: -350, behavior: "smooth" });

  const suggestedRight = () =>
    suggestedRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  const [canSuggestedLeft, setCanSuggestedLeft] = useState(false);
const [canSuggestedRight, setCanSuggestedRight] = useState(false);

function checkSuggestedScroll() {
  const el = suggestedRef.current;
  if (!el) return;

 const THRESHOLD = 20; // 👈 kritik

setCanSuggestedLeft(el.scrollLeft > THRESHOLD);
setCanSuggestedRight(
  el.scrollLeft + el.clientWidth < el.scrollWidth - THRESHOLD
);

}


  // Login kontrol → Satın al
  const handleOrder = () => {
    if (!session) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "info", text: "Giriş yapman gerekiyor!" },
        })
      );
      localStorage.setItem("redirect_after_login", "/checkout");
      window.dispatchEvent(new Event("force-login"));
      return;
    }
    nav("/checkout");
  };

  // ⭐ İLGİNİZİ ÇEKEBİLİR ürünleri yükle
useEffect(() => {
  async function loadSuggested() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_suggested", true)
      .order("created_at", { ascending: false });

    setSuggested(data || []);
  }
  loadSuggested();
}, []);

useEffect(() => {
  if (!suggested.length) return;

  const t = setTimeout(() => {
    requestAnimationFrame(() => {
      checkSuggestedScroll();
    });
  }, 150); // 👈 biraz daha sabır

  return () => clearTimeout(t);
}, [suggested]);


useEffect(() => {
  const onLoad = () => {
    setTimeout(() => {
      checkSuggestedScroll();
    }, 200);
  };

  window.addEventListener("load", onLoad);
  return () => window.removeEventListener("load", onLoad);
}, []);



  /* 🟡 BOŞ SEPET */
 if (!cart || cart.length === 0)
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 text-gray-700">

      {/* BÜYÜK SEPET İKONU */}
      <ShoppingCart className="w-24 h-24 text-[#f27a1a] opacity-80" />

      <h2 className="text-3xl font-bold mt-4">Sepetin Boş</h2>
      <p className="text-gray-500 mt-2">Hemen alışverişe başla!</p>

      <button
        onClick={() => nav("/")}
        className="mt-5 bg-[#f27a1a] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90"
      >
        Alışverişe Devam Et
      </button>
    </div>
  );


  return (
 <div className="min-h-screen bg-white p-4 md:p-6">
  {/* Breadcrumb */}
<nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
  <Link to="/" className="inline-flex items-center gap-1 hover:text-gray-800">
    <Home className="w-4 h-4" />
    <span>Ana Sayfa</span>
  </Link>
  <span className="text-gray-300">/</span>
  <span className="text-gray-900 font-semibold">Sepetim</span>
</nav>

{/* Premium Header */}
<div className="
  relative overflow-hidden rounded-3xl
  border border-white/10 bg-gray-900/85 backdrop-blur
  shadow-[0_18px_60px_-40px_rgba(0,0,0,0.85)]
  px-5 py-6 sm:px-7 sm:py-7
  mb-6
">
  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_circle_at_15%_20%,rgba(249,115,22,0.35),transparent_60%)]" />

  <div className="relative flex items-start justify-between gap-4">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
        <ShoppingCart className="w-6 h-6 text-orange-300" />
      </div>

      <div>
        <div className="text-xs font-semibold tracking-wide text-gray-300">
          Alışveriş
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
          Sepetim
        </h1>
        <p className="mt-1 text-sm text-gray-200">
          Eklediğin ürünleri buradan düzenleyebilir ve ödemeye geçebilirsin.
        </p>
      </div>
    </div>

    <div className="hidden sm:block text-right">
      <div className="text-xs text-gray-300">Toplam</div>
      <div className="text-sm font-semibold text-white">
        {cart.length} ürün
      </div>
    </div>
  </div>
</div>

      {/* 📱 MOBİL SİPARİŞ ÖZETİ — AÇILIR / KAPANIR */}
<div className="lg:hidden mt-6">

  {/* HEADER */}
  <button
    onClick={() => setMobileSummaryOpen(o => !o)}
    className="
      w-full flex items-center justify-between
      px-4 py-4 rounded-2xl
      bg-[#0f62fe] text-white
      font-extrabold
    "
  >
    <div className="text-left">
      <div>Sipariş Özeti / Satın Al</div>
      <span className="text-xs text-white/80 font-medium">
      Dokun → detayları gör
    </span>
      <div className="text-xs opacity-80">
        Toplam: ₺{total.toLocaleString("tr-TR")}
      </div>
    </div>

    <div
  className="
    w-8 h-8 rounded-full
    bg-white/20
    flex items-center justify-center
    transition-all
  "
>
  <ChevronDown
    className={`
      w-5 h-5 text-white
      transition-transform duration-300 ease-out
      ${mobileSummaryOpen ? "rotate-180" : ""}
    `}
  />
</div>

  </button>

  {/* BODY */}
  {mobileSummaryOpen && (
    <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">

      <div className="flex justify-between text-sm text-gray-600">
        <span>Ara Toplam</span>
        <span>₺{subtotal.toLocaleString("tr-TR")}</span>
      </div>

      {cartExtraDiscount > 0 && (
        <div className="flex justify-between text-sm text-green-600 mt-1 font-medium">
          <span>Sepete Özel %{cartExtraDiscountPercent}</span>
          <span>-₺{cartExtraDiscount.toLocaleString("tr-TR")}</span>
        </div>
      )}

      {nextDiscountRule && remainingForNextDiscount > 0 && (
        <div className="mt-2 text-xs bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-lg">
          🔥 {remainingForNextDiscount} ürün daha → %{nextDiscountRule.discount_percent} indirim
        </div>
      )}

      {!hasFreeShipping ? (
        <div className="mt-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg">
          🚚 ₺{remainingForFreeShipping.toLocaleString("tr-TR")} kaldı → ücretsiz kargo
        </div>
      ) : (
        <div className="mt-2 text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg font-semibold">
          🎉 Ücretsiz kargo kazandın
        </div>
      )}

      <div className="flex justify-between text-base font-bold text-gray-900 mt-3">
        <span>Ödenecek</span>
        <span>₺{total.toLocaleString("tr-TR")}</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={clearCart}
          className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium"
        >
          Temizle
        </button>

        <button
          onClick={handleOrder}
          className="flex-1 py-3 rounded-xl text-white font-bold bg-[#f27a1a]"
        >
          Satın Al
        </button>
      </div>
    </div>
  )}
</div>

      {/* 2 SÜTUN: Sol ürünler / Sağ özet */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SOL TARAF */}
       <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {cart.map((it) => (
            <ProductCardCart
           key={it.product_id}
              item={it}
              inc={() => inc(it.product_id)}
              dec={() => dec(it.product_id)}
              remove={() => {
                removeFromCart(it.product_id);
                window.dispatchEvent(
                  new CustomEvent("toast", {
                    detail: { type: "error", text: "Ürün sepetten silindi!" },
                  })
                );
              }}
            />
          ))}
        </div>

      {/* SAĞ TARAF — SİPARİŞ ÖZETİ */}
<div className="hidden lg:block w-full lg:w-[480px] shrink-0">
  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm sticky top-4">

    <h3 className="text-xl font-bold text-gray-800 mb-4">
      Sipariş Özeti
    </h3>

    {/* Ara Toplam */}
    <div className="flex justify-between text-gray-600 text-sm">
      <span>Ara Toplam</span>
      <span>₺{subtotal.toLocaleString("tr-TR")}</span>
    </div>

    {/* %5 Sepet İndirimi */}
   {cartExtraDiscount > 0 && (
  <>
    <div className="flex justify-between text-green-600 text-sm font-medium mt-1">
      <span>Sepete Özel %{cartExtraDiscountPercent} İndirim</span>
      <span>-₺{cartExtraDiscount.toLocaleString("tr-TR")}</span>
    </div>

    <hr className="my-3" />
  </>
)}

   {/* 🔥 BİR ÜRÜN DAHA EKLE TEXT */}
{nextDiscountRule && remainingForNextDiscount > 0 && (
  <div className="mt-3 text-sm bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl">
    🔥 <b>{remainingForNextDiscount} ürün</b> daha eklersen{" "}
    <b>%{nextDiscountRule.discount_percent}</b> indirim kazanırsın
  </div>
)}

{/* 🚚 ÜCRETSİZ KARGO BİLGİSİ */}
{!hasFreeShipping ? (
  <div className="mt-3 text-sm bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
    🚚 <b>₺{remainingForFreeShipping.toLocaleString("tr-TR")}</b> daha eklersen
    <b> ücretsiz kargo</b> kazanırsın
  </div>
) : (
  <div className="mt-3 text-sm bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-semibold">
    🎉 Tebrikler! Ücretsiz kargo kazandın
  </div>
)}



    {/* Ödenecek Tutar */}
    <div className="flex justify-between text-lg font-bold text-gray-900">
      <span>Ödenecek Tutar</span>
      <span>₺{total.toLocaleString("tr-TR")}</span>
    </div>

    {/* BUTONLAR */}
    <div className="flex flex-col gap-3 mt-5">
      <button
        onClick={() => {
          clearCart();
          window.dispatchEvent(
            new CustomEvent("toast", {
              detail: { type: "info", text: "Sepet temizlendi!" },
            })
          );
        }}
        className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100"
      >
        Temizle
      </button>

      <button
        onClick={handleOrder}
        className="w-full py-3 rounded-xl text-white font-bold bg-[#f27a1a] hover:opacity-90"
      >
        Satın Al
      </button>
    </div>

  </div>
</div>

      </div>

     

{/* ⭐⭐⭐ İLGİNİZİ ÇEKEBİLİR — HOME İLE AYNI ⭐⭐⭐ */}
{suggested.length > 0 && (
  <div className="max-w-7xl mx-auto px-2 md:px-6 mt-20 mb-24">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">İlginizi Çekebilir</h2>

    <div className="relative">

     {canSuggestedLeft && (
  <button
    onClick={() => {
      suggestedLeft();
      setTimeout(checkSuggestedScroll, 200);
    }}
    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20"
  >
    <ChevronLeft className="w-5 h-5 text-gray-700" />
  </button>
)}

{canSuggestedRight && (
  <button
    onClick={() => {
      suggestedRight();
      setTimeout(checkSuggestedScroll, 200);
    }}
    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
      w-10 h-10 rounded-full bg-white border border-gray-300
      items-center justify-center hover:bg-gray-100 transition z-20"
  >
    <ChevronRight className="w-5 h-5 text-gray-700" />
  </button>
)}


      <div
        ref={suggestedRef}
       className="flex gap-4 pb-4 overflow-x-auto scroll-smooth no-scrollbar"

      >
      {suggested.map((item) => (
  <div
    key={item.id}
    className="
      shrink-0
      w-[240px]        /* 📱 mobil = ince uzun */
      sm:w-[240px]     /* 🖥️ desktop */
    "
  >
    <ProductCardVertical
      p={item}
      hideCartButton   /* 👈 birazdan anlatıcam */
    />
  </div>
))}

      </div>

       <p className="text-center text-gray-400 text-sm mt-2 md:hidden animate-pulse">
  Kaydır →
</p>

    </div>
  </div>
)}


    </div>
  );
}
