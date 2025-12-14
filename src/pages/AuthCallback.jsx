import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { sendShopAlert } from "../utils/sendShopAlert";

export default function AuthCallback() {
 useEffect(() => {
  async function run() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isNewUser = user.created_at === user.last_sign_in_at;

    if (isNewUser) {
      await sendShopAlert(`
🆕 YENİ ÜYE (GOOGLE)
📧 ${user.email}
👤 ${user.user_metadata?.full_name || "-"}
      `);

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            text: "🎉 Google ile kayıt başarılı!",
          },
        })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            text: "👋 Google ile giriş yapıldı!",
          },
        })
      );
    }

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  }

  run();
}, []);


  return (
    <div className="flex items-center justify-center h-screen text-lg">
      Giriş yapılıyor...
    </div>
  );
}
