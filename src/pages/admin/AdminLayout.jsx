import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex">

      {/* 🌟 Mobil Üst Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-yellow-600/20 bg-[#0f0f0f] fixed top-0 left-0 right-0 z-50">
        <h2 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-amber-200 text-transparent bg-clip-text">
          MAXIMORA ADMIN
        </h2>

        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md bg-black/40 border border-yellow-600/30"
        >
          <Menu className="w-6 h-6 text-yellow-300" />
        </button>
      </div>

      {/* 🌟 Sidebar */}
      <aside
        className={`
          w-60 bg-gradient-to-b from-[#0f0f0f] via-[#111] to-[#0a0a0a]
          border-r border-yellow-600/20 p-5 flex flex-col gap-4 
          shadow-[0_0_25px_rgba(255,215,0,0.05)]
          fixed top-0 bottom-0 z-50
          transition-transform duration-300
          lg:relative lg:translate-x-0 
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 bg-black/40 border border-yellow-600/30 rounded-md"
        >
          <X className="w-5 h-5 text-yellow-300" />
        </button>

        <h2 className="text-lg font-bold mb-3 tracking-wide bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent">
          MAXIMORA ADMIN
        </h2>
        <NavItem to="/admin/home-settings" setOpen={setOpen}>Home Ayarları</NavItem>
        <NavItem to="/admin" setOpen={setOpen}>Dashboard</NavItem>
        <NavItem to="/admin/orders" setOpen={setOpen}>Siparişler</NavItem>
        <NavItem to="/admin/products" setOpen={setOpen}>Ürünler</NavItem>
        <NavItem to="/admin/coupons" setOpen={setOpen}>Kuponlar</NavItem>
        <NavItem to="/admin/users" setOpen={setOpen}>Kullanıcılar</NavItem>
        <NavItem to="/admin/notifications" setOpen={setOpen}>Bildirim Gönder</NavItem>
        <NavItem to="/admin/messages" setOpen={setOpen}>Mesajlar</NavItem>
        <NavItem to="/admin/banner-settings" setOpen={setOpen}>Banner Ayarları</NavItem>
        <NavItem to="/admin/scroll-text" setOpen={setOpen}>Kayan Yazı</NavItem>
        <NavItem to="/admin/mail" setOpen={setOpen}>Mail Gönder</NavItem>
        <NavItem to="/admin/profit" setOpen={setOpen}>Kâr Yönetimi</NavItem>
        <NavItem to="/admin/sales" setOpen={setOpen}>Satış Raporu</NavItem>
      </aside>

      {/* 🌟 İçerik */}
      <main className="flex-1 p-4 lg:p-6 mt-16 lg:mt-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

/* 🌟 Navigasyon Butonu */
function NavItem({ to, children, setOpen }) {
  return (
    <NavLink
      to={to}
      end
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300
        ${
          isActive
            ? "text-black bg-gradient-to-r from-yellow-400 to-amber-300 shadow-[0_0_15px_rgba(255,215,0,0.4)]"
            : "text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
