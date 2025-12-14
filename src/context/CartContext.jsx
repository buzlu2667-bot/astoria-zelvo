// 🔥 GOLD PREMIUM DB CART — FINAL V10
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { pickImage } from "../utils/image";
import { useSession } from "../context/SessionContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
    const { session } = useSession();
const [discountRules, setDiscountRules] = useState([]);

  // 🚚 ÜCRETSİZ KARGO LİMİTİ
  const FREE_SHIPPING_LIMIT = 1500;

useEffect(() => {
  loadDiscountRules();
}, []);

async function loadDiscountRules() {
  const { data } = await supabase
    .from("cart_discounts")
    .select("*")
    .eq("active", true)
    .order("min_quantity", { ascending: true });

  setDiscountRules(data || []);
}

  // ---------------------------------------------------------
  // SAYFA AÇILDIĞINDA USER KONTROL + DB LOAD
  // ---------------------------------------------------------
  useEffect(() => {
    (async () => {

     
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      // MISAFİR
      if (!user) {
        const ls = JSON.parse(localStorage.getItem("elitemart_cart") || "[]");
        setCart(ls);
        setLoading(false);
        return;
      }

      // LOGIN → MERGE + LOAD
      await mergeLocalToDB(user.id);
      await loadDBCart(user.id);

      localStorage.removeItem("elitemart_cart");
      setLoading(false);
    })();
  }, []);

  // ---------------------------------------------------------
  // DB'DEN CART ÇEK
  // ---------------------------------------------------------
 async function loadDBCart(user_id) {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", user_id);

 

  setCart(data || []);
}

// ---------------------------------------------------------
// 🔥 LOGIN / LOGOUT OLUNCA SEPETİ OTOMATİK GÜNCELLE
// ---------------------------------------------------------
useEffect(() => {
  (async () => {
    if (loading) return;

    // Kullanıcı yok → LS'den yükle
    if (!session) {
      const ls = JSON.parse(localStorage.getItem("elitemart_cart") || "[]");
      setCart(ls);
      return;
    }

    // Kullanıcı varsa → DB'den çek
    await loadDBCart(session.user.id);
  })();
}, [session]);

// ---------------------------------------------------------
// 🔥 MİSAFİR KULLANICI → CART HER DEĞİŞTİĞİNDE LS'YE YAZ
// ---------------------------------------------------------
useEffect(() => {
  // loading bitmeden yazma
  if (loading) return;

  // login değilse → localStorage güncelle
  if (!session) {
    localStorage.setItem("elitemart_cart", JSON.stringify(cart));
  }

}, [cart, session, loading]);



  // ---------------------------------------------------------
  // LOCAL STORAGE → DB MERGE
  // ---------------------------------------------------------
  async function mergeLocalToDB(user_id) {
    const ls = JSON.parse(localStorage.getItem("elitemart_cart") || "[]");

    if (ls.length === 0) return;

    for (const item of ls) {
      const { data: exist } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user_id)
      .eq("product_id", item.product_id)
        .maybeSingle();

      if (exist) {
        // Miktar ekle
        await supabase
          .from("cart_items")
          .update({ quantity: exist.quantity + item.quantity })
          .eq("id", exist.id);
    } else {
  const { data: mIns, error: mErr } = await supabase
    .from("cart_items")
    .insert([
      {
        user_id: user_id,
       product_id: item.product_id // UUID
, // UUID
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        main_img: item.main_img,
        img_url: item.main_img
      },
    ]);

 
}

    }
  }

  // ---------------------------------------------------------
  // SEPETE EKLE
  // ---------------------------------------------------------
