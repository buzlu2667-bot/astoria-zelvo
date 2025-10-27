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

  
  useEffect(() => {
  const addListener = (e) => addToCart(e.detail);
  window.addEventListener("cart-add", addListener);
  return () => window.removeEventListener("cart-add", addListener);
}, []);


  const total = useMemo(() => {
    return cart.reduce((sum, item) =>
      sum + Number(item.price || 0) * (item.quantity || 1), 0
    );
  }, [cart]);

  const isInCart = (productId) => cart.some((p) => p.id === productId);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const inc = (productId) => {
    setCart((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, quantity: (p.quantity || 1) + 1 }
          : p
      )
    );
  };

  const dec = (productId) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === productId
            ? { ...p, quantity: Math.max((p.quantity || 1) - 1, 0) }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCart = () => setCart([]);

  // ✅ 🔥 FORM + PAYMENT backend’e işleniyor!
  const placeOrder = async (form, paymentMethod) => {
    try {
      if (cart.length === 0) return { error: "Sepet boş." };

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return { error: "Giriş yapmanız gerekiyor." };

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            total_amount: total,
            status: "pending",
            full_name: form.full_name,
            phone: form.phone,
            address: form.address,
            note: form.note,
            payment: paymentMethod, // ✅ iban | cod
          },
        ])
        .select("id")
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      const orderItems = cart.map((p) => ({
        order_id: orderId,
        product_id: p.id,
        product_name: p.name,
        unit_price: p.price,
        quantity: p.quantity || 1,
      }));

      await supabase.from("order_items").insert(orderItems);

      clearCart();
      return { success: true, orderId };

    } catch (err) {
      console.error("Sipariş oluşturma hatası:", err);
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
