// ✅ Premium Footer — Black Icon Version
import { FaInstagram, FaFacebookF, FaTiktok, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import PrivacyDrawer from "./PrivacyDrawer"; // ← bunu ekledik (dosya yolu senin components klasörüne göre)

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

  return (
    <>
      <footer className="bg-black border-t border-neutral-800 text-gray-400 pt-14 pb-10 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center px-6 gap-10">

          {/* ✅ Kargo Firmaları */}
          <div className="text-left">
            <h3 className="font-bold text-white mb-3 text-lg"></h3>
            <div className="flex gap-5">
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
              {[FaInstagram, FaFacebookF, FaTiktok, FaTelegramPlane].map((Icon, i) => (
                <Icon key={i} className="text-gray-400 hover:text-white transition cursor-pointer" />
              ))}
            </div>
          </div>

          {/* ✅ Güvenli Ödeme */}
          <div className="text-right">
            <h3 className="font-bold text-white mb-3 text-lg"></h3>
            <div className="flex justify-end gap-5">
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
            <span className="hover:text-white cursor-pointer">KVKK</span>

            {/* 🔥 işte burası — onClick ekledik */}
            <span
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-yellow-400 cursor-pointer transition"
            >
              Gizlilik Politikası
            </span>

            <span className="hover:text-white cursor-pointer">İade Koşulları</span>
          </div>

          <p className="text-xs text-gray-500">
            © 2025 MAXIMORA — Tüm Hakları Saklıdır.
          </p>
        </div>
      <a
  href="https://wa.me/905384657526"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-5 right-5 flex items-center gap-2 bg-white text-[#444] font-medium px-3 py-1.5 rounded-md shadow-md transition-all duration-300 z-[9999] cursor-pointer select-none"
>
  <FaWhatsapp className="text-green-600 text-lg" />
  <span className="text-[13px] tracking-tight">WhatsApp Destek</span>
</a>






      </footer>

      {/* ✅ Premium Drawer (Modal) */}
      <PrivacyDrawer open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}