const addToCart = async (product) => {


 const pid =
  product.id ||                      // 1) Bazı yerlerde id geliyor
  product.tid ||                     // 2) Bazı yerlerde tid geliyor
  product.product_id ||              // 3) Supabase'ten gelen id
  product.pid ||                     // 4) Belki pid
  product?.data?.id ||               // 5) fallback
  product?.data?.tid ||              // 6) fallback
  product?.attributes?.id ||         // 7) bazı API'ler
  product?.attributes?.tid ||        // 8) bazı API'ler
  null;


  if (!pid) {
    console.log("❌ ÜRÜN ID YOK! product:", product);
    return;
  }


  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const img = pickImage(product);

  // LOGIN DEĞİLSE → LOCAL STORAGE
// LOGIN DEĞİLSE → LOCAL STORAGE
if (!user) {
  const ls = JSON.parse(localStorage.getItem("elitemart_cart") || "[]");

  // doğru exist kontrolü
  const exist = ls.find((i) => String(i.product_id) === String(pid));

  const updated = exist
    ? ls.map((i) =>
        String(i.product_id) === String(pid)
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    : [
        ...ls,
        {
          product_id: String(pid),
          name: product.title || product.name,
          quantity: 1,
          price: Number(product.price),
          old_price: Number(product.old_price || 0),
          main_img: img,
        selectedcolor: product.selectedColor || null,
        },
      ];

  localStorage.setItem("elitemart_cart", JSON.stringify(updated));
  setCart(updated);
 return !!exist;
}


  // LOGIN → DB
  const { data: exist } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", pid)
    .maybeSingle();

  if (exist) {
    await supabase
      .from("cart_items")
      .update({ quantity: exist.quantity + 1 })
      .eq("id", exist.id);
  } else {
    const { data: ins, error: insErr } = await supabase
      .from("cart_items")
      .insert([
        {
          user_id: user.id,
       product_id: String(pid),
          name: product.title || product.name || "Ürün",
          price: Number(product.price) || 0,
           old_price: Number(product.old_price || 0),
          quantity: 1,
          main_img: img || null,
          img_url: img || null,
    selectedcolor: product.selectedColor || null,
        },
      ]);

 
  }

  await loadDBCart(user.id);
  return !!exist;
};

  // ---------------------------------------------------------
  // ARTIR
  // ---------------------------------------------------------
// ---------------------------------------------------------
// ARTIR (UI FIRST) — FINAL
// ---------------------------------------------------------
const inc = async (id) => {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const pid = id;

  // ⭐ UI’yı ANLIK güncelle
  setCart(prev =>
    prev.map(i =>
      i.product_id === pid ? { ...i, quantity: i.quantity + 1 } : i
    )
  );

  // ⭐ DB'ye arkadan yaz (UI'yi bozmadan)
  if (user) {
    await supabase
      .from("cart_items")
      .update({
        quantity:
          (cart.find(i => i.product_id === pid)?.quantity || 0) + 1,
      })
      .eq("product_id", pid)
      .eq("user_id", user.id);
  }
};



  // ---------------------------------------------------------
  // AZALT
  // ---------------------------------------------------------
// ---------------------------------------------------------
// AZALT (UI FIRST) — FINAL
// ---------------------------------------------------------
const dec = async (id) => {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const pid = id;

  // ⭐ Önce UI güncellenir
  let newState = cart
    .map(i =>
      i.product_id === pid ? { ...i, quantity: i.quantity - 1 } : i
    )
    .filter(i => i.quantity > 0);

  setCart(newState);

  // ⭐ DB arkadan güncellenir
  if (user) {
    const item = cart.find(i => i.product_id === pid);
    if (!item) return;

    if (item.quantity === 1) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("product_id", pid)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("cart_items")
        .update({ quantity: item.quantity - 1 })
        .eq("product_id", pid)
        .eq("user_id", user.id);
    }
  }
};



  // ---------------------------------------------------------
  // SİL
  // ---------------------------------------------------------
// ---------------------------------------------------------
// SİL (UI FIRST) — FINAL
// ---------------------------------------------------------
const removeFromCart = async (id) => {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const pid = id;

  // ⭐ UI’yı direkt güncelle
  setCart(prev => prev.filter(i => i.product_id !== pid));

  if (user) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("product_id", pid)
      .eq("user_id", user.id);
  }
};



  // ---------------------------------------------------------
  // TEMİZLE
  // ---------------------------------------------------------
  const clearCart = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      localStorage.removeItem("elitemart_cart");
      setCart([]);
      return;
    }

    await supabase.from("cart_items").delete().eq("user_id", user.id);
    await loadDBCart(user.id);
  };

  // ---------------------------------------------------------
// 🔥 SİPARİŞ OLUŞTUR — %100 HATASIZ FINAL
// ---------------------------------------------------------
// ---------------------------------------------------------
// 🔥 SİPARİŞ OLUŞTUR — RENK + ORDER_ITEMS EKLENMİŞ FINAL V10
// ---------------------------------------------------------


