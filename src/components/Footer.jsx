// ✅ Premium Footer — Black Icon Version
import { FaInstagram, FaFacebookF, FaTiktok, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import PrivacyDrawer from "./PrivacyDrawer";
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
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
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

              {/* 🔗 Telegram */}
              <a
                href="https://t.me/maximoraofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition drop-shadow-[0_0_6px_#0088cc] hover:drop-shadow-[0_0_12px_#33ccff]"
              >
                <FaTelegramPlane />
              </a>

              {/* 🔗 WhatsApp */}
              <a
                href="https://wa.me/905384657526"
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
          <div className="flex justify-center items-center gap-8 text-xs mb-3 flex-wrap">

            {/* 🛡️ Güvenli Alışveriş */}
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span className="font-light text-[10px] tracking-wide text-yellow-400 drop-shadow-[0_0_12px_rgba(255,215,0,0.9)] brightness-125">
                   GÜVENLİ ALIŞVERİŞ
                    </span>
                    
                  </div>

            {/* KVKK */}
            <span
              onClick={() => setKvkkOpen(true)}
              className="hover:text-yellow-400 cursor-pointer transition"
            >
              KVKK
            </span>

            {/* Gizlilik Politikası */}
            <span
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-yellow-400 cursor-pointer transition"
            >
              Gizlilik Politikası
            </span>

            {/* İade Koşulları */}
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
        <a
  href="https://wa.me/905384657526"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 flex items-center gap-2 bg-white text-[#444] font-medium px-4 py-2 rounded-md shadow-md transition-all duration-300 z-[9999] cursor-pointer select-none hover:scale-105 hover:shadow-lg sm:px-4 sm:py-2 sm:text-[13px] text-[13px]"
>
  <FaWhatsapp className="text-green-600 text-[20px] sm:text-[18px]" />
  <span className="hidden sm:inline text-[13px] tracking-tight">WhatsApp Destek</span>
</a>





      </footer>

      {/* ✅ Premium Drawer (Modal) */}
      <PrivacyDrawer open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <ReturnDrawer open={returnOpen} onClose={() => setReturnOpen(false)} />
      <KvkkDrawer open={kvkkOpen} onClose={() => setKvkkOpen(false)} />
    </>
  );
}
