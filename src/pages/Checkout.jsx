import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { sendShopAlert } from "../utils/sendShopAlert";


const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

 

export default function Checkout() {
  const { cart, total, placeOrder, clearCart } = useCart();
  const nav = useNavigate();


  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [pay, setPay] = useState("iban");

  // Kupon sistemi
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const toastSuccess = (text) =>
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: { type: "success", text },
    })
  );

const toastError = (text) =>
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: { type: "danger", text },
    })
  );


  const [ibanModal, setIbanModal] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Kullanıcıyı çek
  useEffect(() => {
    (async () => {
      const { data: ud } = await supabase.auth.getUser();
      const u = ud?.user;
      if (u) {
        setUser(u);
        setForm((f) => ({ ...f, email: u.email }));
      }
    })();
  }, []);

  // ⭐ SİPARİŞİ TAMAMLAMA
  const finishOrder = async () => {
    // Profil kaydet
    try {
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;

      if (user) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: form.name,
            phone: form.phone,
            address: form.address,
            role: "user",
          },
          { onConflict: "id" }
        );
      }
    } catch (err) {
  
    }

    // Sipariş oluştur
   const res = await placeOrder({
  full_name: form.name,
  phone: form.phone,
  email: form.email,
  address: form.address,
  note: form.note,
  payment_method: pay,

  // ⭐ ÖDEME YÖNTEMİNE GÖRE DURUMU AYARLA
  status: pay === "cod" ? "processing" : "awaiting_payment",

  coupon: discount > 0 ? coupon : null,
  discount_amount: discount,
  final_amount: total - discount,
});



if (res?.orderId) {
  await sendShopAlert(`
📦 <b>Yeni Sipariş!</b>

🧾 Sipariş No: #${res.orderId}
👤 Kullanıcı: ${form.name}
📱 Telefon: ${form.phone}
✉️ Email: ${form.email}
📍 Adres: ${form.address}

${form.note ? "📝 Not: " + form.note : ""}

${discount > 0 ? `🏷️ Kupon: ${coupon} (-${discount} TL)` : ""}

💳 Ödeme: ${pay === "iban" ? "Havale / EFT" : "Kapıda Ödeme"}
💰 Tutar: ${total - discount} TL

⏰ ${new Date().toLocaleString("tr-TR")}
  `);
}



    // Puan Güncelle
    try {
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;
      if (user) {
        await supabase.rpc("update_user_points", {
          user_id: user.id,
          order_total: total - discount,
        });
      }
    } catch (err) {
      console.error("Puan güncelleme hatası:", err);
    }

    // Kupon kullanım arttır
    if (discount > 0 && coupon) {
      await supabase.rpc("increment_coupon", {
        code_input: coupon,
      });
    }

 if (res?.orderId) {
  
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "success",
        text: "🎉 Siparişiniz alındı! Siparişlerim sayfasına yönlendiriliyorsunuz..."
      },
    })
  );

  // 0.5 saniye gecikme → toast görünsün
  setTimeout(() => {
    nav("/orders");
  }, 500);
}


// ⭐ Maili arka planda gönder
setTimeout(() => {
  sendOrderMail(form, res, total, discount, coupon, pay);
}, 500);
    
  };

  // Kupon uygula
 const applyCoupon = async () => {
  const code = coupon.trim().toUpperCase();
  if (!code) return toastError("❌ Kupon kodu boş!");

  const { data: c, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error || !c) return toastError("❌ Geçersiz kupon!");

  if (!c.is_active) return toastError("⛔ Kupon pasif!");
  if (c.used_count >= c.usage_limit) return toastError("🚫 Kupon kullanım limiti dolmuş!");
 // ⭐ TR saatine göre karşılaştırma (UTC+3)
if (c.expires_at) {
  const now = new Date();

  // Supabase UTC tarih → TR'ye çevir
  const expireUTC = new Date(c.expires_at);
  const expireTR = new Date(expireUTC.getTime() + 3 * 60 * 60 * 1000);

  if (expireTR < now) {
    return toastError("⏳ Kupon süresi dolmuş!");
  }
}


  if (total < c.min_amount)
    return toastError(`🔽 Minimum sepet tutarı: ${TRY(c.min_amount)}`);

  // İndirim hesapla
  const d = c.type === "%" ? (total * c.value) / 100 : c.value;
  const finalDiscount = Math.min(d, total);
  setDiscount(finalDiscount);

  toastSuccess(`🎉 Kupon uygulandı! -${TRY(finalDiscount)}`);
};

  const toast = (text) =>
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "danger", text },
      })
    );

  // ⭐ Ön kontrol
  const validateBeforePayment = async () => {
  if (!user) {
  setMsg("Giriş yapmalısınız!");

  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "danger",
        text: "🔒 Lütfen önce giriş yapın!",
      },
    })
  );

  setTimeout(() => nav("/login"), 1500);
  return;
}


   if (!form.name || !form.phone || !form.address) {
  setMsg("Lütfen zorunlu alanları doldurun.");

  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "danger",
        text: " Lütfen zorunlu alanları doldurun!",
      },
    })
  );

  return;
}


    if (cart.length === 0) {
      setMsg("Sepetiniz boş.");
      return;
    }

    if (pay === "iban") {
      setIbanModal(true);
    } else {
      finishOrder();
    }
  };
