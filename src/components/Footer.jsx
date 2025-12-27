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
    <footer className="mt-24 bg-[#f5f5f5] border-t border-gray-300">
      <div className="max-w-[1500px] mx-auto px-8 py-16 text-gray-700">

        {/* ÜST BLOK – KARGOLAR / SOSYAL / ÖDEME */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-y-10 text-center md:text-left">

          {/* Kargo Firmaları */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex flex-wrap justify-center md:justify-start gap-5">
              {shippingIcons.map((item) => (
                <img
                  key={item.name}
                  src={item.src}
                  alt={item.name}
                  className="h-10 opacity-80 hover:opacity-100 transition"
                />
              ))}
            </div>
          </div>

          {/* Sosyal Medya */}
          <div className="flex justify-center gap-6 text-3xl">
            {[
              { icon: <FaInstagram />, color: "#d22a7d", href: null },
              { icon: <FaFacebookF />, color: "#1877f2", href: null },
              { icon: <FaTiktok />, color: "#ff0033", href: null },
              { icon: <FaTelegramPlane />, color: "#0088cc", href: "https://t.me/maximoraofficial" },
              { icon: <FaWhatsapp />, color: "#25D366", href: "https://wa.me/905384657526" },
            ].map((s, i) =>
              s.href ? (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-300 hover:shadow-md"
                  style={{ color: s.color }}
                >
                  {s.icon}
                </a>
              ) : (
                <div
                  key={i}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-300 cursor-default"
                  style={{ color: s.color }}
                >
                  {s.icon}
                </div>
              )
            )}
          </div>

          {/* Ödeme Logoları */}
          <div className="flex flex-wrap justify-center md:justify-end gap-5">
            {paymentIcons.map((src, i) => (
              <img
                key={i}
                src={src}
                className="h-10 opacity-80 hover:opacity-100 transition"
              />
            ))}
          </div>

        </div>

        {/* ALT BLOK */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-14">

          {/* MAXIMORA */}
          <div>
          <div className="leading-[1.05] select-none">

  <div className="relative flex items-center gap-[2px]">
    <span
      className="
        text-transparent bg-clip-text
        bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400
        font-black tracking-[0.22em] text-[34px]
        drop-shadow-[0_0_16px_rgba(0,255,200,0.7)]
      "
    >
      MAXI
    </span>

    <span
      className="
        text-transparent bg-clip-text
        bg-gradient-to-r from-yellow-300 via-orange-300 to-rose-400
        font-black tracking-[0.22em] text-[34px]
        drop-shadow-[0_0_18px_rgba(255,190,90,0.9)]
        animate-pulse
      "
    >
      M
    </span>

    <span
      className="
        text-transparent bg-clip-text
        bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400
        font-black tracking-[0.22em] text-[34px]
        drop-shadow-[0_0_16px_rgba(0,255,200,0.7)]
      "
    >
      ORA
    </span>
  </div>

  <span
    className="
      block mt-1 text-[11px]
      tracking-[0.45em] uppercase
      text-cyan-400
      drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]
    "
  >
    Lifestyle & Tech Store
  </span>

</div>

            <p className="mt-4 text-gray-600 leading-6">
              Premium çanta • dijital ürünler • petshop ürünleri • oyun içi alışveriş.
              Güvenli ödeme – anlık teslimat – hızlı kargo.
            </p>
            <div className="w-24 h-[3px] mt-5 bg-gray-800 rounded-full"></div>
          </div>

          {/* Kurumsal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Kurumsal
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <a href="/kvkk" className="hover:text-black">KVKK</a>
              <a href="/gizlilik-politikasi" className="hover:text-black">Gizlilik Politikası</a>
              <a href="/iade-kosullari" className="hover:text-black">İade Koşulları</a>
              <a href="/delete-data" className="hover:text-black">Veri Silme</a>
            </div>
          </div>

          {/* Müşteri */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Müşteri
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <a href="/dashboard" className="hover:text-black">Profilim</a>
              <a href="/orders" className="hover:text-black">Siparişlerim</a>
              <a href="/favorites" className="hover:text-black">Favorilerim</a>
            </div>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              İletişim
            </h3>
            <div className="bg-white border border-gray-300 p-4 rounded-xl">
              <p>
                Mail:{" "}
                <a href="mailto:destek@maximorashop.com" className="text-black hover:underline">
                  destek@maximorashop.com
                </a>
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Destek: 7/24 Aktif
              </p>
            </div>
          </div>

        </div>
<div className="mt-14 flex justify-center">
  <div
    className="
      flex items-center gap-2
      px-5 py-2.5
      rounded-full
      bg-white
      border border-emerald-400/50
      text-emerald-500 font-semibold tracking-[0.18em] text-[13px]
      shadow-[0_4px_14px_rgba(0,200,170,0.25)]
    "
  >
    <svg
      className="w-5 h-5 text-emerald-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>

    GÜVENLİ ALIŞVERİŞ
  </div>
</div>



        {/* Alt Yazı */}
        <p className="text-center text-gray-500 text-xs mt-10">
          © 2025 MAXIMORA — Tüm Hakları Saklıdır.
        </p>

      </div>
    </footer>
  );
}
