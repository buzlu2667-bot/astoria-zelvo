import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollFixProvider() {
  const location = useLocation();
  const lastPath = useRef(null);

  // Tarayıcı scroll restore kapatma
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Sayfa değişince davranış:
  useEffect(() => {
    const current = location.pathname;

    // Eğer önceki sayfaya geri dönüyorsak → kaldığın yere git
    if (lastPath.current === current) {
      const saved = sessionStorage.getItem("scroll-" + current);
      if (saved) {
        window.scrollTo(0, Number(saved));
        return;
      }
    }

    // Yeni sayfaya giriyorsan → en üste git
    window.scrollTo(0, 0);

    // Son yol güncelle
    lastPath.current = current;
  }, [location.pathname]);

  // Her scroll konumunu kaydet
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(
        "scroll-" + location.pathname,
        window.scrollY.toString()
      );
    };

    window.addEventListener("scroll", save);
    return () => window.removeEventListener("scroll", save);
  }, [location.pathname]);

  return null;
}
