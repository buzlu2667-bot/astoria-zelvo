import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Snow from "./components/Snow";

import { SessionProvider } from "./context/SessionContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import ScrollFixProvider from "./utils/ScrollFixProvider";

// 🔥 Eski bozuk bundle cache’lerini otomatik temizle
if ("caches" in window) {
  caches.keys().then((names) => {
    names.forEach((name) => caches.delete(name));
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
}

// 🔄 Sekmeden dönünce 4 sn içinde sadece 1 kere reload (loop YOK)
let lastReload = 0;

const safeReload = () => {
  const now = Date.now();
  if (now - lastReload < 4000) return; // 4sn koruma
  lastReload = now;
  window.location.reload();
};

window.addEventListener("focus", safeReload);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) safeReload();
});


// 🚀 TEK ROOT
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ScrollFixProvider />
    <SessionProvider>
      <CartProvider>
        <FavoritesProvider>

          {/* ❄️ KAR EFEKTİ */}
          <Snow />

          {/* APP */}
          <App />

        </FavoritesProvider>
      </CartProvider>
    </SessionProvider>
  </BrowserRouter>
);
