import { useEffect } from "react";

export default function useScrollRestoration(key = "scroll-pos") {
  // Pozisyonu kaydet
  const saveScroll = () => {
    localStorage.setItem(key, window.scrollY.toString());
  };

  // Pozisyonu geri getir
  const restoreScroll = () => {
    const saved = localStorage.getItem(key);
    if (saved) {
      setTimeout(() => {
        window.scrollTo({
          top: Number(saved),
          behavior: "instant"
        });
      }, 0);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", saveScroll);
    return () => window.removeEventListener("scroll", saveScroll);
  }, []);

  return { restoreScroll };
}
