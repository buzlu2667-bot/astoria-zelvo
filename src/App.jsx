// ✅ src/App.jsx — FULL FINAL ✅

import Favorites from "./pages/Favorites";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer"; // ✅ FOOTER IMPORT
import Toast from "./components/Toast";
import Category from "./pages/Category";

// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import OrderDetail from "./pages/OrderDetail";
import ResetPassword from "./pages/ResetPassword";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import { AdminGuard } from "./pages/admin/AdminGuard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminNotificationForm from "./pages/admin/AdminNotificationForm.jsx";


// Contexts ✅
import { SessionProvider } from "./context/SessionContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";

import MaintenancePage from "./pages/MaintenancePage";
import { supabase } from "./lib/supabaseClient";

function HashRedirector() {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      const newUrl = "/reset-password" + hash.replace("#", "?");
      navigate(newUrl, { replace: true });
    }
  }, [navigate]);
  return null;
}

export default function App() {
  const [maint, setMaint] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function checkMaintenance() {
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "maintenance")
      .maybeSingle();

    if (settings?.value?.enabled) {
      const now = new Date();
      const until = new Date(settings.value.until);
      if (now < until) {
        setMaint(settings.value);
      }
    }
  }

  async function checkAdmin() {
    const { data: ud } = await supabase.auth.getUser();
    const user = ud?.user;
    setIsAdmin(user?.email === "admin@admin.com");
  }

  useEffect(() => {
    checkMaintenance();
    checkAdmin();
  }, []);

  if (maint && !isAdmin) {
    return (
      <MaintenancePage
        until={maint.until}
        message={maint.message}
      />
    );
  }

  return (
    <SessionProvider>
      <CartProvider>
        <FavoritesProvider>
          
          <Header />
          <Toast />
          <HashRedirector />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ✅ Categories */}
            <Route path="/category/:id" element={<Category />} />

            {/* ✅ Admin Panel Protected */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="notifications" element={<AdminNotificationForm />} />
            </Route>
          </Routes>

          <Footer /> {/* ✅ FOOTER HER SAYFADA */}

        </FavoritesProvider>
      </CartProvider>
    </SessionProvider>
  );
}
