import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 border-r border-gray-800 p-5 flex flex-col gap-4 sticky top-0">
        <h2 className="text-lg font-bold mb-3 tracking-wide">
          Technomart Admin
        </h2>

        <NavItem to="/admin">Dashboard</NavItem>
        <NavItem to="/admin/orders">Siparişler</NavItem>
        <NavItem to="/admin/products">Ürünler</NavItem>
        <NavItem to="/admin/notes">Canlı Notlar</NavItem>

        {/* ✅ Kupon Yönetimi Menü */}
        <NavItem to="/admin/coupons">Kuponlar</NavItem>
       
        {/* ✅ Kullanıcı Yönetimi Menü */}
        <NavItem to="/admin/users">Kullanıcılar</NavItem>

      </aside>

      {/* Page content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm transition
        ${
          isActive
            ? "bg-white text-black font-semibold"
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
