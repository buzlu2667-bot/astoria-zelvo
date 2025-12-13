import { useCart } from "../context/CartContext";
import { useSession } from "../context/SessionContext";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCardCart from "../components/ProductCardCart";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient"; // Eğer yoksa ekle
import { useRef } from "react";
import ProductCardVertical from "../components/ProductCardVertical";

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

   // ⭐ İLGİNİZİ ÇEKEBİLİR STATE
  const [suggested, setSuggested] = useState([]);
  const suggestedRef = useRef(null);

  const suggestedLeft = () =>
    suggestedRef.current?.scrollBy({ left: -350, behavior: "smooth" });

  const suggestedRight = () =>
    suggestedRef.current?.scrollBy({ left: 350, behavior: "smooth" });

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
    <div className="min-h-screen bg-[#f6f6f6] p-4 md:p-6 mt-24 md:mt-32">
     {/* ⭐ SEPET BAŞLIK BLOĞU */}
<div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
  <div className="flex items-center gap-3">
    <ShoppingCart className="w-8 h-8 text-[#f27a1a]" />
    
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Sepetim</h2>
      <p className="text-gray-500 text-sm mt-1">
        Eklediğiniz ürünlerin detaylarını aşağıdan düzenleyebilirsiniz.
      </p>
    </div>
  </div>
</div>

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

     
    {/* 📱 MOBİL SİPARİŞ ÖZETİ */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-[99999] bg-white border-t border-gray-300 shadow-xl p-4 rounded-t-2xl">

  <h3 className="text-lg font-bold text-gray-800 mb-3">
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

    <hr className="my-2" />
  </>
)}


   {nextDiscountRule && remainingForNextDiscount > 0 && (
  <div className="mb-2 text-xs bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-lg">
    🔥 {remainingForNextDiscount} ürün daha eklersen{" "}
    %{nextDiscountRule.discount_percent} indirim kazanırsın
  </div>
)}

{/* 🚚 MOBİL KARGO BİLGİSİ */}
{!hasFreeShipping ? (
  <div className="mb-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg">
    🚚 ₺{remainingForFreeShipping.toLocaleString("tr-TR")} kaldı → ücretsiz kargo
  </div>
) : (
  <div className="mb-2 text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg font-semibold">
    🎉 Ücretsiz kargo kazandın
  </div>
)}


  {/* Ödenecek */}
  <div className="flex justify-between text-base font-bold text-gray-900 mb-3">
    <span>Ödenecek Tutar</span>
    <span>₺{total.toLocaleString("tr-TR")}</span>
  </div>

  {/* BUTONLAR */}
  <div className="flex gap-2">
    <button
      onClick={() => {
        clearCart();
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { type: "info", text: "Sepet temizlendi!" },
          })
        );
      }}
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


{/* ⭐⭐⭐ İLGİNİZİ ÇEKEBİLİR — HOME İLE AYNI ⭐⭐⭐ */}
{suggested.length > 0 && (
  <div className="max-w-7xl mx-auto px-2 md:px-6 mt-20 mb-24">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">İlginizi Çekebilir</h2>

    <div className="relative">

      <button
        onClick={suggestedLeft}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300
        items-center justify-center hover:bg-gray-100 transition z-20"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      <button
        onClick={suggestedRight}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2
        w-10 h-10 rounded-full bg-white border border-gray-300
        items-center justify-center hover:bg-gray-100 transition z-20"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      <div
        ref={suggestedRef}
        className="flex gap-4 pb-4 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
      >
      {suggested.map((item) => (
  <div
    key={item.id}
    className="
      shrink-0
      w-[160px]        /* 📱 mobil = ince uzun */
      sm:w-[220px]     /* 🖥️ desktop */
    "
  >
    <ProductCardVertical
      p={item}
      hideCartButton   /* 👈 birazdan anlatıcam */
    />
  </div>
))}

      </div>

    </div>
  </div>
)}


    </div>
  );
}
