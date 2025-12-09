import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function syncProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Google → profiles kaydı oluştur
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata.full_name || "",
        phone: user.user_metadata.phone || "",
      });

      // Profil oluşturuldu → anasayfaya git
      navigate("/");
    }

    syncProfile();
  }, []);

  return (
    <div className="p-10 text-center text-gray-600">
      Giriş yapılıyor, lütfen bekleyin...
    </div>
  );
}
