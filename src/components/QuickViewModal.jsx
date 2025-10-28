import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function QuickViewModal({ product, closeModal }) {
  if (!product) return null;
  const [isZoomed, setIsZoomed] = useState(false);

 // ✅ Ürün görsellerini otomatik oluştur
const baseImg = product.image_url?.replace(/\.(png|jpg|jpeg)$/i, "");
const productImages = [
  `/products/${baseImg}.png`,
  `/products/${baseImg}.1.png`,
  `/products/${baseImg}.2.png`,
  `/products/${baseImg}.3.png`,
].filter((src) => !src.includes("/products/.png")); // Boş olanları çıkar


  const navigate = useNavigate();

const go = (to, protect = false) => {
  const session = JSON.parse(localStorage.getItem("sb-session"));

  if (protect && !session) {
    localStorage.setItem("redirect_after_login", to);
    window.dispatchEvent(new Event("force-login")); // ✅ Header login'i açsın
  } else {
    navigate(to);
  }
};


  // ✅ ESC ile kapat
  useEffect(() => {
    const escClose = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", escClose);
    return () => window.removeEventListener("keydown", escClose);
  }, [closeModal]);
  useEffect(() => {
  document.body.style.overflow = isZoomed ? "hidden" : "auto";
}, [isZoomed]);


  return (
   <div
  className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-6
             overscroll-contain touch-pan-y"     // ✅ iOS bounce fix
  onClick={closeModal}
>


     <div
  className={`relative w-full max-w-4xl bg-neutral-950/90 rounded-3xl p-8 animate-fade-up
              ${isZoomed
                ? "backdrop-blur-0 shadow-none border-transparent"
                : "backdrop-blur-xl shadow-[0_0_45px_rgba(255,215,0,0.25)] border border-yellow-500/30"
              }`}
  onClick={(e) => e.stopPropagation()}
>


        {/* ✅ X çalışır */}
        <button
          onClick={closeModal}
          className={`absolute top-3 right-3 text-3xl w-10 h-10 rounded-full flex items-center justify-center
            ${isZoomed ? "transition-none" : "transition-all"} 
            bg-black/60 hover:bg-red-600 backdrop-blur-sm z-[9999]`}

        >
          ✕
        </button>

       <Swiper
  className="rounded-xl"
  allowTouchMove={!isZoomed}           // ✅ Zoom açıkken swipe kilit
  simulateTouch={!isZoomed}            // ✅ Ek garanti
  resistanceRatio={0}                  // ✅ iOS lastik etkisini azalt
  modules={[Navigation, Pagination, Keyboard]}
  navigation
  pagination={{ clickable: true }}
  keyboard={{ enabled: true }}
>

        {productImages.map((img, i) => (
  <SwiperSlide key={i}>
 <Zoom
  onZoomChange={(zoom) => setIsZoomed(zoom)}
  zoomMargin={16}                          // ✅ iOS için nefes aralığı
  overlayBgColorStart="rgba(0,0,0,0.35)"   // ✅ yumuşak giriş
  overlayBgColorEnd="rgba(0,0,0,0.90)"
  transitionDuration={250}                 // ✅ kısa ve pürüzsüz anim
>

    <img
  src={img}
  alt={product.name}
  draggable={false}                                 // ✅ iOS drag ghost yok
  className="w-full h-[420px] object-contain rounded-xl bg-black/40 select-none"
  style={{ willChange: isZoomed ? "transform" : "auto", transform: isZoomed ? "translateZ(0)" : "none" }}  // ✅ GPU hint
/>

  </Zoom>
</SwiperSlide>

))}


        </Swiper>

        <h2 className="mt-6 text-2xl font-bold">{product.name}</h2>
        <p className="text-gray-400 text-sm mb-3">{product.description}</p>

        <div className="flex items-end gap-3 mb-6">
  {/* Eski fiyat - çizili */}
  {product.old_price > product.price && (
    <p className="text-gray-500 line-through text-lg">
      ₺{Number(product.old_price).toLocaleString("tr-TR")}
    </p>
  )}

  {/* Yeni fiyat */}
  <p className="text-yellow-400 font-extrabold text-3xl drop-shadow-sm">
    ₺{Number(product.price).toLocaleString("tr-TR")}
  </p>
</div>


       <button
  onClick={() => {
    window.dispatchEvent(
      new CustomEvent("cart-add", { detail: product })
    );

    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: " Sepete eklendi!" },
      })
    );

    closeModal();
  }}
  className="w-full bg-gradient-to-r from-red-700 to-yellow-600 hover:opacity-90 
             py-3 rounded-lg font-bold text-lg transition-all"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
  fill="none" stroke="currentColor" strokeWidth="2"
  strokeLinecap="round" strokeLinejoin="round"
  className="inline-block mr-2">
  <circle cx="9" cy="21" r="1"></circle>
  <circle cx="20" cy="21" r="1"></circle>
  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
</svg>
  Sepete Ekle
</button>

      </div>
    </div>
  );
}
