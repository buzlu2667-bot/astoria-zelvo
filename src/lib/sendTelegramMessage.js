// 📁 src/lib/sendTelegramMessage.js

export async function sendTelegramMessage(product) {
  const TOKEN = "8147067311:AAF-jsytktUZuSB3zkbvm9vQAPTUiNexV44"; // BotFather'dan aldığın token
  const CHAT_ID = "@maximoraofficial"; // Kanal kullanıcı adın

  const message = `
✨ <b>MAXIMORA Premium Koleksiyonu</b> ✨

👜 <b>${product.name}</b>
💰 ${product.price} ₺
🌐 <a href="https://maximorashop.com/urun/${product.id}">Satın al</a>
`;

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
}
