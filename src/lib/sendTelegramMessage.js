// 📁 src/lib/sendTelegramMessage.js
export async function sendTelegramMessage(product) {
  const TOKEN = "8147067311:AAFsqP2Qn_nRp7rZX6P1eZ8ABA4lFDJSorQ";
  const CHAT_ID = "@maximoraofficial";

  // 💎 stok etiketi
  const s = Number(product.stock ?? 0);
  let stockLabel = "🔴 <b>Tükendi</b>";
  if (s > 3) stockLabel = " <b>Stokta</b>";
  else if (s > 0) stockLabel = " <b>Az Kaldı</b>";

  // 👑 premium caption
  const caption = `
<b>⭐✨ YENİ ÜRÜN GELDİ! ✨⭐</b>
━━━━━━━━━━━━━━━━━━━━━━━
<b>👑 MAXIMORA EXCLUSIVE COLLECTION 👑</b>

👜 <b>${product.name}</b>  
💰 <b>${product.price} ₺</b>  
🎁 ${stockLabel}

🛍️ <a href="https://maximorashop.com/product/${product.id}">Ürünü Hemen Gör</a>
━━━━━━━━━━━━━━━━━━━━━━━
<b>💝 Zarafetin, stilin ve lüksün adresi: MAXIMORA 💝</b>
✨ <i>“Tarzını lüksle buluştur.”</i> ✨
#Maximora #LuxuryDrop #NewArrival #ExclusiveStyle
`.trim();

  // 📸 görsel URL temizliği
   // 📸 Görsel URL (Supabase product bucket'tan public şekilde)
 let imageUrl = product.image_url;

if (imageUrl) {
  // 🔹 Supabase public URL'den direkt erişim linki oluştur
  if (!imageUrl.startsWith("http")) {
    imageUrl = `https://tvsfhhxxligbqrcqtprq.supabase.co/storage/v1/object/public/product-images/${imageUrl.replace(/^\/+/, "")}`;
  }

  // 🔹 Telegram cache sorununu aşmak için query param ekle
  imageUrl = imageUrl.split("?")[0] + `?t=${Date.now()}`;
  imageUrl = encodeURI(imageUrl);
} else {
  imageUrl = "https://maximorashop.com/assets/placeholder-product.png";
}




  try {
    // 1️⃣ ana gönderi (foto + caption)
    console.log("📸 Gönderilen imageUrl:", imageUrl);
  try {
  console.log("📸 Gönderilen imageUrl:", imageUrl);

  // 🔹 Supabase'ten fotoğrafı binary olarak çek
  const imageRes = await fetch(imageUrl);
  const blob = await imageRes.blob();
  const formData = new FormData();
  formData.append("chat_id", CHAT_ID);
  formData.append("photo", blob, "product.jpg");
  formData.append("caption", caption);
  formData.append("parse_mode", "HTML");

  // 🔹 Telegram'a gönder (FormData ile)
  const resPhoto = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
    method: "POST",
    body: formData,
  });

  const dataPhoto = await resPhoto.json();
  console.log("📸 Telegram sendPhoto yanıtı:", dataPhoto);

  if (!dataPhoto.ok) {
    console.warn("⚠️ Fotoğraf gönderilemedi, metin moduna geçiliyor...");
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: caption,
        parse_mode: "HTML",
      }),
    });
  }
} catch (err) {
  console.error("🚨 Telegram gönderim hatası:", err);
}


    const dataPhoto = await resPhoto.json();
    console.log("📸 Telegram sendPhoto yanıtı:", dataPhoto);

    // 2️⃣ eğer gönderi başarılıysa otomatik “lüks reaction”
    if (dataPhoto?.ok && dataPhoto?.result?.message_id) {
      const messageId = dataPhoto.result.message_id;

      setTimeout(async () => {
        const reaction =
          "💫💛✨ YENİ MAXIMORA DROP — TARZINI LÜKSLE BULUŞTUR ✨💛💫";
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            reply_to_message_id: messageId,
            text: reaction,
          }),
        });
        console.log("💬 Lüks reaction gönderildi:", reaction);
      }, 5000);
    }

    // 3️⃣ fallback (foto hata verirse metin olarak at)
    if (!dataPhoto.ok) {
      console.warn("⚠️ Fotoğraf gönderilemedi, metin moduna geçiliyor...");
      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: caption,
          parse_mode: "HTML",
        }),
      });
    }
  } catch (err) {
    console.error("🚨 Telegram gönderim hatası:", err);
  }
}
