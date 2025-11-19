// src/pages/Cart.jsx
import { useCart } from "../context/CartContext";
import { useSession } from "../context/SessionContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Cart() {
  const {
    cart,
    inc,
    dec,
    removeFromCart,
    total,
    clearCart,
  } = useCart();
  const { session } = useSession();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  /* ✅ BOŞ SEPET — FULL PREMIUM */
if (!cart || cart.length === 0)
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center bg-[#050505] text-white px-4">
      <div className="w-48 h-48 mb-6 flex items-center justify-center">
        {/* ✅ PNG ÜSTTE */}
      <img
  src="/assets/cart-gold.png"
  className="w-60 mx-auto drop-shadow-[0_0_30px_rgba(255,200,0,0.5)] animate-bounce"
  alt="empty cart"
/>

      </div>

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


  /* ✅ Satın al → Checkout yönlendirme */
  const handleOrder = async () => {
  if (!session) {
    // ✅ Kullanıcıya uyarı göster
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: {
          type: "info",
          text: " Devam etmek için giriş yapmalısın!"
        }
      })
    );

    // ✅ Login sonrası checkout'a yönlendir
    localStorage.setItem("redirect_after_login", "/checkout");

    // ✅ Login aç
    window.dispatchEvent(new Event("force-login"));
    return;
  }

  // ✅ Zaten giriş varsa direkt checkout
  nav("/checkout");
};


  return (
    <div className="min-h-screen pt-8 max-w-4xl mx-auto p-4 bg-[#050505] text-white">
      <h2 className="text-3xl font-extrabold mb-6"> Sepetim</h2>

      <ul className="divide-y divide-gray-700">
        {cart.map((item) => (
      <li
  key={item.id}
  className="
    cart-card
    bg-[#111]
    border border-yellow-500/10
    rounded-2xl
    p-4
    mb-5
    shadow-[0_0_20px_rgba(255,215,0,0.05)]
    transition
  "
>
  <div className="flex gap-4">
    <div className="w-24 h-24 rounded-xl overflow-hidden bg-black border border-gray-700/40">
      <img
        src={
          item.image_url?.startsWith('http')
            ? item.image_url
            : item.image_url
            ? `/products/${item.image_url}`
            : '/assets/placeholder-product.png'
        }
        alt={item.name}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="flex flex-col justify-between w-full">
      <div>
        <p className="font-bold text-lg">{item.name}</p>
        <p className="text-yellow-300 font-extrabold text-xl mt-1">
          ₺{item.price}
        </p>
      </div>

      {/* Adet + Sil */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dec(item.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800"
          >
            <Minus size={16} />
          </button>

          <span className="w-8 text-center font-bold text-lg">
            {item.quantity}
          </span>

          <button
            onClick={() => inc(item.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => removeFromCart(item.id)}
          className="text-red-500 hover:text-red-400"
        >
          <Trash2 size={22} />
        </button>
      </div>
    </div>
  </div>
</li>

        ))}
      </ul>

      {/* ✅ Alt toplam + butonlar */}
    <div className="mt-10 flex justify-between items-center cart-footer">
        <p className="text-2xl font-extrabold">
          Toplam:
          <span className="text-yellow-400 ml-2">₺{total}</span>
        </p>

       <div className="flex gap-3 cart-footer-buttons">

          <button
            onClick={() => clearCart()}
            className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
          >
            Temizle
          </button>

          <button
            onClick={handleOrder}
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-rose-400 text-black shadow-[0_0_25px_rgba(255,200,0,0.4)] hover:brightness-110 transition"
          >
            {loading ? "Gönderiliyor..." : "Satın Al"}
          </button>
        </div>
      </div>

      {msg && <p className="mt-3 text-center">{msg}</p>}
    </div>
  );
}
