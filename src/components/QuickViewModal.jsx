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

  // ---------- render ----------
  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md p-4 md:p-6 flex items-center justify-center"
      onClick={closeModal}
    >
      <div
        ref={modalRef}
        tabIndex={0}
        className="relative w-[90vw] max-w-3xl max-h-[94vh] overflow-y-auto
            bg-neutral-900 rounded-2xl p-4 md:p-6 shadow-xl
            border border-yellow-500/40 outline-none"

        onClick={(e) => e.stopPropagation()}
      >
        {/* X Kapat */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 hover:bg-red-600 transition flex items-center justify-center text-2xl z-10"
          aria-label="Kapat"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-5 md:p-7">
          {/* SOL: Swiper + Zoom */}
          <div className="rounded-xl overflow-hidden bg-black/30">
            <Swiper
              zoom={true}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              keyboard={{ enabled: true }}
              modules={[Zoom, Navigation, Pagination, Keyboard]}
              className="rounded-xl select-none"
            >
              {productImages.map((src, i) => (
                <SwiperSlide key={i}>
                  <div className="swiper-zoom-container flex items-center justify-center">
                    <img
                      src={src}
                      alt={product.name}
                      draggable="false"
                      className="max-h-[70vh] md:max-h-[60vh] object-contain"

                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* SAĞ: Bilgiler */}
          <div className="flex flex-col">
            <div className="flex-1">
              <h1 className="text-white text-3xl font-bold mb-1">
                {product.name}
              </h1>

              {product.description ? (
                <p className="text-gray-400 text-sm mb-4">
                  {product.description}
                </p>
              ) : (
                <p className="text-gray-500 text-sm mb-4">Açıklama eklenecek</p>
              )}

              {/* Fiyat Bloğu */}
              <div className="flex items-end gap-3">
                {product.old_price > product.price && (
                  <p className="text-gray-500 line-through text-lg">
                    ₺{Number(product.old_price).toLocaleString("tr-TR")}
                  </p>
                )}
                <p className="text-yellow-400 font-extrabold text-4xl drop-shadow-sm">
                  ₺{Number(product.price).toLocaleString("tr-TR")}
                </p>
              </div>

              {/* Stok etiketi – kart ile aynı */}
              <StockBadge />
            </div>

            {/* Sepete Ekle */}
            <button
              onClick={onAddToCart}
              className="mt-6 w-full py-3 rounded-lg font-bold text-lg
                         bg-gradient-to-r from-red-700 to-yellow-600 hover:opacity-90
                         transition flex items-center justify-center gap-2"
            >
              {/* Inline cart icon (pakete ihtiyaç yok) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block"
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
