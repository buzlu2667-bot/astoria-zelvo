import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  PackageCheck,
  Users,
  BadgePercent,
  MessageSquare,
  Megaphone,
  Image,
  BarChart3,
  Mail,
  TrendingUp,
  Settings,
  LogOut
} from "lucide-react";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0b] text-white">

      <aside className="w-[260px] bg-[#111] border-r border-[#222] flex flex-col p-4">
        <h1 className="text-xl font-bold mb-6">
          <span className="text-yellow-400">MAXIMORA</span> ADMIN
        </h1>

        <nav className="flex flex-col gap-1">

          {/* DASHBOARD */}
          <NavGroup title="Genel">
            <AdminLink to="/admin" icon={<LayoutDashboard size={18} />}>Dashboard</AdminLink>
            <AdminLink to="/admin/home-settings" icon={<Settings size={18} />}>Home Ayarları</AdminLink>
          </NavGroup>

          {/* SATIŞ */}
          <NavGroup title="Satış & Sipariş">
            <AdminLink to="/admin/orders" icon={<ShoppingCart size={18} />}>Siparişler</AdminLink>
            <AdminLink to="/admin/profit" icon={<TrendingUp size={18} />}>Kâr Yönetimi</AdminLink>
            <AdminLink to="/admin/sales" icon={<BarChart3 size={18} />}>Satış Raporu</AdminLink>
            <AdminLink to="/admin/cart-discounts" icon={<BadgePercent size={18} />}>Sepet İndirimleri</AdminLink>
          </NavGroup>

          {/* ÜRÜN */}
          <NavGroup title="Ürün & İçerik">
            <AdminLink to="/admin/products" icon={<PackageCheck size={18} />}>Ürünler</AdminLink>
            <AdminLink to="/admin/comments" icon={<MessageSquare size={18} />}>Yorumlar</AdminLink>
            <AdminLink to="/admin/banner-settings" icon={<Image size={18} />}>Banner</AdminLink>
            <AdminLink to="/admin/scroll-text" icon={<Megaphone size={18} />}>Kayan Yazı</AdminLink>
          </NavGroup>

          {/* PAZARLAMA */}
          <NavGroup title="Pazarlama">
            <AdminLink to="/admin/coupons" icon={<BadgePercent size={18} />}>Kuponlar</AdminLink>
            <AdminLink to="/admin/notifications" icon={<Megaphone size={18} />}>Bildirim</AdminLink>
            <AdminLink to="/admin/mail" icon={<Mail size={18} />}>Mail Gönder</AdminLink>
          </NavGroup>

          {/* KULLANICI */}
          <NavGroup title="Kullanıcı & Destek">
            <AdminLink to="/admin/users" icon={<Users size={18} />}>Kullanıcılar</AdminLink>
            <AdminLink to="/admin/messages" icon={<MessageSquare size={18} />}>Mesajlar</AdminLink>
          </NavGroup>

        </nav>

        <button
          onClick={() => window.location.href="/logout"}
          className="mt-auto flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300"
        >
          <LogOut size={18}/> Çıkış
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavGroup({ title, children }) {
  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 px-2">{title}</div>
      {children}
    </div>
  );
}

function AdminLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
        ${isActive
          ? "bg-yellow-400 text-black shadow-md"
          : "text-gray-400 hover:text-yellow-300 hover:bg-yellow-400/10"}`
      }
    >
      {icon}{children}
    </NavLink>
  );
}
