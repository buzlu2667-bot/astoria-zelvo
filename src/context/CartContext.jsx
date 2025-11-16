// ✅ src/context/CartContext.jsx — PREMIUM FINAL ✅
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const CartContext = createContext();

export function CartProvider({ children }) {
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("elitemart_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("elitemart_cart", JSON.stringify(cart));
  }, [cart]);

  
 



  const total = useMemo(() => {
    return cart.reduce((sum, item) =>
      sum + Number(item.price || 0) * (item.quantity || 1), 0
    );
  }, [cart]);

  const isInCart = (productId) => cart.some((p) => p.id === productId);

 const addToCart = (product) => {
  setCart((prev) => {
    const existing = prev.find((p) => p.id === product.id);

    const updated = existing
      ? prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: (p.quantity || 1) + (product.quantity || 1) }
            : p
        )
      : [
          ...prev,
          {
            ...product,
            quantity: product.quantity || 1,
          ...product,
quantity: product.quantity || 1,

          },
        ];

    localStorage.setItem("elitemart_cart", JSON.stringify(updated));
    return updated;
  });
};





 const inc = (productId) => {
  setCart((prev) => {
    const updated = prev.map((p) =>
      p.id === productId
        ? { ...p, quantity: (p.quantity || 1) + 1 }
        : p
    );
    localStorage.setItem("elitemart_cart", JSON.stringify(updated)); // 🟡 burası eklenecek
    return updated;
  });
};


 const dec = (productId) => {
  setCart((prev) => {
    const updated = prev
      .map((p) =>
        p.id === productId
          ? { ...p, quantity: Math.max((p.quantity || 1) - 1, 0) }
          : p
      )
      .filter((p) => p.quantity > 0);
    localStorage.setItem("elitemart_cart", JSON.stringify(updated)); // 🟡 burası eklenecek
    return updated;
  });
};

const removeFromCart = (productId) => {
  setCart((prev) => {
    const updated = prev.filter((p) => (p.id ?? p._id) !== productId);
    localStorage.setItem("elitemart_cart", JSON.stringify(updated)); // 🟡 burası eklenecek
    return updated;
  });
};



 const clearCart = () => {
  setCart([]);
  localStorage.removeItem("elitemart_cart");

  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "success",
        text: "🧹 Tertemiz! Sepetin sıfırlandı ✨"
      }
    })
  );
};



  // ✅ 🔥 FORM + PAYMENT backend’e işleniyor!
const placeOrder = async (payload) => {
  try {
    if (cart.length === 0) return { error: "Sepet boş!" };

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

  const res = await supabase
  .from("orders")
  .insert([
    {
      user_id: user.id,
      full_name: payload.full_name,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      note: payload.note,
      payment_method: payload.payment_method,

      // ⭐️ ÖNEMLİ → STATUS BURADA
      status: payload.status,

      coupon: payload.coupon,
      discount_amount: payload.discount_amount,
      final_amount: payload.final_amount,

      total_amount: total,
      final_amount: payload.final_amount || total,
    },
  ])
  .select("id")
  .single();


    if (res.error) throw res.error;

    const orderId = res.data.id;
const orderItems = cart.map((p) => ({
  order_id: orderId,
  product_id: p.id,
  product_name: p.name,
  unit_price: p.price * (p.quantity || 1), // 💥 fiyatı çarp
  quantity: p.quantity || 1,
  custom_info: p.custom_info ? JSON.stringify(p.custom_info) : null, // 🎯 form bilgileri
}));



    await supabase.from("order_items").insert(orderItems);


    clearCart();

    return { success: true, orderId };
  } catch (err) {
    console.error(err);
    return { error: err.message };
  }
};

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        inc,
        dec,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
