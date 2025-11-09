// ✅ Premium Footer — Black Icon Version
import { FaInstagram, FaFacebookF, FaTiktok, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import PrivacyDrawer from "./PrivacyDrawer"; // ← bunu ekledik (dosya yolu senin components klasörüne göre)
import ReturnDrawer from "./ReturnDrawer";
import KvkkDrawer from "./KvkkDrawer";


const shippingIcons = [
  { name: "Yurtiçi", src: "/footer/shipping-yurtici.png" },
  { name: "Aras", src: "/footer/shipping-aras.png" },
  { name: "MNG", src: "/footer/shipping-mng.png" },
  { name: "Sürat", src: "/footer/shipping-surat.png" },
  { name: "Ups", src: "/footer/shipping-ups.png" },
];

const paymentIcons = [
  { name: "Visa", src: "/footer/pay-visa.png" },
  { name: "Mastercard", src: "/footer/pay-mastercard.png" },
  { name: "Troy", src: "/footer/pay-troy.png" },
];

export default function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false); // ✅ gizlilik modalı için state
  const [returnOpen, setReturnOpen] = useState(false); // ✅ iade koşulları drawer için state
  const [kvkkOpen, setKvkkOpen] = useState(false);


  

  return (
    <>
      <footer className="bg-black border-t border-neutral-800 text-gray-400 pt-14 pb-10 mt-20">
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center px-6 gap-y-10 md:gap-10 text-center md:text-left">


          {/* ✅ Kargo Firmaları */}
          <div className="text-left">
            <h3 className="font-bold text-white mb-3 text-lg"></h3>
           <div className="flex flex-wrap justify-center md:justify-start gap-5">

              {shippingIcons.map((item) => (
                <img
                  key={item.name}
                  src={item.src}
                  alt={item.name}
                  className="h-8 opacity-80 hover:opacity-100 transition"
                />
              ))}
            </div>
          </div>

          {/* ✅ Sosyal Medya */}
          <div className="text-center">
            <h3 className="font-bold text-white mb-3 text-lg"></h3>
            <div className="flex justify-center gap-6 text-2xl">
  <FaInstagram className="text-gray-400 hover:text-white transition" />
  <FaFacebookF className="text-gray-400 hover:text-white transition" />
  <FaTiktok className="text-gray-400 hover:text-white transition" />

  {/* 🔗 Sadece Telegram tıklanabilir */}
 {/* 🔗 Telegram (parlak mavi neon glow) */}
<a
  href="https://t.me/maximoraofficial"
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-400 hover:text-blue-300 transition drop-shadow-[0_0_6px_#0088cc] hover:drop-shadow-[0_0_12px_#33ccff]"
>
  <FaTelegramPlane />
</a>

{/* 🔗 WhatsApp (parlak yeşil neon glow) */}
<a
  href="https://wa.me/905384657526" // 🔹 numaranı yaz
  target="_blank"
  rel="noopener noreferrer"
  className="text-green-400 hover:text-green-300 transition drop-shadow-[0_0_6px_#00ff88] hover:drop-shadow-[0_0_12px_#00ff88]"
>
  <FaWhatsapp />
</a>


</div>

          </div>

          {/* ✅ Güvenli Ödeme */}
          <div className="text-right">
            <h3 className="font-bold text-white mb-3 text-lg"></h3>
           <div className="flex flex-wrap justify-center md:justify-end gap-5">
              {paymentIcons.map((item) => (
                <img
                  key={item.name}
                  src={item.src}
                  alt={item.name}
                  className="h-8 opacity-80 hover:opacity-100 transition"
                />
              ))}
            </div>
          </div>

        </div>

    
         {/* ✅ Alt Bilgi */}
        <div className="mt-10 text-center border-t border-neutral-800 pt-6">
          <div className="flex justify-center gap-8 text-xs mb-3">
           <span
  onClick={() => setKvkkOpen(true)}
  className="hover:text-yellow-400 cursor-pointer transition"
>
  KVKK
</span>

            {/* 🔥 işte burası — onClick ekledik */}
            <span
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-yellow-400 cursor-pointer transition"
            >
              Gizlilik Politikası
            </span>

           <span
  onClick={() => setReturnOpen(true)}
  className="hover:text-yellow-400 cursor-pointer transition"
>
  İade Koşulları
</span>

          </div>
          
          {/* ✅ İletişim Satırı */}
<p className="text-xs mb-2 text-gray-400">
  İletişim:{" "}
  <a
    href="mailto:destek@maximorashop.com"
    className="text-yellow-400 hover:underline hover:text-yellow-300 transition"
  >
    destek@maximorashop.com
  </a>
</p>


          <p className="text-xs text-gray-500">
            © 2025 MAXIMORA — Tüm Hakları Saklıdır.
          </p>
        </div>
     

 </footer>

      {/* ✅ Premium Drawer (Modal) */}
      <PrivacyDrawer open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
        <ReturnDrawer open={returnOpen} onClose={() => setReturnOpen(false)} />
          <KvkkDrawer open={kvkkOpen} onClose={() => setKvkkOpen(false)} />

    </>
  );
}
