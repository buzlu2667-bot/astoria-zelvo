// 📄 src/pages/DeleteDataPage.jsx — MAXIMORA Veri Silme / Hesap Silme (PREMIUM)
import React from "react";

export default function DeleteDataPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] px-4 pt-[90px] pb-8">

      <div className="max-w-4xl mx-auto">

        {/* BAŞLIK */}
        <h1 className="text-3xl font-extrabold text-yellow-600 mb-6 tracking-wide">
          Hesap ve Veri Silme Talebi
        </h1>

        {/* ALT ALTIN ÇİZGİ */}
        <div className="h-[3px] w-24 bg-yellow-400 rounded-full mb-10" />

        {/* Açıklama */}
        <section className="mb-10">
          <p className="leading-relaxed text-gray-700">
            <strong>MAXIMORA</strong> olarak kullanıcı gizliliğine ve veri güvenliğine en yüksek
            seviyede önem veriyoruz. Facebook veya e-posta kaydıyla oluşturduğunuz
            hesabınıza ait verilerin silinmesini talep ediyorsanız, bu sayfa üzerinden
            gereken bilgileri edinebilir ve talebinizi iletebilirsiniz.
          </p>
        </section>

        {/* 1 - Silinebilecek Veriler */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            1. Silinebilecek Veriler
          </h2>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Profil bilgileri (ad, soyad, e-posta, telefon)</li>
            <li>Kayıtlı adresler</li>
            <li>Sipariş geçmişi</li>
            <li>Favori listesi</li>
            <li>Hesap ayarları ve tercihleri</li>
            <li>Sosyal giriş verileri (Google / Facebook)</li>
          </ul>

          <p className="mt-4 text-gray-700 leading-relaxed">
            Yasal zorunluluklar gereği, bazı sipariş ve fatura verileri{" "}
            <strong>en az 3 yıl</strong> süreyle saklanmak zorundadır. Bu veriler yalnızca
            mevzuatta belirtilen amaçlarla korunur.
          </p>
        </section>

        {/* 2 - Nasıl Silinir? */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            2. Hesap Silme İşlemi Nasıl Yapılır?
          </h2>

          <p className="leading-relaxed text-gray-700">
            Hesabınızın ve kişisel verilerinizin tamamen silinmesi için aşağıdaki
            e-posta adresine konu kısmı <strong>“Hesap Silme Talebi”</strong> olacak şekilde bir
            mesaj göndermeniz yeterlidir:
          </p>

          <p className="mt-3 font-semibold text-yellow-600 text-lg">
            destek@maximorashop.com
          </p>

          <p className="mt-4 leading-relaxed text-gray-700">
            Talebiniz alındıktan sonra, güvenlik doğrulaması yapılır ve hesabınız{" "}
            <strong>48 saat</strong> içerisinde tamamen silinir. Silme işlemi geri döndürülemez.
          </p>
        </section>

        {/* 3 - Facebook İçin Gereken Bilgi */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            3. Facebook Kullanıcıları İçin Bilgilendirme
          </h2>

          <p className="leading-relaxed text-gray-700">
            Facebook ile giriş yaptıysanız, hesabınızla ilişkili tüm verileriniz
            silindiğinde Facebook bağlantınız da otomatik olarak kaldırılır.
            Facebook’un veri politikası hakkında daha fazla bilgiye
            aşağıdaki bağlantıdan ulaşabilirsiniz:
          </p>

          <a
            href="https://www.facebook.com/help/1518149382214657"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-3 inline-block"
          >
            Facebook Veri Silme Yardım Sayfası →
          </a>
        </section>

        {/* FOOTER */}
        <hr className="my-10 border-gray-300" />

        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} <strong>MAXIMORA</strong> — Veri silme talepleriniz
          için bizimle iletişime geçebilirsiniz.
        </p>

      </div>
    </div>
  );
}
