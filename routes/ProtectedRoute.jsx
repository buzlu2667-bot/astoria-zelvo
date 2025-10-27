import { Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { session, profile, loading } = useSession();

  // ⏳ Yüklenme sürecinde bekleme ekranı
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-lg">
        Yükleniyor...
      </div>
    );
  }

  // ❌ Oturum yoksa giriş sayfasına yönlendir
  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  // 🔒 Admin sayfasına erişim kontrolü
  if (adminOnly && profile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ✅ Yetkiliyse içeriği göster
  return children;
}
