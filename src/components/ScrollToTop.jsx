// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // route değişince sayfayı en üste al
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // istersen "smooth" yaparız
    });
  }, [pathname]);

  return null;
}
