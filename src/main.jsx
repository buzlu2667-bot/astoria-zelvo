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
