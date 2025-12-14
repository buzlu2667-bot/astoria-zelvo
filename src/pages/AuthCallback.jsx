import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { sendShopAlert } from "../utils/sendShopAlert";

export default function AuthCallback() {
  useEffect(() => {
    async function run() {
      // User al
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Profile var mı?
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // Full name fallback
      const name =
        user.user_metadata.full_name ||
        user.user_metadata.name ||
        user.email.split("@")[0];

      if (!profile) {
        // Yeni profile oluştur
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: name,
          phone: user.user_metadata.phone || "",
        });

         await sendShopAlert(`
🆕 YENİ ÜYE (GOOGLE)
📧 ${user.email}
👤 ${name}
`);

        // 🎉 TOAST → KAYIT BAŞARILI
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              type: "success",
              text: "🎉 Google ile kayıt başarılı! Hoş geldin!",
            },
          })
        );
      } else {
        // 👋 TOAST → GİRİŞ BAŞARILI
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              type: "success",
              text: "👋 Google ile giriş yapıldı!",
            },
          })
        );
      }



      // ⏳ Toast'ın görünmesi için küçük bekleme
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    }

    run();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-lg">
      Giriş yapılıyor...
    </div>
  );
}
