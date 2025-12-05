import { useCart } from "../context/CartContext";
import { useSession } from "../context/SessionContext";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCardCart from "../components/ProductCardCart";

export default function Cart() {
  const { cart, inc, dec, removeFromCart, total, clearCart } = useCart();
  const { session } = useSession();
  const nav = useNavigate();

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
    <div className="min-h-screen bg-[#f6f6f6] p-4 md:p-6">
      {/* BAŞLIK */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <ShoppingCart className="w-7 h-7 text-[#f27a1a]" />
        Sepetim
      </h2>

      {/* 2 SÜTUN: Sol ürünler / Sağ özet */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SOL TARAF */}
       <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {cart.map((it) => (
            <ProductCardCart
              key={it.id}
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
     <div className="hidden lg:block w-full lg:w-[350px] shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Sipariş Özeti
            </h3>

            {/* Toplam */}
            <div className="flex justify-between text-gray-700 font-medium border-b pb-2">
              <span>Sepet Toplamı</span>
              <span className="font-bold text-gray-900">
                ₺{total.toLocaleString("tr-TR")}
              </span>
            </div>

            {/* BUTONLAR */}
            <div className="flex flex-col gap-3 mt-5">
              {/* TEMİZLE */}
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

              {/* SATIN AL */}
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

      {/* MOBİL ALT BAR */}
     {/* 📱 MOBİL SİPARİŞ ÖZETİ (TAM KUTU VERSİYONU) */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-[99999] bg-white border-t border-gray-300 shadow-xl p-4 rounded-t-2xl">
  
  <h3 className="text-xl font-bold text-gray-800 mb-4">
    Sipariş Özeti
  </h3>

  <div className="flex justify-between text-gray-700 font-medium border-b pb-2">
    <span>Sepet Toplamı</span>
    <span className="font-bold text-gray-900">
      ₺{total.toLocaleString("tr-TR")}
    </span>
  </div>

  <div className="flex flex-col gap-3 mt-4">
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
  );
}
