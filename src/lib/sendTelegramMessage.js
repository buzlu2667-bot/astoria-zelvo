// 📁 src/lib/sendTelegramMessage.js
export async function sendTelegramMessage(product) {
  const TOKEN = "8147067311:AAF-jsytktUZuSB3zkbvm9vQAPTUiNexV44"; // senin bot token
  const CHAT_ID = "-1003391683483"; // senin kanal ID'si ✅

  const message = `
✨ <b>MAXIMORA Premium Koleksiyonu</b> ✨

👜 <b>${product.name}</b>
💰 ${product.price} ₺
🌐 <a href="https://maximorashop.com/urun/${product.id}">Satın al</a>
`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    console.log("📩 Telegram yanıtı:", data);
  } catch (err) {
    console.error("❌ Telegram mesaj hatası:", err);
  }
}
