// ⭐ MAXIMORA — Premium Neon Footer (DRAWER'SIZ — SAYFA YÖNLENDİRME)

import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";

const shippingIcons = [
  { name: "Yurtiçi", src: "/footer/shipping-yurtici.png" },
  { name: "Aras", src: "/footer/shipping-aras.png" },
  { name: "MNG", src: "/footer/shipping-mng.png" },
  { name: "Sürat", src: "/footer/shipping-surat.png" },
  { name: "Ups", src: "/footer/shipping-ups.png" },
];

const paymentIcons = [
  "/footer/pay-visa.png",
  "/footer/pay-mastercard.png",
  "/footer/pay-troy.png",
  "/footer/pay-shopier.png",
];

export default function Footer() {
  return (
    <>
      <footer className="relative mt-24">

        {/* === ARKA NEON GLOW === */}
        <div className="absolute inset-0 bg-gradient-to-b 
          from-[#003730]/40 via-[#002b26]/70 to-black 
          shadow-[0_0_200px_90px_rgba(0,255,200,0.25)_inset]
        "></div>

        {/* === ANA BLOK === */}
        <div className="relative max-w-[1500px] mx-auto px-8 py-20 text-gray-300">

          {/* === ÜST BLOKLAR === */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-y-10 text-center md:text-left">

            {/* Kargo Firmaları */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex flex-wrap justify-center md:justify-start gap-5">
                {shippingIcons.map((item) => (
                  <img
                    key={item.name}
                    src={item.src}
                    alt={item.name}
                    className="h-10 opacity-80 hover:opacity-100 transition drop-shadow-[0_0_10px_#00fff7]"
                  />
                ))}
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="flex justify-center gap-6 text-3xl">
              {[
                { icon: <FaInstagram />, color: "#ff007a", href: null },
                { icon: <FaFacebookF />, color: "#006eff", href: null },
                { icon: <FaTiktok />,  color: "#ff0033", href: null },
                { icon: <FaTelegramPlane />, color: "#00aaff", href: "https://t.me/maximoraofficial" },
                { icon: <FaWhatsapp />, color: "#00ff55", href: "https://wa.me/905384657526" },
              ].map((s, i) =>
                s.href ? (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-black"
                    style={{
                      border: `2px solid ${s.color}`,
                      boxShadow: `0 0 15px ${s.color}80`,
                      color: s.color,
                    }}
                  >
                    {s.icon}
                  </a>
                ) : (
                  <div
                    key={i}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-black cursor-default"
                    style={{
                      border: `2px solid ${s.color}`,
                      boxShadow: `0 0 15px ${s.color}80`,
                      color: s.color,
                    }}
                  >
                    {s.icon}
                  </div>
                )
              )}
            </div>

            {/* Ödeme Logoları */}
            <div className="flex flex-wrap justify-center md:justify-end gap-5">
              {paymentIcons.map((src, i) => (
                <img key={i} src={src} className="h-10 opacity-80 hover:opacity-100 transition" />
              ))}
            </div>

          </div>

          {/* === ALT BLOK === */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-14">

            {/* MAXIMORA */}
            <div>
              <h2 className="text-4xl font-extrabold text-[#4afff9] drop-shadow-[0_0_15px_#00fff588]">
                MAXIMORA
              </h2>
              <p className="mt-4 text-gray-400 leading-6">
                Premium çanta & dijital ürün & petshop ürünleri & oyun içi alışveriş. 
                Güvenli altyapı – anlık teslimat – hızlı kargo – %100 müşteri memnuniyeti.
              </p>
              <div className="w-24 h-[3px] mt-5 bg-[#4afff9] shadow-[0_0_18px_#00fff5] rounded-full"></div>
            </div>

            {/* Kurumsal */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#9fffee] drop-shadow-[0_0_10px_#00ffbf]">
                Kurumsal
              </h3>

              <div className="flex flex-col gap-3 text-sm">
                <a href="/kvkk" className="hover:text-[#4afff9]">KVKK</a>
                <a href="/gizlilik-politikasi" className="hover:text-[#4afff9]">Gizlilik Politikası</a>
                <a href="/iade-kosullari" className="hover:text-[#4afff9]">İade Koşulları</a>
              </div>
            </div>

            {/* Müşteri */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#9fffee] drop-shadow-[0_0_10px_#00ffbf]">
                Müşteri
              </h3>

              <div className="flex flex-col gap-3 text-sm">
                <a href="/dashboard" className="hover:text-[#4afff9]">Profilim</a>
                <a href="/orders" className="hover:text-[#4afff9]">Siparişlerim</a>
                <a href="/favorites" className="hover:text-[#4afff9]">Favorilerim</a>
              </div>
            </div>

            {/* İletişim */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#9fffee] drop-shadow-[0_0_10px_#00ffbf]">
                İletişim
              </h3>

              <div className="bg-black/50 border border-[#00ffb085] p-4 rounded-xl shadow-[0_0_20px_#00ffb090]">
                <p>
                  Mail:{" "}
                  <a
                    href="mailto:destek@maximorashop.com"
                    className="text-[#4afff9] hover:underline"
                  >
                    destek@maximorashop.com
                  </a>
                </p>

                <p className="mt-1">
                  Destek: <span className="text-[#00ff88]">7/24 Aktif</span>
                </p>
              </div>
            </div>

          </div>

          {/* Güvenli Alışveriş */}
          <div className="flex justify-center items-center gap-2 mt-10 text-yellow-400 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span className="drop-shadow-[0_0_12px_#ffee88]">GÜVENLİ ALIŞVERİŞ</span>
          </div>

          <p className="text-center text-gray-500 text-xs mt-4">
            © 2025 MAXIMORA — Tüm Hakları Saklıdır.
          </p>

        </div>
      </footer>
    </>
  );
}
