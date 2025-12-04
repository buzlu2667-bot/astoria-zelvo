// src/utils/sendShopAlert.js
export async function sendShopAlert(message) {
  const TOKEN = "8413315948:AAHmmGpHnsAujJNL-gXNjmblwImfHm_RUMY";
  const CHAT_ID = "-1003336748060";

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    console.log("TELEGRAM RESULT:", data);
  } catch (err) {
    console.error("Telegram gönderim hatası:", err);
  }
}
