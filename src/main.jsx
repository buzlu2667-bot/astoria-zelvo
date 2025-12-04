import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

import { SessionProvider } from "./context/SessionContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";



// 🔥 SEKMEYE GERİ DÖNÜNCE YENİLE (SADECE MÜŞTERİ TARAFI)
// ---------------------------------------------------------
function shouldReload() {
  const url = window.location.pathname;

  // ❌ Admin panelde reload olmasın
  if (url.startsWith("/admin")) return false;

  // ✔ Müşteri tarafında reload olacak
  return true;
}

window.addEventListener("focus", () => {
  if (shouldReload()) {
    window.location.reload();
  }
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && shouldReload()) {
    window.location.reload();
  }
});
// ---------------------------------------------------------



ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SessionProvider>
      <CartProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </CartProvider>
    </SessionProvider>
  </BrowserRouter>
);
