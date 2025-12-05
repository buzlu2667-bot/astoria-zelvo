import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollTopButton() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showButton, setShowButton] = useState(false);

  // Scroll
  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 250);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!showButton) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Yukarı Çık"
      className={`fixed bottom-20 right-6 z-[99999]
        transition-all duration-300 shadow-lg border border-gray-300
        bg-white text-gray-800

        ${isMobile
          ? "w-11 h-11 rounded-full flex items-center justify-center hover:scale-110"
          : "px-5 py-3 rounded-full flex items-center justify-center gap-2 hover:scale-105"
        }

        ${showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
    >
      {isMobile ? (
        <ArrowUp className="w-5 h-5 text-gray-800" />
      ) : (
        <>
          <ArrowUp className="w-4 h-4 text-gray-800" />
          <span className="font-semibold text-sm">Yukarı Çık</span>
        </>
      )}
    </button>
  );
}
