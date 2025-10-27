import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { session, profile, loading } = useSession();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) setChecking(false);
  }, [loading]);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 text-gray-600 text-lg">
        Kontrol ediliyor...
      </div>
    );
  }

  // Kullanıcı yoksa
  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  // Admin sayfasına erişim kontrolü
  if (adminOnly && profile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