const placeOrder = async (payload) => {
  try {
    const { data: ud } = await supabase.auth.getUser();
    const user = ud?.user;
    if (!user) return { error: "no-user" };

    // 🎟 KUPON İNDİRİMİ
    const couponDiscount = Number(payload.coupon_discount_amount || 0);

    // 💰 GERÇEK ÖDENEN TUTAR
    const finalAmount = Math.max(total - couponDiscount, 0);

    // 1️⃣ ORDER OLUŞTUR
    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          full_name: payload.full_name,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
          note: payload.note || null,
          payment_method: payload.payment_method,
          status: payload.status,

          // 🎟 KUPON
          coupon: payload.coupon || null,
          coupon_discount_amount: couponDiscount,

          // 🔥 SEPET İNDİRİMİ
          cart_discount_amount: cartExtraDiscount,

          // 💰 ÖDENEN TUTAR (EN ÖNEMLİ SATIR)
          final_amount: finalAmount,

          // 🚚 KARGO
          shipping_type: hasFreeShipping
            ? "free_shipping"
            : "paid_by_customer",
        },
      ])
      .select()
      .single();

    if (orderErr) {
      console.log("🟥 ORDER INSERT ERROR:", orderErr);
      return { error: orderErr };
    }

    // 2️⃣ ORDER ITEMS
    const orderItemsPayload = cart.map((i) => ({
      order_id: orderData.id,
      product_id: i.product_id || i.id,
      product_name: i.name || i.title,
      quantity: i.quantity,
      unit_price: Number(i.price),
      color: i.selectedcolor || i.selectedColor || "Belirtilmedi",
      image_url:
        i.image_url ||
        i.main_img ||
        i.img_url ||
        (Array.isArray(i.gallery) ? i.gallery[0] : null) ||
        "/products/default.png",
    }));

    await supabase.from("order_items").insert(orderItemsPayload);

    // 3️⃣ CART TEMİZLE
    await clearCart();

    return { orderId: orderData.id };
  } catch (err) {
    console.log("🔥 placeOrder runtime error:", err);
    return { error: err };
  }
};

// ⭐ SEPETTEKİ TOPLAM ÜRÜN ADEDİ
const totalQuantity = useMemo(() => {
  return cart.reduce(
    (acc, i) => acc + Number(i.quantity || 0),
    0
  );
}, [cart]);

// ⭐ ADET BAZLI SEPET İNDİRİM ORANI
// 1 ürün  → %0
// 2 ürün  → %5
// 3-4     → %7
// 5+      → %10
const cartExtraDiscountPercent = useMemo(() => {
  if (!discountRules.length) return 0;

  let percent = 0;

  for (const rule of discountRules) {
    if (totalQuantity >= rule.min_quantity) {
      percent = rule.discount_percent;
    }
  }

  return percent;
}, [totalQuantity, discountRules]);

// ⭐ BİR SONRAKİ İNDİRİM KURALI (UPSSELL)
const nextDiscountRule = useMemo(() => {
  if (!discountRules.length) return null;

  // şu anki üründen büyük olan ilk kural
  return discountRules.find(
    (r) => r.min_quantity > totalQuantity
  ) || null;
}, [discountRules, totalQuantity]);

// ⭐ KAÇ ÜRÜN DAHA EKLENMELİ
const remainingForNextDiscount = useMemo(() => {
  if (!nextDiscountRule) return 0;
  return Math.max(nextDiscountRule.min_quantity - totalQuantity, 0);
}, [nextDiscountRule, totalQuantity]);


// ⭐ ARA TOPLAM
const subtotal = useMemo(() => {
  return cart.reduce(
    (acc, i) => acc + Number(i.price || 0) * Number(i.quantity),
    0
  );
}, [cart]);

// 🚚 Ücretsiz kargo için kalan tutar
const remainingForFreeShipping = useMemo(() => {
  return Math.max(FREE_SHIPPING_LIMIT - subtotal, 0);
}, [subtotal]);

// 🚚 Ücretsiz kargo kazanıldı mı?
const hasFreeShipping = useMemo(() => {
  return subtotal >= FREE_SHIPPING_LIMIT;
}, [subtotal]);


// ⭐ SEPETE ÖZEL İNDİRİM TUTARI
const cartExtraDiscount = useMemo(() => {
  return subtotal * cartExtraDiscountPercent / 100;
}, [subtotal, cartExtraDiscountPercent]);

// ⭐ ÖDENECEK TOPLAM
const total = useMemo(() => {
  return Math.max(subtotal - cartExtraDiscount, 0);
}, [subtotal, cartExtraDiscount]);

// 🔥 (İLERDE TOAST / LOG / ANALYTICS İÇİN HAZIR)
useEffect(() => {
  // burada istersek:
  // - toast
  // - event
  // - analytics
}, [cart]);

return (
  <CartContext.Provider
    value={{
      cart,
      loading,

      // 🔥 YENİ DEĞERLER
      subtotal,
      totalQuantity,
      cartExtraDiscount,
      cartExtraDiscountPercent,
      total,
     nextDiscountRule,
    remainingForNextDiscount,
     // 🚚 KARGO
    remainingForFreeShipping,
    hasFreeShipping,
  

      // 🔥 AKSİYONLAR
      addToCart,
      inc,
      dec,
      removeFromCart,
      clearCart,
      placeOrder,
    }}
  >
    {children}
  </CartContext.Provider>
);

}
