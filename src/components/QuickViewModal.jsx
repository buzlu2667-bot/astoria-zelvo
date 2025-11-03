// src/components/QuickViewModal.jsx
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Navigation, Pagination, Keyboard } from "swiper/modules";
import { useCart } from "../context/CartContext";

import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function QuickViewModal({ product, closeModal }) {
  if (!product) return null;

  const modalRef = useRef(null);
  const { addToCart } = useCart();

  const isBrowser = typeof window !== "undefined"; // ✅ SSR koruması

  // Görsel listesi (var olanları sırayla dener)
// Görsel listesi (var olanları sırayla dener)
const baseImg = product.image_url?.replace(/\.(png|jpg|jpeg)$/i, "");
const rawImages = [
  `/products/${baseImg}.png`,
  `/products/${baseImg}.1.png`,
  `/products/${baseImg}.2.png`,
  `/products/${baseImg}.3.png`,
  `/products/${baseImg}.4.png`,
  `/products/${baseImg}.5.png`,
  `/products/${baseImg}.6.png`,
  `/products/${baseImg}.7.png`,
  `/products/${baseImg}.8.png`,
  `/products/${baseImg}.9.png`,
  `/products/${baseImg}.10.png`,
  `/products/${baseImg}.11.png`,
  `/products/${baseImg}.12.png`,
  `/products/${baseImg}.13.png`,
].filter((src) => !src.includes("/products/.png"));

const [productImages, setProductImages] = useState([]);

// ✅ Tarayıcıda gerçekten yüklenebilenleri filtrele
useEffect(() => {
  const validImages = [];

  rawImages.forEach((url) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      validImages.push(url);
      setProductImages([...validImages]);
    };
    img.onerror = () => {
      // resim yoksa pas geç
    };
  });
}, [product.image_url]);



  // Karttakiyle birebir stok etiketi
  const StockBadge = () =>
    product.stock > 5 ? (
      <p className="mt-2 text-green-400 font-semibold flex items-center gap-1">
        Stokta ✅
      </p>
    ) : (
      <p className="mt-2 text-orange-400 font-semibold flex items-center gap-1 animate-pulse">
        Az Kaldı ⚠️
      </p>
    );

  // ESC + body scroll kilidi
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeModal?.();
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // İlk focus
    modalRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [closeModal]);

  // Sepete ekle
 const onAddToCart = () => {
  addToCart(product);
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: { type: "success", text: "Sepete eklendi!" },
    })
  );
  closeModal?.();
};


  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md"
      onClick={closeModal}
    >
      {/* İç kasa – tam ekran, içi scroll güvenli */}
      <div
        ref={modalRef}
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        className="relative h-screen w-screen flex flex-col"
      >
        {/* Kapat */}
        <button
          onClick={closeModal}
          aria-label="Kapat"
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 hover:bg-red-600 transition flex items-center justify-center text-2xl z-50"
        >
          ✕
        </button>

        {/* İçerik */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Görsel alanı */}
          <div className="relative w-full h-[52vh] sm:h-[58vh] md:h-[62vh] lg:h-[66vh] p-3 sm:p-5">
            <div className="w-full h-full rounded-xl overflow-hidden bg-black border border-yellow-500/30">
             {isBrowser && productImages.length > 0 && (
  <Swiper
    zoom={{ maxRatio: 3 }}
    loop={productImages.length > 1}
    slidesPerView={1}
    navigation={
      productImages.length > 1
        ? { enabled: true, nextEl: ".arrow-next", prevEl: ".arrow-prev" }
        : false
    }
    pagination={productImages.length > 1 ? { clickable: true } : false}
    keyboard={{ enabled: true }}
    modules={[Zoom, Navigation, Pagination, Keyboard]}
    className="w-full h-full select-none"
    speed={600}
  >
    {productImages.map((src, i) => (
      <SwiperSlide key={i}>
        <div className="swiper-zoom-container w-full h-full flex items-center justify-center bg-black cursor-grab active:cursor-grabbing">
          <img
            src={src}
            alt={product.name}
            draggable="false"
            className="w-full h-full object-contain will-change-transform"
          />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
)}

            </div>

            {/* ✅ SADE BEYAZ OK TUŞLARI — ARKA PLANSIZ */}
            <button
              className="arrow-prev absolute top-1/2 left-2 -translate-y-1/2 z-50
              text-white text-4xl font-bold hover:scale-110 transition select-none"
            >
              ‹
            </button>
            <button
              className="arrow-next absolute top-1/2 right-2 -translate-y-1/2 z-50
              text-white text-4xl font-bold hover:scale-110 transition select-none"
            >
              ›
            </button>
          </div>

          {/* Metin & fiyatlar */}
          <div className="px-4 sm:px-6 pb-28 max-w-4xl w-full mx-auto text-center">
            <h1 className="text-white text-3xl font-bold mb-1">
              {product.name}
            </h1>

            <p className="text-gray-400 text-sm mb-3">
              {product.description || "Açıklama eklenecek"}
            </p>

            <div className="flex justify-center items-end gap-3 mb-2">
              {Number(product.old_price) > Number(product.price) && (
                <p className="text-gray-500 line-through text-lg">
                  ₺{Number(product.old_price).toLocaleString("tr-TR")}
                </p>
              )}
              <p className="text-yellow-400 font-extrabold text-4xl drop-shadow-sm">
                ₺{Number(product.price).toLocaleString("tr-TR")}
              </p>
            </div>

            <StockBadge />
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
          <div className="max-w-4xl mx-auto">
           <p
  className="text-yellow-400/90 text-sm text-center mb-3 italic animate-glow"
>
  🎨 Sipariş verirken lütfen tercih ettiğiniz rengi açıklama kısmında belirtiniz.!
</p>

            <button
              onClick={onAddToCart}
              className="w-full py-3 rounded-lg font-bold text-lg
                         bg-gradient-to-r from-red-700 to-yellow-600
                         hover:opacity-90 transition flex items-center justify-center gap-3
                         shadow-[0_0_30px_rgba(255,200,0,0.25)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="translate-y-[1px]"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39A2 2 0 0 0 9.64 16h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
