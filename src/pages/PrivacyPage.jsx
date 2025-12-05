// 📄 src/pages/PrivacyPage.jsx — MAXIMORA GİZLİLİK POLİTİKASI (PREMIUM)
import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* BAŞLIK */}
        <h1 className="text-3xl font-extrabold text-yellow-600 mb-6 tracking-wide">
          Gizlilik Politikası
        </h1>

        {/* Alt çizgi */}
        <div className="h-[3px] w-24 bg-yellow-400 rounded-full mb-10" />

        {/* 1 - Genel Bilgiler */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            1. Genel Bilgiler
          </h2>
          <p className="leading-relaxed text-gray-700">
            Bu Gizlilik Politikası, <strong>MAXIMORA</strong> (“biz”, “şirket”, “site”)
            tarafından işletilen e-ticaret platformu üzerinden toplanan ve
            işlenen kişisel verilerin korunmasına ilişkin ilkeleri açıklar.
            Tüm işlemler <strong>6698 sayılı KVKK</strong> ve ilgili mevzuata uygun olarak yürütülür.
          </p>
        </section>

        {/* 2 - Toplanan Veriler */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            2. Toplanan Veriler
          </h2>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Hesap bilgileri (ad, e-posta, telefon, adres)</li>
            <li>Sipariş, fatura ve teslimat bilgileri</li>
            <li>Canlı destek mesaj kayıtları (Tawk.to, LiveChat veya Comm100)</li>
            <li>IP adresi, tarayıcı bilgisi, cihaz verileri</li>
            <li>Çerez (cookie) verileri — site güvenliği ve analiz için</li>
          </ul>
        </section>

        {/* 3 - Canlı Destek Servisleri */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            3. Canlı Destek Servisleri (Tawk.to, LiveChat, Comm100)
          </h2>

          <p className="leading-relaxed text-gray-700 mb-4">
            MAXIMORA, ziyaretçilerine anlık destek sağlamak amacıyla üçüncü taraf
            canlı destek servislerini kullanabilir:
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-3">
            <li>
              <strong>Tawk.to:</strong> ABD merkezli bir sağlayıcıdır. Sohbet sırasında
              paylaşılan bilgiler (isim, e-posta, mesaj içeriği) şifreli olarak
              saklanabilir. Ayrıntılar için Tawk.to’nun{" "}
              <a
                href="https://www.tawk.to/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-600 font-semibold"
              >
                gizlilik politikası
              </a>{" "}
              incelenebilir.
            </li>

            <li>
              <strong>LiveChat:</strong> Avrupa Birliği merkezlidir ve GDPR uyumludur. Veriler
              Avrupa Ekonomik Alanı içinde işlenebilir.
            </li>

            <li>
              <strong>Comm100:</strong> Kanada merkezlidir. Sohbet ve bot etkileşimlerinde
              paylaşılan kişisel veriler şifreli biçimde işlenir. Ayrıntılar için{" "}
              <a
                href="https://www.comm100.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-600 font-semibold"
              >
                gizlilik politikası
              </a>{" "}
              incelenebilir.
            </li>
          </ul>

          <p className="leading-relaxed text-gray-700 mt-4">
            Canlı sohbet özelliğini kullanarak, paylaştığınız bilgilerin müşteri
            desteği amacıyla işlenmesini kabul etmiş olursunuz.
          </p>
        </section>

        {/* 4 - Verilerin Kullanım Amaçları */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            4. Verilerin Kullanım Amaçları
          </h2>
          <p className="leading-relaxed text-gray-700">
            Kişisel verileriniz; sipariş işlemleri, teslimat, canlı destek,
            kullanıcı deneyimini geliştirme, analiz, güvenlik ve yasal
            yükümlülüklerin yerine getirilmesi amacıyla kullanılır.
          </p>
        </section>

        {/* 5 - Verilerin Saklanması ve Aktarımı */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            5. Verilerin Saklanması ve Aktarımı
          </h2>
          <p className="leading-relaxed text-gray-700">
            Veriler KVKK’ya uygun olarak güvenli sunucularda saklanır. Canlı
            destek verileri gibi bazı veriler yurt dışındaki sağlayıcılara
            aktarılabilir. Bu aktarım kullanıcının bilgilendirilmesi ve açık
            rızası doğrultusunda yapılır.
          </p>
        </section>

        {/* 6 - Çerezler */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            6. Çerezler (Cookies)
          </h2>
          <p className="leading-relaxed text-gray-700">
            Site, oturum yönetimi, sepet bilgisi, tercihlerin hatırlanması ve
            performans analizi için çerezler kullanır. Tarayıcı ayarlarından
            çerezleri devre dışı bırakabilirsiniz; ancak bazı özellikler
            çalışmayabilir.
          </p>
        </section>

        {/* 7 - Kullanıcı Hakları */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            7. Kullanıcı Hakları
          </h2>
          <p className="leading-relaxed text-gray-700">
            KVKK kapsamında kullanıcılar; verilerine erişim, düzeltme, silme,
            işlemeye itiraz ve veri aktarımı haklarına sahiptir. Bu haklar için:
          </p>

          <p className="mt-2 font-semibold text-yellow-600">
            destek@maximorashop.com
          </p>
        </section>

        {/* 8 - Güvenlik */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            8. Güvenlik
          </h2>
          <p className="leading-relaxed text-gray-700">
            Veri güvenliği için SSL şifreleme, erişim kontrolleri, düzenli
            sunucu güvenlik testleri ve şifreli veri saklama yöntemleri
            uygulanır.
          </p>
        </section>

        {/* 9 - Değişiklikler */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            9. Değişiklikler
          </h2>
          <p className="leading-relaxed text-gray-700">
            Gizlilik politikası gerektiğinde güncellenebilir. Güncellemeler site
            üzerinden duyurulur.
          </p>
        </section>

        {/* FOOTER */}
        <hr className="my-10 border-gray-300" />

        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} <strong>MAXIMORA</strong> — Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
