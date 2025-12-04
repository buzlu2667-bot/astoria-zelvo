// 📁 src/lib/sendTelegramMessage.js
export async function sendTelegramMessage(product) {
  const TOKEN = "8147067311:AAFsqP2Qn_nRp7rZX6P1eZ8ABA4lFDJSorQ";
  const CHAT_ID = "@maximoraofficial";

  const title = product.title || "Yeni Ürün";
  const price = Number(product.price || 0);
  const oldPrice = Number(product.old_price || 0);
  const stock = Number(product.stock ?? 0);

  // 🎯 İNDİRİM HESABI
  let discountText = "";
  if (oldPrice > price) {
    const rate = Math.round(((oldPrice - price) / oldPrice) * 100);
    discountText = `🔥 <b>%${rate} İNDİRİM</b>`;
  }

  // 🎯 STOK ETİKETİ – MODERN
  let stockLabel = "🔴 <b>TÜKENDİ</b>";
  if (stock > 10) stockLabel = "🟢 <b>STOKTA</b>";
  else if (stock > 3) stockLabel = "🟡 <b>AZALIYOR</b>";
  else if (stock > 0) stockLabel = "🧡 <b>SON ADETLER</b>";

  const productUrl = `https://maximorashop.com/product/${product.id}`;

  // 🎯 Görsel
  let imageUrl = product.main_img;
  if (!imageUrl) imageUrl = "https://maximorashop.com/assets/placeholder.png";

  if (!imageUrl.startsWith("http")) {
    imageUrl =
      "https://tvsfhhxxligbqrcqtprq.supabase.co/storage/v1/object/public/products/" +
      imageUrl.replace(/^\/+/, "");
  }

  imageUrl = encodeURI(imageUrl + `?t=${Date.now()}`);

  // 💎 MODERN + GOLD + PREMIUM CAPTION
  const caption = `
<b>😎YENİ ÜRÜNN 💚 MAXIMORA LUXURY DROP 💚✨</b>
━━━━━━━━━━━━━━━━━━

<b>${title}</b>

💰 <b>${price.toLocaleString("tr-TR")} ₺</b>  
${oldPrice > price ? `❌ <s>${oldPrice.toLocaleString("tr-TR")} ₺</s>` : ""}

${discountText ? discountText : ""}

${stockLabel}

━━━━━━━━━━━━━━━━━━
🕞<a href="${productUrl}">Ürünü İncele</a>
━━━━━━━━━━━━━━━━━━

<b>♉️ Premium • Şıklık • Zarafet • Kalite ♉️</b>
<i>“Tarzını lüksle buluştur.”</i>

#Maximora #LuxuryDrop #Fashion #Exclusive
  `.trim();

  try {
    // FOTO YÜKLEME
    const img = await fetch(imageUrl);
    const blob = await img.blob();

    const fd = new FormData();
    fd.append("chat_id", CHAT_ID);
    fd.append("photo", blob, "maximora.jpg");
    fd.append("caption", caption);
    fd.append("parse_mode", "HTML");

    const res = await fetch(
      `https://api.telegram.org/bot${TOKEN}/sendPhoto`,
      { method: "POST", body: fd }
    );

    const data = await res.json();
    console.log("📸 Telegram sendPhoto:", data);

    // FOTO HATA → fallback text
    if (!data.ok) {
      await fetch(
        `https://api.telegram.org/bot${TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: caption,
            parse_mode: "HTML",
          }),
        }
      );
    }

  } catch (err) {
    console.error("❌ Telegram gönderim hatası:", err);
  }
}
