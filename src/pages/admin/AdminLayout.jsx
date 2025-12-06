import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex">
      
      {/* 🌟 Sidebar */}
      <aside className="w-60 relative bg-gradient-to-b from-[#0f0f0f] via-[#111] to-[#0a0a0a] border-r border-yellow-600/20 p-5 flex flex-col gap-4 shadow-[0_0_25px_rgba(255,215,0,0.05)] overflow-hidden">
        {/* 💫 Altın parıltı efekti */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-yellow-300/10 to-transparent blur-2xl opacity-0 hover:opacity-30 transition-all duration-700"></div>

        <h2 className="text-lg font-bold mb-3 tracking-wide bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
          MAXIMORA ADMİN
        </h2>

        <NavItem to="/admin">Dashboard</NavItem>
        <NavItem to="/admin/orders">Siparişler</NavItem>
        <NavItem to="/admin/products">Ürünler</NavItem>
        <NavItem to="/admin/coupons">Kuponlar</NavItem>
        <NavItem to="/admin/users">Kullanıcılar</NavItem>
        <NavItem to="/admin/notifications">Bildirim Gönder</NavItem>
        <NavItem to="/admin/messages">Mesajlar</NavItem>
        <NavItem to="/admin/banner-settings">Banner Ayarları</NavItem>
        <NavItem to="/admin/scroll-text">Kayan Yazı</NavItem>
        <NavItem to="/admin/mail">Mail Gönder</NavItem>
        <NavItem to="/admin/profit">Kâr Yönetimi</NavItem>
        <NavItem to="/admin/sales">Satış Raporu</NavItem>
      

      </aside>

      {/* Page content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

/* 🌟 Navigasyon Item */
function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 overflow-hidden
        ${
          isActive
            ? "text-black bg-gradient-to-r from-yellow-400 to-amber-300 shadow-[0_0_15px_rgba(255,215,0,0.4)]"
            : "text-gray-400 hover:text-yellow-300 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-transparent"
        }`
      }
    >
      {/* Hover animasyonu */}
      <span className="absolute left-[-100%] top-0 w-full h-full bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 blur-sm transition-all duration-700 group-hover:left-[100%]" />
      {children}
    </NavLink>
  );
}
