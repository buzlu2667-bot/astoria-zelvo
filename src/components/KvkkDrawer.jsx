import React from "react";

export default function KvkkDrawer({ open, onClose }) {
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
          <h2 className="text-xl font-bold text-yellow-400">KVKK Aydınlatma Metni</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-yellow-300 text-2xl leading-none">✕</button>
        </div>

        <div className="p-6 overflow-y-auto text-gray-200 text-sm space-y-5 h-[calc(100%-130px)]">
          <div dangerouslySetInnerHTML={{ __html: kvkkHtml }} />
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

const kvkkHtml = `
<h3 style="color:#ffd54d;">1. Amaç ve Kapsam</h3>
<p>Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında, <strong>MAXIMORA</strong> olarak müşterilerimizin kişisel verilerini hangi amaçlarla işlediğimizi, sakladığımızı ve koruduğumuzu açıklamak amacıyla hazırlanmıştır.</p>

<h3 style="color:#ffd54d;">2. Toplanan Veriler</h3>
<ul>
<li>Ad, soyad, e-posta adresi, telefon numarası</li>
<li>Teslimat ve fatura adresi</li>
<li>Sipariş ve ödeme bilgileri</li>
<li>Canlı destek görüşme kayıtları (Tawk.to, LiveChat, Comm100)</li>
<li>Site kullanım bilgileri, çerez verileri</li>
</ul>

<h3 style="color:#ffd54d;">3. Verilerin İşlenme Amaçları</h3>
<p>Kişisel verileriniz; siparişlerin alınması, ürün teslimatı, müşteri hizmetleri desteği, kampanya bilgilendirmeleri, site güvenliğinin sağlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.</p>

<h3 style="color:#ffd54d;">4. Verilerin Saklanma Süresi</h3>
<p>Kişisel veriler, yasal zorunluluklar gereği en az 3 yıl süreyle saklanmakta, bu sürenin sonunda silinmekte veya anonim hale getirilmektedir.</p>

<h3 style="color:#ffd54d;">5. Üçüncü Taraflarla Paylaşım</h3>
<p>Verileriniz yalnızca iş ortaklarımız (ör. kargo firmaları, ödeme sistemleri, canlı destek servisleri) ile sınırlı olarak ve veri güvenliği protokollerine uygun biçimde paylaşılabilir.</p>

<h3 style="color:#ffd54d;">6. Kullanıcı Hakları</h3>
<p>KVKK’nın 11. maddesi uyarınca kullanıcılar; kişisel verilerine erişim, düzeltme, silme veya işlenmeye itiraz hakkına sahiptir. Bu haklarınızı kullanmak için <a href="mailto:destek@maximorashop.com" style="color:#ffd54d;">destek@maximorashop.com</a> adresine başvurabilirsiniz.</p>

<h3 style="color:#ffd54d;">7. Veri Güvenliği</h3>
<p>Veriler, SSL sertifikasıyla şifrelenmiş bağlantı üzerinden aktarılır ve güvenli sunucularda saklanır. Yetkisiz erişim, veri kaybı veya kötüye kullanımın önlenmesi amacıyla düzenli güvenlik testleri yapılır.</p>

<hr/>
<p style="font-size:12px; color:#aaa;">© 2025 MAXIMORA — KVKK kapsamında kişisel verileriniz güvendedir.</p>
`;
