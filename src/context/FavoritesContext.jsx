import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext(null);
const KEY = "elitemart_favorites"; // ✅ ANAHTAR DOĞRU

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const sync = (arr) => {
    setFavorites(arr);
    localStorage.setItem(KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event("favorites:changed"));
  };

 const addFav = (product) => {
  const normalized = {
    id: product.id,
    name: product.name || product.title || "Ürün",
    price: Number(product.price) || 0,
    image_url:
      product.image_url ||
      product.image ||
      product.img ||
      product.images?.[0] ||
      "/assets/placeholder-product.png",
  };

  setFavorites((prev) => {
    if (prev.some((p) => p.id === normalized.id)) return prev;

    const updated = [...prev, normalized];
    localStorage.setItem("elitemart_favorites", JSON.stringify(updated));
    window.dispatchEvent(new Event("favorites:changed"));
    return updated;
  });
};




  const removeFav = (id) => {
    sync(favorites.filter((p) => p.id !== id));
  };

  const clearFavs = () => sync([]);

  const isFav = (id) => favorites.some((p) => p.id === id);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFav, removeFav, isFav, clearFavs }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

export default FavoritesProvider;
