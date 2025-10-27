import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Navigate } from "react-router-dom";

// Buraya admin e-postalarını yaz
const ADMIN_EMAILS = ["buzlu2667@gmail.com"];

export function AdminGuard({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        const email = data?.user?.email;
        if (!alive) return;
        setAllowed(!!email && ADMIN_EMAILS.includes(email));
      } catch {
        if (!alive) return;
        setAllowed(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (allowed === null) return <div className="p-8 text-gray-500">Yükleniyor…</div>;
  if (!allowed) return <Navigate to="/" replace />;
  return children;
}

// Hem named hem default export
export default AdminGuard;
