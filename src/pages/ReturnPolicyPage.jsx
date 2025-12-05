// 📄 src/pages/ReturnPolicyPage.jsx — MAXIMORA İADE KOŞULLARI (PREMIUM)
import React from "react";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* BAŞLIK */}
        <h1 className="text-3xl font-extrabold text-yellow-600 mb-6 tracking-wide">
          İade Koşulları
        </h1>

        {/* Alt çizgi */}
        <div className="h-[3px] w-24 bg-yellow-400 rounded-full mb-10" />

        {/* 1 - Genel Bilgilendirme */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            1. Genel Bilgilendirme
          </h2>
          <p className="leading-relaxed text-gray-700">
            MAXIMORA olarak müşteri memnuniyetine büyük önem veriyoruz.
            Ürünlerimiz kalite ve dayanıklılık testlerinden geçirilir,
            sevkiyat öncesinde kalite kontrol birimimiz tarafından detaylı bir
            şekilde incelenir. Tüm siparişler güvenli şekilde paketlenerek
            gönderilir.
          </p>
        </section>

        {/* 2 - Değişim ve İnceleme Süreci */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            2. Değişim ve İnceleme Süreci
          </h2>
          <p className="leading-relaxed text-gray-700">
            Ürünlerde üretim kaynaklı veya lojistik süreçlerden doğan bir sorun
            yaşanması durumunda, müşteri temsilcilerimizle iletişime geçilmesi
            gerekmektedir. Yapılan inceleme sonucunda uygun görülen durumlarda
            ürün değişimi <strong>eşdeğer veya muadil ürün</strong> ile sağlanabilir.
          </p>
        </section>

        {/* 3 - İade Talepleri */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            3. İade Talepleri
          </h2>
          <p className="leading-relaxed text-gray-700">
            Ürünlerin kişisel kullanım niteliği, hijyen koşulları ve sınırlı stok
            yapısı nedeniyle doğrudan iade süreci uygulanmamaktadır. Ancak belirli
            durumlarda, inceleme sonucuna bağlı olarak değişim hakkı tanınabilir.
          </p>
        </section>

        {/* 4 - Değişim Koşulları */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            4. Değişim Koşulları
          </h2>

          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Ürün kullanılmamış, zarar görmemiş ve tüm aksesuarları eksiksiz olmalıdır.</li>
            <li>Değişim talebi teslim tarihinden itibaren 3 iş günü içinde iletilmelidir.</li>
            <li>Değişim işlemleri stok durumu ve ürün uygunluğu doğrultusunda yapılır.</li>
            <li>İade yerine eşdeğer ürün değişimi uygulanır.</li>
          </ul>
        </section>

        {/* 5 - Kargo ve Teslimat Süreçleri */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            5. Kargo ve Teslimat Süreçleri
          </h2>
          <p className="leading-relaxed text-gray-700">
            Değişim için gönderilen ürünlerde kargo bedeli alıcıya aittir.
            İnceleme sonucunda değişim onaylanırsa, yeni ürün ücretsiz kargo ile
            müşteriye gönderilir.
          </p>
        </section>

        {/* 6 - İletişim */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            6. İletişim
          </h2>
          <p className="leading-relaxed text-gray-700">
            Değişim ve destek talepleriniz için bizimle aşağıdaki adres üzerinden
            iletişime geçebilirsiniz:
          </p>

          <p className="mt-2 font-semibold text-yellow-600">
            destek@maximorashop.com
          </p>
        </section>

        {/* FOOTER */}
        <hr className="my-10 border-gray-300" />

        <p className="text-center text-gray-500 text-sm leading-relaxed">
          Not: Ürün iadesi yalnızca üretimsel hata veya stok uyumsuzluğu
          durumlarında değerlendirilir. Değişim prosedürü müşteri memnuniyeti
          esas alınarak yürütülmektedir.
          <br />
          © {new Date().getFullYear()} <strong>MAXIMORA</strong> — Tüm hakları saklıdır.
        </p>

      </div>
    </div>
  );
}
