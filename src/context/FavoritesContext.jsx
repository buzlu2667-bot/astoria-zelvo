import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const FavoritesContext = createContext();
export const useFavorites = () => useContext(FavoritesContext);

const KEY = "elitemart_favorites";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------
  // YÜKLEME
  // -----------------------------------------------------
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        const ls = JSON.parse(localStorage.getItem(KEY) || "[]");
        setFavorites(ls);
        setLoading(false);
        return;
      }

      await loadDBFavorites(user.id);
      setLoading(false);
    })();
  }, []);

 



  // -----------------------------------------------------
  // AUTH LISTENER (İLK TETİKLEME ATLANIYOR)
  // -----------------------------------------------------
  useEffect(() => {
    let first = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (first) {
          first = false;
          return; // INITIAL SESSION tetiklenmesin
        }

        const user = session?.user;

        if (event === "SIGNED_OUT") {
          localStorage.removeItem(KEY);
          setFavorites([]);
        }

        if (event === "SIGNED_IN" && user) {
          await loadDBFavorites(user.id);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // -----------------------------------------------------
  // FAVORİLERİ DB'DEN ÇEK
  // -----------------------------------------------------
 async function loadDBFavorites(user_id) {
  const { data, error } = await supabase
    .from("favorite_items")
    .select("*, products(*)")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false }); // 🔥 SIRALAMA EKLENDİ

  if (error) return;

  const formatted = data.map((row) => {
    let galleryArr = [];

    try {
      galleryArr = Array.isArray(row.products?.gallery)
        ? row.products.gallery
        : JSON.parse(row.products?.gallery || "[]");
    } catch {
      galleryArr = [];
    }

    return {
      id: row.product_id,
      title: row.products?.title || row.products?.name,
      price: row.products?.price || 0,
      old_price: row.products?.old_price || 0,
      stock: row.products?.stock || 0,
      image_url:
        row.products?.main_img ||
        galleryArr[0] ||
        "/products/default.png",
      gallery: galleryArr,
    };
  });

  setFavorites(formatted);
}


  // -----------------------------------------------------
  // FAVORİ EKLE
  // -----------------------------------------------------
  const addFav = async (product) => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    const obj = {
      id: product.id,
      title: product.title || product.name,
      price: Number(product.price || 0),
      old_price: Number(product.old_price || 0),
      stock: Number(product.stock || 0),
      img_url:
        product.main_img ||
        product.image_url ||
        (product.gallery?.[0] ?? null) ||
        "/products/default.png",
      gallery: product.gallery || [],
    };

    if (!user) {
      const ls = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!ls.some((x) => x.id === obj.id)) {
        const updated = [...ls, obj];
        localStorage.setItem(KEY, JSON.stringify(updated));
        setFavorites(updated);
      }
      return;
    }

    // DB'ye ekle
    await supabase.from("favorite_items").insert([
      {
        user_id: user.id,
        product_id: obj.id,
        title: obj.title,
        price: obj.price,
        old_price: obj.old_price,
        img_url: obj.img_url,
        gallery: obj.gallery,
        stock: obj.stock,
      },
    ]);

    // ❗ FAVORİ EKLENİNCE ANINDA GÜNCELLE
    await loadDBFavorites(user.id);
  };

  // -----------------------------------------------------
  // FAVORİ SİL
  // -----------------------------------------------------
  const removeFav = async (pid) => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      const ls = JSON.parse(localStorage.getItem(KEY) || "[]");
      const newList = ls.filter((i) => i.id !== pid);
      localStorage.setItem(KEY, JSON.stringify(newList));
      setFavorites(newList);
      return;
    }

    await supabase
      .from("favorite_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", pid);

    await loadDBFavorites(user.id);
  };

  const isFav = (id) => favorites.some((p) => String(p.id) === String(id));

  return (
    <FavoritesContext.Provider value={{ favorites, loading, addFav, removeFav, isFav }}>
      {children}
    </FavoritesContext.Provider>
  );
}
