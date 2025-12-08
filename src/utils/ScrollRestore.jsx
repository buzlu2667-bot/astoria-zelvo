import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollRestore() {
  const location = useLocation();
  const navType = useNavigationType(); 

  // Sayfa değişirken ŞİMDİKİ scroll pozisyonunu kaydet
  useEffect(() => {
    return () => {
      sessionStorage.setItem(
        `scroll:${location.pathname}${location.search}`,
        window.scrollY.toString()
      );
    };
  }, [location.pathname, location.search]);

  // Yeni sayfa render olduğunda ne yapacağını belirle
  useEffect(() => {
    const key = `scroll:${location.pathname}${location.search}`;
    const saved = sessionStorage.getItem(key);

    if (navType === "POP" && saved !== null) {
      // GERİ tuşu → kaydedilen pozisyona dön
      setTimeout(() => {
        window.scrollTo({ top: parseInt(saved), behavior: "instant" });
      }, 0);
    } else {
      // Yeni navigasyon → hep en üst
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname, location.search, navType]);

  return null;
}
