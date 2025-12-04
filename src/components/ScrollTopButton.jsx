import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollTopButton() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showButton, setShowButton] = useState(false);

  // ✅ Scroll dinleme
  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 250);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Resize dinleme
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!showButton) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className={`fixed bottom-20 right-6 z-[99999] transition-all duration-300 shadow-lg

      ${isMobile
        ? "w-11 h-11 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center hover:scale-110"
        : "px-5 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold text-sm tracking-wide hover:scale-105"
      }
      ${showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
      title="Yukarı Çık"
    >
      {isMobile ? (
        <ArrowUp className="w-5 h-5 text-black" />
      ) : (
        <div className="flex items-center gap-2 text-black">
          <ArrowUp className="w-4 h-4" />
          <span>Yukarı Çık</span>
        </div>
      )}

      {/* ✨ Işıltı Efekti */}
      <span
        className="absolute inset-0 rounded-full blur-md opacity-40 bg-gradient-to-r from-yellow-300 to-yellow-600 animate-pulse -z-10"
      ></span>
    </button>
  );
}
