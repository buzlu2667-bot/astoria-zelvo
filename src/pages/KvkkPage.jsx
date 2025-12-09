// 📄 src/pages/KvkkPage.jsx — MAXIMORA KVKK TAM SAYFA (PREMIUM)
import React from "react";

export default function KvkkPage() {
  return (
 <div className="min-h-screen bg-[#f6f6f6] px-4 pt-[90px] pb-8">

      <div className="max-w-4xl mx-auto">

        {/* BAŞLIK */}
        <h1 className="text-3xl font-extrabold text-yellow-600 mb-6 tracking-wide">
          KVKK Aydınlatma Metni
        </h1>

        {/* ALT ALTIN ÇİZGİ */}
        <div className="h-[3px] w-24 bg-yellow-400 rounded-full mb-10" />

        {/* 1 - Amaç ve Kapsam */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            1. Amaç ve Kapsam
          </h2>
          <p className="leading-relaxed text-gray-700">
            Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu
            (“KVKK”) kapsamında <strong>MAXIMORA</strong> olarak müşterilerimizin
            kişisel verilerini hangi amaçlarla işlediğimizi, sakladığımızı ve
            koruduğumuzu açıklamak amacıyla hazırlanmıştır.
          </p>
        </section>

        {/* 2 - Toplanan Veriler */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            2. Toplanan Veriler
          </h2>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Ad, soyad, e-posta adresi, telefon numarası</li>
            <li>Teslimat ve fatura adresi</li>
            <li>Sipariş ve ödeme bilgileri</li>
            <li>
              Canlı destek görüşme kayıtları (Tawk.to, LiveChat, Comm100)
            </li>
            <li>Site kullanım bilgileri ve çerez verileri</li>
          </ul>
        </section>

        {/* 3 - Verilerin İşlenme Amaçları */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            3. Verilerin İşlenme Amaçları
          </h2>
          <p className="leading-relaxed text-gray-700">
            Kişisel verileriniz; siparişlerin alınması, ürün teslimatı, müşteri
            hizmetleri desteği, kampanya ve bilgilendirme süreçleri,
            kullanıcı güvenliğinin sağlanması ve yasal yükümlülüklerin yerine
            getirilmesi amacıyla işlenmektedir.
          </p>
        </section>

        {/* 4 - Saklanma Süresi */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            4. Verilerin Saklanma Süresi
          </h2>
          <p className="leading-relaxed text-gray-700">
            Kişisel veriler, yasal zorunluluklar gereği en az 3 yıl boyunca
            saklanmakta; süre sonunda silinmekte, yok edilmekte veya anonim
            hale getirilmektedir.
          </p>
        </section>

        {/* 5 - Üçüncü Taraflarla Paylaşım */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            5. Üçüncü Taraflarla Paylaşım
          </h2>
          <p className="leading-relaxed text-gray-700">
            Verileriniz yalnızca kargo firmaları, ödeme sistemleri, canlı
            destek servisleri gibi iş ortaklarımız ile, hizmet sunumuna
            yönelik zorunluluklar kapsamında ve gizlilik sözleşmeleri
            çerçevesinde paylaşılabilir.
          </p>
        </section>

        {/* 6 - Kullanıcı Hakları */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            6. Kullanıcı Hakları
          </h2>
          <p className="leading-relaxed text-gray-700">
            KVKK’nın 11. maddesi kapsamında kullanıcılar; kişisel verilerine
            erişme, düzeltme, silme, işlenmesine itiraz etme ve bilgi talep
            etme hakkına sahiptir. Bu haklarınızı kullanmak için:
          </p>

          <p className="mt-2 font-semibold text-yellow-600">
            destek@maximorashop.com
          </p>
        </section>

        {/* 7 - Veri Güvenliği */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-yellow-600 mb-3">
            7. Veri Güvenliği
          </h2>
          <p className="leading-relaxed text-gray-700">
            Kişisel verileriniz SSL sertifikası ile şifrelenmiş bağlantılar
            üzerinden aktarılır ve güvenli sunucularda saklanır. Yetkisiz
            erişim, veri kaybı ve kötüye kullanımın önlenmesi amacıyla düzenli
            güvenlik testleri uygulanmaktadır.
          </p>
        </section>

        {/* FOOTER */}
        <hr className="my-10 border-gray-300" />

        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} <strong>MAXIMORA</strong> — KVKK kapsamında
          kişisel verileriniz güvendedir.
        </p>
      </div>
    </div>
  );
}