async function sendOrderMail(form, res, total, discount, coupon, pay) {
  try {
    const orderId = res?.orderId || res?.data?.id;
    if (!orderId) return;

    // ⭐ GÖNDERECEĞİMİZ PREMIUM HTML TEMPLATE
   const html = `
<div style="padding:20px;font-family:Arial;background:#0d0d0d;color:white;border-radius:14px;border:1px solid #333">

  <!-- LOGO -->
  <div style="text-align:center; margin-bottom:20px;">
    <img src="https://tvsfhhxxligbqrcqtprq.supabase.co/storage/v1/object/public/notification-images/logo%20(3).png"
         alt="MaximoraShop"
         style="width:130px; height:auto; border-radius:12px;" />
  </div>

  <h2 style="color:#facc15; text-align:center;">🛍️ Siparişiniz Alındı!</h2>

  <p>Merhaba <b>${form.name}</b>, siparişiniz başarıyla oluşturuldu.</p>

  <div style="margin-top:15px;padding:15px;background:#111;border-radius:10px;border:1px solid #444">
    <b>Sipariş No:</b> #${orderId}<br/>
    <b>Ödeme:</b> ${pay === "iban" ? "Havale / EFT" : "Kapıda Ödeme"}<br/>
    <b>Adres:</b> ${form.address}<br/>
    <b>Toplam:</b> ${total}₺<br/><br/>

    ${discount > 0 ? `
      <b>Kupon:</b> ${coupon}<br/>
      <b>İndirim:</b> -${discount}₺<br/>
      <b>Ödenecek Tutar:</b> ${total - discount}₺<br/>
    ` : ""}
  </div>

  <p style="margin-top:20px;color:#bbb; text-align:center;">
    Siparişinizi <b>Siparişlerim</b> sayfasından takip edebilirsiniz.<br/>
    <b>MaximoraShop 💛</b>
  </p>

</div>
`;


    await fetch(
      "https://tvsfhhxxligbqrcqtprq.supabase.co/functions/v1/send-mail",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: form.email,
          subject: "Siparişiniz Alındı ✔",
          html, // ⭐ HTML ŞABLONU BURADA GİDİYOR
        }),
      }
    );
  } catch (err) {
    console.error("Mail gönderimi hatası:", err);
  }
}



  return (
    <div className="max-w-6xl mx-auto px-6 py-8 text-white">
     <h1
  className="
    text-3xl font-extrabold mb-8 text-center 
    bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 
    bg-clip-text text-transparent
    drop-shadow-[0_0_15px_rgba(250,204,21,0.45)]
    animate-pulse
  "
>
  🛍️ Siparişinizi Tamamlayın
</h1>


      <div className="grid md:grid-cols-3 gap-6">
        {/* FORM */}
      <div className="md:col-span-2 maxi-card">

          <h2 className="text-lg font-semibold mb-4 text-yellow-400">
            Teslimat Bilgileri
          </h2>

          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Ad Soyad *" value={form.name} onChange={(v) => change("name", v)} />
            <Input label="Telefon *" value={form.phone} onChange={(v) => change("phone", v)} />

            <Input
              label="E-posta (hesap)"
              value={form.email}
              onChange={() => {}}
              className="opacity-60 cursor-not-allowed"
            />

            <Input label="Adres *" value={form.address} onChange={(v) => change("address", v)} />
            <Textarea label="Not (opsiyonel)" value={form.note} onChange={(v) => change("note", v)} />
          </div>

          {/* ÖDEME */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-yellow-400">Ödeme Yöntemi</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <PayBtn disabled label="💳 Kredi Kartı (yakında)" />
              <PayBtn active={pay === "iban"} onClick={() => setPay("iban")} label="🏦 Havale / EFT" />
              <PayBtn active={pay === "cod"} onClick={() => setPay("cod")} label="🚚 Kapıda Ödeme" />
            </div>
          </div>

          {msg && <p className="mt-4 text-red-400 text-sm text-center">{msg}</p>}

        <button
  onClick={validateBeforePayment}
  className="
    mt-6 w-full 
    py-4 
    rounded-xl 
    font-extrabold 
    text-white 
    bg-[#0f0017]
    border border-purple-800
    shadow-[0_0_25px_rgba(120,0,150,0.4)]
    hover:bg-[#1a0028]
    hover:shadow-[0_0_35px_rgba(140,0,180,0.5)]
    transition
  "
>
  Siparişi Tamamla
</button>

        </div>

        {/* ÖZET */}
        <Summary
          cart={cart}
          total={total}
          coupon={coupon}
          setCoupon={setCoupon}
          discount={discount}
          applyCoupon={applyCoupon}
          TRY={TRY}
        />
      </div>

      {/* IBAN MODAL */}
      {ibanModal && (
        <IbanModal
          close={() => setIbanModal(false)}
          finishOrder={finishOrder}
        />
      )}

    {/* MOBİL SABİT ALT BAR — DOĞRU YER */}
      <MobileSummaryBar
        coupon={coupon}
        setCoupon={setCoupon}
        applyCoupon={applyCoupon}
        discount={discount}
        total={total}
        TRY={TRY}
        validateBeforePayment={validateBeforePayment}
      />

  </div>
);
}
function MobileSummaryBar({
  coupon,
  setCoupon,
  applyCoupon,
  discount,
  total,
  TRY,
  validateBeforePayment,
}) {
  return (
    <div className="md:hidden fixed bottom-[70px] left-0 right-0 z-[9999] px-4">
      <div className="bg-[#0d0d0d]/95 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(250,204,21,0.25)]">

        {/* Kupon Alanı */}
        <div className="flex gap-2 mb-3">
          <input
            placeholder="Kupon Kodu"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="flex-1 px-3 py-2 bg-black/40 border border-yellow-400/30 rounded-xl text-sm text-white focus:border-yellow-400"
          />
      <button
  onClick={applyCoupon}
  className="
    px-4 py-3 rounded-xl font-bold text-white
    bg-[#0f0017] border border-purple-700
    hover:bg-[#1a0028]
    shadow-[0_0_12px_rgba(120,0,150,0.3)]
    transition
  "
>
  Uygula
</button>

        </div>

        {/* Genel Toplam */}
        <div className="flex justify-between text-green-400 font-extrabold text-base">
          <span>Genel Toplam</span>
          <span>{TRY(total - discount)}</span>
        </div>

        {/* Buton */}
        <button
          onClick={validateBeforePayment}
          className="
    mt-6 w-full 
    py-4 
    rounded-xl 
    font-extrabold 
    text-white 
    bg-[#0f0017]
    border border-purple-800
    shadow-[0_0_25px_rgba(120,0,150,0.4)]
    hover:bg-[#1a0028]
    hover:shadow-[0_0_35px_rgba(140,0,180,0.5)]
    transition
  "
>
  Siparişi Tamamla
        </button>

      </div>
    </div>
  );
}

/* ======== Components ======== */

function Summary({ cart, total, coupon, setCoupon, discount, applyCoupon, TRY }) {
  return (
   <div className="maxi-card h-fit hidden md:block">

<h3 className="text-lg font-bold mb-4 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">
   Sipariş Özeti
</h3>


      <div className="space-y-2">
        {cart.map((it) => (
        <div key={it.id} 
  className="flex justify-between text-sm py-2 border-b border-neutral-700/40"
>

            <span>{it.name} × {it.quantity}</span>
            <span>{TRY((it.price || 0) * (it.quantity || 1))}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-3 flex justify-between font-bold text-yellow-300">
        <span>Toplam</span>
        <span>{TRY(total)}</span>
      </div>

      {/* Kupon */}
      <div className="mt-3 flex gap-2">
        <input
          placeholder="Kupon Kodu"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
         className="
    flex-1 px-4 py-3 
    bg-black/40 
    border border-yellow-500/30 
    rounded-xl 
    text-sm
    focus:border-yellow-400 
    focus:shadow-[0_0_10px_rgba(250,204,21,0.4)]
    outline-none
  "
/>
    <button
  onClick={applyCoupon}
  className="
    px-4 py-3 rounded-xl font-bold text-white
    bg-[#0f0017] border border-purple-700
    hover:bg-[#1a0028]
    shadow-[0_0_12px_rgba(120,0,150,0.3)]
    transition
  "
>
  Uygula
</button>

      </div>

      {discount > 0 && (
        <div className="flex justify-between text-sm text-emerald-400 mt-2">
          <span>İndirim</span>
          <span>-{TRY(discount)}</span>
        </div>
      )}

      <div className="mt-2 border-t pt-3 flex justify-between font-bold text-green-400 text-lg">
        <span>GENEL TOPLAM</span>
        <span>{TRY(total - discount)}</span>
      </div>
    </div>
  );
}

function IbanModal({ close, finishOrder }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center p-4 z-[99999]"
      onClick={close}
    >
    <div
 className="relative maxi-card w-full max-w-md p-7 border border-yellow-500/30 shadow-[0_0_35px_rgba(250,204,21,0.35)]"

>

        <button
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="absolute top-3 right-3 text-2xl hover:text-red-500"
        >
          ✕
        </button>

       <h2 className="
  text-2xl font-extrabold text-center 
  text-purple-300 
  drop-shadow-[0_0_10px_rgba(120,0,150,0.6)]
  mb-4
">
  🏦 Havale / EFT
</h2>


        <div className="bg-neutral-800/60 rounded-lg p-4 border border-yellow-600/30">
          <p className="text-gray-300">
            <b>Hesap Sahibi:</b> Burak AGARAK
          </p>

      


          <p className="mt-1 text-gray-300">
            <b>IBAN:</b>
            <span
         className="
  bg-[#0f0017] 
  text-purple-300 
  px-4 py-3 
  mt-2 
  block 
  text-center 
  rounded-xl 
  tracking-wide 
  font-mono 
  cursor-pointer 
  border border-purple-700 
  shadow-[0_0_20px_rgba(120,0,150,0.35)]
  hover:bg-[#1a0028]
  hover:shadow-[0_0_30px_rgba(140,0,180,0.55)]
  transition
"


              onClick={() => {
                navigator.clipboard.writeText("TR66 0015 7000 0000 0095 7755 66");
                window.dispatchEvent(
                  new CustomEvent("toast", {
                    detail: { type: "success", text: " IBAN kopyalandı!" },
                  })
                );
              }}
            >
              TR66 0015 7000 0000 0095 7755 66
            </span>
          </p>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Açıklamaya sipariş numarasını yazmayı unutma 💛
        </p>

        <button
          onClick={finishOrder}
          className="
  bg-[#0f0017] 
  text-purple-300 
  px-4 py-3 
  mt-2 
  block 
  text-center 
  rounded-xl 
  tracking-wide 
  font-mono 
  cursor-pointer 
  border border-purple-700 
  shadow-[0_0_20px_rgba(120,0,150,0.35)]
  hover:bg-[#1a0028]
  hover:shadow-[0_0_30px_rgba(140,0,180,0.55)]
  transition
"
        >
          ✅ Ödemeyi Tamamladım
        </button>

       </div>
       
 </div>

 
  );
}

/* Input components */
function Input({ label, value, onChange, className = "" }) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="block mb-1 text-gray-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
    className="
  w-full px-4 py-3 
  bg-[#111]/70 
  border border-neutral-700 
  rounded-xl 
  text-white
  shadow-inner 
  focus:border-yellow-400 
  focus:shadow-[0_0_10px_rgba(250,204,21,0.2)]
  outline-none transition
"



      />
    </label>
  );
}

function Textarea({ label, value, onChange, className = "" }) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="block mb-1 text-gray-300">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
     className="
  w-full px-4 py-3 
  bg-[#111]/70 
  border border-neutral-700 
  rounded-xl 
  text-white
  shadow-inner 
  focus:border-yellow-400 
  focus:shadow-[0_0_10px_rgba(250,204,21,0.2)]
  outline-none transition
"



      />
    </label>
  );
}

function PayBtn({ active, onClick, label, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-4 py-4 rounded-xl font-semibold border transition
        ${disabled ? "opacity-30 cursor-not-allowed" : ""}

        ${
          active
            ? "bg-[#0f0017] text-purple-300 border-purple-700 shadow-[0_0_18px_rgba(120,0,150,0.4)]"
            : "bg-[#140014] text-gray-300 border-neutral-700 hover:border-purple-600 hover:shadow-[0_0_15px_rgba(120,0,150,0.3)]"
        }
      `}
    >
      {label}
    </button>
  );
}
