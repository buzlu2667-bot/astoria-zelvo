//  PREMIUM GOLD PANEL CART PAGE  
//  src/pages/Cart.jsx

import { useCart } from "../context/CartContext";
import { useSession } from "../context/SessionContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {  ShoppingCart } from "lucide-react";
import ProductCardCart from "../components/ProductCardCart";

export default function Cart() {
  const { cart, inc, dec, removeFromCart, total, clearCart } = useCart();
  const { session } = useSession();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(0);

  // 🔥 Kullanıcı bakiye alma — (Wallet sistemi kullanılmıyor, tamamen boş)
useEffect(() => {
  // Wallet özelliği devre dışı → herhangi bir supabase çağrısı yok
  setWallet(0); 
}, [session]);

// 🔥 Sekmeden geri gelince Cart yeniden yüklensin
useEffect(() => {
  const onFocus = () => {
    console.log("FOCUS → CART yenileniyor...");
    window.location.reload();
  };

  const onVisible = () => {
    if (!document.hidden) {
      console.log("VISIBILITYCHANGE → CART yenileniyor...");
      window.location.reload();
    }
  };

  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisible);
  };
}, []);

  /* 🟡 BOŞ SEPET */
  if (!cart || cart.length === 0)
    return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center bg-transparent text-white px-4">

        <img
          src="/assets/cart-gold.png"
          className="w-60 mx-auto drop-shadow-[0_0_30px_rgba(255,200,0,0.5)] animate-bounce"
        />

        <h2 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 bg-clip-text text-transparent">
          Sepetin Boş
        </h2>

        <p className="text-gray-400 max-w-sm mb-6 text-lg leading-relaxed">
          Hemen alışverişe başla ve avantajları kaçırma! ✨
        </p>

        <button
          onClick={() => nav("/")}
          className="mt-2 bg-gradient-to-r from-yellow-400 to-rose-400 text-black px-8 py-4 rounded-2xl font-extrabold text-lg shadow-[0_0_20px_rgba(255,200,0,0.35)] hover:scale-105 transition-transform"
        >
          Alışverişe Devam Et
        </button>
      </div>
    );

  // 🔥 Ödeme → Login kontrol
  const handleOrder = async () => {
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

  return (
   <div className="min-h-screen text-white">
    <h2
  className="
    text-3xl font-extrabold mb-8 text-center
    bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500
    bg-clip-text text-transparent
    drop-shadow-[0_0_15px_rgba(250,204,21,0.45)]
    animate-pulse flex items-center justify-center gap-2
  "
>
  <ShoppingCart className="w-8 h-8 text-yellow-400" />
  Sepetim
</h2>


   {/* 🟡 2 Kolon Yapısı: Sol ürünler / Sağ Özet */}
<div className="w-full flex justify-between gap-8">

  {/* SOL TARAF — ÜRÜNLER GRIDİ */}
  <div className="flex-1">
  <div
  className="
    grid 
    grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
    gap-6
    items-start
    content-start
    auto-rows-max
  "
>

      {cart.map((item) => (
     <ProductCardCart
  key={item.id}
  item={item}
  inc={() => inc(item.product_id)}
  dec={() => dec(item.product_id)}
  remove={() => {
    removeFromCart(item.product_id);
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "error", text: " Ürün sepetten silindi!" },
      })
    );
  }}
/>



      ))}
    </div>
  </div>

  {/* SAĞ TARAF — SABİT PANEL */}
  <div className="hidden lg:block w-[350px] shrink-0">
    <div
      className="
        bg-gradient-to-b from-[#0c0c0c]/95 to-[#0a0a0a]/80 
        backdrop-blur-xl
        border border-yellow-400/30 
        rounded-3xl p-7 
        shadow-[0_0_35px_rgba(255,200,0,0.25)]
        relative overflow-hidden
        h-fit sticky top-6
      "
    >
      {/* IŞIK HALO */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-400/10 blur-3xl rounded-full"></div>
      </div>

      {/* BAŞLIK */}
      <h3 className="text-2xl font-extrabold mb-6 text-yellow-300">
        🛍️ Sipariş Özeti
      </h3>

      {/* LİSTELER */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-sm text-gray-300 pb-2 border-b border-yellow-400/20">
          <span>Sepet Toplamı</span>
          <span className="text-yellow-300 font-bold">₺{total}</span>
        </div>
      </div>

      {/* BUTONLAR */}
      <div className="flex flex-col gap-4 mt-7 relative z-10">
       <button
  onClick={() => {
    clearCart();
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "info", text: " Sepet temizlendi!" },
      })
    );
  }}
  className="bg-[#111]/60 py-3 rounded-xl text-gray-300 border border-gray-700/40 hover:bg-[#222]"
>
  Temizle
</button>


        <button
          onClick={handleOrder}
          className="
  py-3 rounded-xl font-extrabold text-white
  bg-gradient-to-r from-[#0a1a3d] via-[#0f2e63] to-[#153b7a]
  shadow-[0_0_25px_rgba(20,60,120,0.45)]
  hover:brightness-110
  transition
"

        >
          Satın Al
        </button>
      </div>
    </div>
  </div>

</div>

      {/* 🟡 MOBİL ALT BAR */}
<div className="lg:hidden fixed bottom-[70px] left-0 right-0 z-[9999] px-4">
  <div className="bg-[#0d0d0d]/95 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-4 shadow-[0_0_25px_rgba(255,200,0,0.25)]">

    {/* Toplam */}
    <div className="flex justify-between text-yellow-300 font-extrabold text-lg mb-3">
      <span>Sepet Toplamı</span>
      <span>₺{total}</span>
    </div>

    {/* Satın Al */}
   <button
  onClick={handleOrder}
  className="
    w-full py-3 rounded-xl font-extrabold text-white
    bg-gradient-to-r from-[#0a1a3d] via-[#0f2e63] to-[#153b7a]
    shadow-[0_0_25px_rgba(20,60,120,0.45)]
    hover:brightness-110 transition
  "
>
  Satın Al
</button>

  </div>
</div>

    </div>
  );
}
