// src/components/QuickViewModal.jsx
import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Navigation, Pagination, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function QuickViewModal({ product, closeModal }) {
  if (!product) return null;

  // ---------- helpers ----------
  const modalRef = useRef(null);

  // Görsel listesi (var olanları sırayla dener)
  const baseImg = product.image_url?.replace(/\.(png|jpg|jpeg)$/i, "");
  const productImages = [
    `/products/${baseImg}.png`,
    `/products/${baseImg}.1.png`,
    `/products/${baseImg}.2.png`,
    `/products/${baseImg}.3.png`,
  ].filter((src) => !src.includes("/products/.png"));

  // Karttakiyle BİREBİR stok etiketi (tek doğruluk kaynağı)
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

  // ---------- effects ----------
  useEffect(() => {
    // ESC ile kapat
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);

    // Body scroll kilidi
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Modal içi klavye focus (Swiper keyboard için)
    modalRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [closeModal]);

  // ---------- handlers ----------
  const onAddToCart = () => {
    window.dispatchEvent(new CustomEvent("cart-add", { detail: product }));
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "Sepete eklendi!" },
      })
    );
    closeModal();
  };

  {/* ---------- render ---------- */}
return (
  <div
    className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md p-3 flex items-center justify-center"
    onClick={closeModal}
  >
    <div
      ref={modalRef}
      tabIndex={0}
      onClick={(e) => e.stopPropagation()}
      className="relative w-[98vw] md:w-[90vw] max-w-5xl 
                max-h-[95vh] bg-neutral-900 rounded-2xl shadow-xl
                border border-yellow-500/40 outline-none flex flex-col"
    >
      {/* ✅ X KAPAT */}
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 
                   hover:bg-red-600 transition flex items-center justify-center 
                   text-2xl z-50"
        aria-label="Kapat"
      >
        ✕
      </button>

      {/* ✅ TÜM İÇERİK SCROLL (EĞER GEREKİRSE) */}
      <div className="flex-1 flex flex-col items-center gap-5 p-3 overflow-y-auto">

        {/* ✅ RESİM BÖLÜMÜ */}
        <div className="w-full h-[50vh] md:h-[60vh] flex items-center justify-center p-3">
          <Swiper
            zoom={{ maxRatio: 3 }}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            keyboard={{ enabled: true }}
            modules={[Zoom, Navigation, Pagination, Keyboard]}
            className="w-full h-full rounded-xl select-none"
          >
            {productImages.map((src, i) => (
              <SwiperSlide key={i}>
                <div className="swiper-zoom-container flex items-center justify-center w-full h-full">
                  <img
                    src={src}
                    alt={product.name}
                    draggable="false"
                   className="w-full h-full object-cover mx-auto scale-[1.15]"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ✅ ÜRÜN BİLGİLERİ */}
        <div className="w-full max-w-[900px] text-center">
          <h1 className="text-white text-3xl font-bold mb-1">
            {product.name}
          </h1>

          <p className="text-gray-400 text-sm mb-3">
            {product.description || "Açıklama eklenecek"}
          </p>

          <div className="flex justify-center items-end gap-3 mb-2">
            {product.old_price > product.price && (
              <p className="text-gray-500 line-through text-lg">
                ₺{Number(product.old_price).toLocaleString("tr-TR")}
              </p>
            )}
            <p className="text-yellow-400 font-extrabold text-4xl drop-shadow-sm">
              ₺{Number(product.price).toLocaleString("tr-TR")}
            </p>
          </div>

          <div className="mb-4">
            <StockBadge />
          </div>

          {/* ✅ GÜZEL SEPET BUTONU */}
          <button
            onClick={onAddToCart}
            className="mt-3 w-full py-3 rounded-lg font-bold text-lg
                       bg-gradient-to-r from-red-700 to-yellow-600 hover:opacity-90
                       transition flex items-center justify-center gap-3"
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
