import React from "react";

export default function ReturnDrawer({ open, onClose }) {
  return (
    <div className={`fixed inset-0 z-[9999] transition-all ${open ? "visible" : "invisible"}`}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[680px] bg-[#070707]/95 backdrop-blur-2xl border-l border-yellow-400/20 shadow-[0_0_45px_rgba(255,215,0,0.15)] transform transition-transform duration-300 rounded-l-2xl
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-yellow-400/10">
          <h2 className="text-xl font-bold text-yellow-400">İade Koşulları</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-yellow-300 text-2xl leading-none">✕</button>
        </div>

        <div className="p-6 overflow-y-auto text-gray-200 text-sm space-y-5 h-[calc(100%-130px)]">
          <div dangerouslySetInnerHTML={{ __html: returnHtml }} />
        </div>

        <div className="border-t border-yellow-400/10 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-400 hover:brightness-95 rounded-md text-black font-semibold shadow-[0_0_12px_rgba(255,215,0,0.4)]"
          >
            Kapat
          </button>
        </div>
      </aside>
    </div>
  );
}

const returnHtml = `
<h3 style="color:#ffd54d;">1. Genel Bilgilendirme</h3>
<p>MAXIMORA olarak müşteri memnuniyetine büyük önem veriyoruz. Ürünlerimiz kalite ve dayanıklılık testlerinden geçmekte olup, her biri özenle paketlenmektedir. Satın alınan ürünler, sevkiyat öncesinde kalite kontrol birimimiz tarafından detaylı olarak incelenir.</p>

<h3 style="color:#ffd54d;">2. Değişim ve İnceleme Süreci</h3>
<p>Ürünlerde üretimsel veya lojistik kaynaklı bir sorun tespit edilmesi durumunda, müşteri temsilcilerimizle iletişime geçilmesi gerekmektedir. Gerekli inceleme sonucunda uygun görülen durumlarda, ürün değişimi <strong>eşdeğer veya muadil ürün</strong> ile sağlanır.</p>

<h3 style="color:#ffd54d;">3. İade Talepleri</h3>
<p>Her ne kadar müşterilerimizin memnuniyetini ön planda tutsak da, ürünlerin kişisel kullanım niteliği, sınırlı stok durumu ve hijyen koşulları sebebiyle, doğrudan iade süreci uygulanmamaktadır. Ancak belirli koşullarda değişim hakkı tanınabilir.</p>

<h3 style="color:#ffd54d;">4. Değişim Koşulları</h3>
<ul>
<li>Ürün kullanılmamış, zarar görmemiş ve tüm aksesuarlarıyla eksiksiz olmalıdır.</li>
<li>Değişim talebi, teslim tarihinden itibaren 3 iş günü içinde bildirilmelidir.</li>
<li>Değişim işlemleri yalnızca stok durumu ve ürün uygunluğu çerçevesinde yapılır.</li>
<li>İade talepleri yerine, eşdeğer ürün değişimi sağlanır.</li>
</ul>

<h3 style="color:#ffd54d;">5. Kargo ve Teslimat Süreçleri</h3>
<p>Değişim için gönderilecek ürünlerde kargo bedeli alıcıya aittir. Talep edilen değişim onaylandıktan sonra yeni ürün ücretsiz kargo ile teslim edilir.</p>

<h3 style="color:#ffd54d;">6. İletişim</h3>
<p>Değişim ve destek talepleriniz için bizimle <a href="mailto:destek@maximorashop.com" style="color:#ffd54d;">destek@maximorashop.com</a> adresinden iletişime geçebilirsiniz.</p>

<hr/>
<p style="font-size:12px; color:#aaa;">Not: Ürün iadesi, yalnızca üretimsel hata veya stok uyumsuzluğu durumlarında değerlendirilir. Değişim prosedürü, müşteri memnuniyeti esas alınarak yürütülmektedir.</p>
<p style="font-size:12px; color:#aaa;">© 2025 MAXIMORA — Tüm hakları saklıdır.</p>
`;
