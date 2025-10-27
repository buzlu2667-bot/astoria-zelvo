// ✅ Premium Footer — Black Icon Version
import { FaInstagram, FaFacebookF, FaTiktok, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";

const shippingIcons = [
  { name: "Yurtiçi", src: "/src/assets/footer/shipping-yurtici.png" },
  { name: "Aras", src: "/src/assets/footer/shipping-aras.png" },
  { name: "MNG", src: "/src/assets/footer/shipping-mng.png" },
  { name: "Sürat", src: "/src/assets/footer/shipping-surat.png" },
  { name: "Ups", src: "/src/assets/footer/shipping-ups.png" },
];

const paymentIcons = [
  { name: "Visa", src: "/src/assets/footer/pay-visa.png" },
  { name: "Mastercard", src: "/src/assets/footer/pay-mastercard.png" },
  { name: "Troy", src: "/src/assets/footer/pay-troy.png" },
];

export default function Footer() {
  return (
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
          <span className="hover:text-white cursor-pointer">Gizlilik Politikası</span>
          <span className="hover:text-white cursor-pointer">İade Koşulları</span>
        </div>

        <p className="text-xs text-gray-500">© 2025 ASTORIA ZELVO — Tüm Hakları Saklıdır.</p>
      </div>

      {/* ✅ WhatsApp Sabit Buton */}
      <a
        href="https://wa.me/905555555555"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 w-14 h-14 rounded-full flex
                   items-center justify-center shadow-lg shadow-green-500/40
                   hover:scale-110 transition text-white text-3xl z-[999]"
      >
        <FaWhatsapp />
      </a>
    </footer>
  );
}
