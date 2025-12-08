// ✅ src/App.jsx — FULL + Maintenance Bypass Version
import ToastContainer from "./components/ToastContainer";
import ScrollTopButton from "./components/ScrollTopButton";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Messages from "./pages/Messages";
import KvkkPage from "./pages/KvkkPage";
import PrivacyPage from "./pages/PrivacyPage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toast from "./components/Toast";

import CategoryMain from "./pages/CategoryMain";
import CategorySub from "./pages/CategorySub";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import OrderDetail from "./pages/OrderDetail";
import ResetPassword from "./pages/ResetPassword";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import { AdminGuard } from "./pages/admin/AdminGuard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminNotificationForm from "./pages/admin/AdminNotificationForm.jsx";
import AdminBannerSettings from "./pages/admin/AdminBannerSettings";
import AdminScrollText from "./pages/admin/AdminScrollText";
import AdminSendMessage from "./pages/admin/AdminSendMessage";
import AdminMail from "./pages/admin/AdminMail";
import AdminProfit from "./pages/admin/AdminProfit";
import AdminSales from "./pages/admin/AdminSales";
import AdminHome from "./pages/admin/AdminHome";

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
  const [bypass, setBypass] = useState(false);

  

  // 🔥 1) URL üzerinden admin bypass
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pass = params.get("admin") === "1";
    if (pass) setBypass(true);
  }, []);

  // 🔥 2) Maintenance kontrol
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

  // 🔥 3) Admin e-mail bypass
  async function checkAdmin() {
    const { data: ud } = await supabase.auth.getUser();
    const user = ud?.user;

    if (user && user.email === "buzlu2667@gmail.com") {
      setIsAdmin(true);
    }
  }

  useEffect(() => {
    checkMaintenance();
    checkAdmin();
  }, []);



  
  // 🔥 Admin + URL bypass, bakım modunu geçer
  const maintenanceBypassed = isAdmin || bypass;

  // ❌ Eğer bakım açık ve admin değilse → bakım sayfası göster
  if (maint && !maintenanceBypassed) {
    return (
      <MaintenancePage
        until={maint.until}
        message={maint.message}
      />
    );
  }

  // 🚨 PROVIDER YOK ARTIK BURADA — TEK YER MAIN.JSX 🚨
  return (
    <>
      <Header />
   
      <ToastContainer />
  <ScrollTopButton />
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
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/mesajlarim" element={<Messages />} />
        <Route path="/category/:mainSlug" element={<CategoryMain />} />
        <Route path="/category/:mainSlug/:subSlug" element={<CategorySub />} />
        <Route path="/kvkk" element={<KvkkPage />} />
          <Route path="/gizlilik-politikasi" element={<PrivacyPage />} />
         <Route path="/iade-kosullari" element={<ReturnPolicyPage />} />

        {/* Admin Panel */}
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
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="notifications" element={<AdminNotificationForm />} />
          <Route path="banner-settings" element={<AdminBannerSettings />} />
          <Route path="scroll-text" element={<AdminScrollText />} />
          <Route path="/admin/messages" element={<AdminSendMessage />} />
          <Route path="/admin/mail" element={<AdminMail />} />
          <Route path="profit" element={<AdminProfit />} />
          <Route path="/admin/sales" element={<AdminSales />} />
        <Route path="/admin/home-settings" element={<AdminHome />} />
        </Route>
      </Routes>

      <Footer />
  

    
    </>
  );
}
