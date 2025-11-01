import React from "react";

export default function PrivacyDrawer({ open, onClose }) {
  return (
    <div className={`fixed inset-0 z-[9999] transition-all ${open ? "visible" : "invisible"}`}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Drawer / Modal */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[680px] bg-[#070707]/95 backdrop-blur-2xl border-l border-yellow-400/20 shadow-[0_0_45px_rgba(255,215,0,0.15)] transform transition-transform duration-300 rounded-l-2xl
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-yellow-400/10">
          <h2 className="text-xl font-bold text-yellow-400">Gizlilik Politikası</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-yellow-300 text-2xl leading-none">✕</button>
        </div>

        <div className="p-6 overflow-y-auto text-gray-200 text-sm space-y-5 h-[calc(100%-130px)]">
          <div dangerouslySetInnerHTML={{ __html: privacyHtml }} />
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

const privacyHtml = `
<h3 style="color:#ffd54d;">1. Genel Bilgiler</h3>
<p>Bu Gizlilik Politikası, <strong>ASTORIA ZELVO</strong> (“biz”, “şirket”, “site”) tarafından işletilen e-ticaret platformu üzerinden toplanan ve işlenen kişisel verilerin korunması ve gizliliğine dair ilkeleri açıklar. Tüm işlemler <strong>6698 sayılı KVKK</strong> ve ilgili mevzuata uygun şekilde yürütülür.</p>

<h3 style="color:#ffd54d;">2. Toplanan Veriler</h3>
<ul>
<li>Hesap bilgileri (ad, e-posta, telefon, adres)</li>
<li>Sipariş, fatura ve teslimat bilgileri</li>
<li>Canlı destek mesaj kayıtları (Tawk.to veya LiveChat üzerinden)</li>
<li>IP adresi, tarayıcı bilgisi, cihaz verileri</li>
<li>Çerez (cookie) verileri — site işlevselliği, güvenlik ve analiz için</li>
</ul>

<h3 style="color:#ffd54d;">3. Canlı Destek Servisleri (Tawk.to ve LiveChat)</h3>
<p>ASTORIA ZELVO, ziyaretçilerine anlık destek sağlamak amacıyla üçüncü taraf canlı destek servislerinden yararlanabilir:</p>

<ul>
<li><strong>Tawk.to:</strong> ABD merkezli bir canlı destek sağlayıcısıdır. Sohbet sırasında paylaştığınız bilgiler (isim, e-posta, mesaj içeriği) Tawk.to sunucularında şifreli olarak saklanabilir. Tawk.to, <a href="https://www.tawk.to/privacy-policy" target="_blank" rel="noopener noreferrer" style="color:#ffd54d;">gizlilik politikası</a> kapsamında GDPR ve veri güvenliği standartlarına uygundur.</li>

<li><strong>LiveChat:</strong> Avrupa Birliği merkezli altyapı sunar. Kullanıcı verilerini Avrupa Ekonomik Alanı içinde işleyebilir. LiveChat, <a href="https://www.livechat.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer" style="color:#ffd54d;">GDPR uyumlu gizlilik politikası</a> ile hizmet verir.</li>
</ul>

<p>Canlı sohbet özelliğini kullanarak, mesaj gönderdiğinizde kişisel verilerinizin müşteri desteği amacıyla işlenmesini kabul etmiş olursunuz.</p>

<h3 style="color:#ffd54d;">4. Verilerin Kullanım Amaçları</h3>
<p>Kişisel verileriniz; siparişlerin işlenmesi, teslimatın sağlanması, müşteri desteği, canlı chat hizmeti, yasal yükümlülüklerin yerine getirilmesi ve kullanıcı deneyimini geliştirmek için kullanılır.</p>

<h3 style="color:#ffd54d;">5. Verilerin Saklanması ve Aktarımı</h3>
<p>Veriler, KVKK’ya uygun olarak güvenli sunucularda saklanır. Bazı veriler (ör. canlı chat verileri) yurt dışındaki servis sağlayıcı sunucularına aktarılabilir. Bu aktarım, kullanıcı bilgilendirilmesi ve açık rıza temelinde yapılır.</p>

<h3 style="color:#ffd54d;">6. Çerezler (Cookies)</h3>
<p>Sitemiz, oturum yönetimi, sepet bilgisi, tercihlerin hatırlanması ve performans analizi için çerezler kullanır. Tarayıcınızın ayarlarından çerezleri devre dışı bırakabilirsiniz, ancak bazı site özellikleri düzgün çalışmayabilir.</p>

<h3 style="color:#ffd54d;">7. Kullanıcı Hakları</h3>
<p>Kullanıcılar KVKK kapsamında; verilerine erişim, düzeltilme, silinme, işlemeye itiraz ve veri aktarımı haklarına sahiptir. Bu haklarınızı kullanmak için <a href="mailto:info@astoriazelvo.example" style="color:#ffd54d;">info@astoriazelvo.example</a> adresine başvurabilirsiniz.</p>

<h3 style="color:#ffd54d;">8. Güvenlik</h3>
<p>Veri güvenliği için SSL şifreleme, erişim kontrolü, düzenli sunucu güvenlik testleri ve şifreli veri saklama yöntemleri uygulanır.</p>

<h3 style="color:#ffd54d;">9. Değişiklikler</h3>
<p>Bu gizlilik politikası zaman zaman güncellenebilir. Güncellemeler, site üzerinden duyurulur ve en son sürüm her zaman bu sayfada yayınlanır.</p>

<hr/>
<p style="font-size:12px; color:#aaa;">© 2025 ASTORIA ZELVO — Tüm hakları saklıdır.</p>
`;
