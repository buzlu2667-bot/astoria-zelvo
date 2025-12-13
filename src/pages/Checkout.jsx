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
 const {
  cart,
  total,
  cartDiscount,      // 🔥 sepet indirimi
  placeOrder,
  clearCart
} = useCart();



  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [pay, setPay] = useState("iban");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [ibanModal, setIbanModal] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  const finalAmount = Math.max(
  Number(total || 0) -
  Number(discount || 0) -
  Number(cartDiscount || 0),
  0
);

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  

  // Kullanıcı bilgisi
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


  // Sipariş tamamlama
  const finishOrder = async () => {
    try {
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;

     
    } catch {}

const res = await placeOrder({
  full_name: form.name,
  phone: form.phone,
  email: form.email,
  address: form.address,
  note: form.note,
  payment_method: pay,
  status: pay === "cod" ? "processing" : "awaiting_payment",

  coupon: discount > 0 ? coupon : null,
  coupon_discount_amount: discount,
  cart_discount_amount: cartDiscount,

  total_amount: total,
  final_amount: finalAmount, // 🔥 TEK GERÇEK
});


    if (res?.orderId) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            text: "🎉 Siparişiniz alındı! Yönlendiriliyorsunuz...",
          },
        })
      );

 const { data: order } = await supabase
  .from("orders")
  .select("final_amount, coupon, coupon_discount_amount, cart_discount_amount")
  .eq("id", res.orderId)
  .single();

await sendShopAlert(`
📦 Yeni Sipariş
Ad: ${form.name}
Telefon: ${form.phone}
Ödenen Tutar: ${order.final_amount} TL
Kupon: ${order.coupon || "-"}
Kupon İndirimi: ${order.coupon_discount_amount || 0} TL
Sepet İndirimi: ${order.cart_discount_amount || 0} TL
Ödeme: ${pay}
`);



      setTimeout(() => nav("/orders"), 500);
    }

    // Mail
    setTimeout(() => {
      sendOrderMail(form, res, total, discount, coupon, pay);
    }, 500);
  };

  async function sendOrderMail(form, res, total, discount, coupon, pay) {
  if (!res?.orderId) return;

  const orderId = res.orderId;


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
        html: `
<div style="padding:20px;font-family:Arial;background:#0d0d0d;color:white;border-radius:14px;border:1px solid #333">

  <div style="text-align:center; margin-bottom:20px;">
    <img src="https://tvsfhhxxligbqrcqtprq.supabase.co/storage/v1/object/public/notification-images/logo%20(3).png" 
         alt="MaximoraShop"
         style="width:120px; height:auto; border-radius:10px;" />
  </div>

  <h2 style="color:#facc15; text-align:center;"> Siparişiniz Alındı!</h2>

  <p>Merhaba <b>${form.name}</b>,</p>
  <p>Siparişiniz başarıyla oluşturuldu.</p>

  <div style="margin-top:15px;padding:15px;background:#111;border-radius:10px;border:1px solid #444">
    <b>Sipariş No:</b> #${orderId}<br/>
    <b>Ödeme:</b> ${pay === "iban" ? "Havale / EFT" : "Kapıda Ödeme"}<br/>
    <b>Adres:</b> ${form.address}<br/>
  <b>Ödenen Tutar:</b> ₺${finalAmount}<br/>

${coupon ? `<b>Kupon:</b> ${coupon}<br/>` : ""}
${discount > 0 ? `<b>Kupon İndirimi:</b> ₺${discount}<br/>` : ""}
${cartDiscount > 0 ? `<b>Sepet İndirimi:</b> ₺${cartDiscount}<br/>` : ""}

   

   
  </div>

  <p style="margin-top:20px;color:#bbb;text-align:center;">
    Siparişinizi <b>Siparişlerim</b> sayfasından takip edebilirsiniz.<br/>
    Güvenli ödeme, hızlı teslimat ve premium alışveriş deneyimi için buradayız.<br/>
    <b>MaximoraShop 💛</b>
  </p>

</div>
`,
      }),
    }
  );
}


  // Kupon
  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code)
      return toastError("❌ Kupon kodu boş!");

    const { data: c } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (!c) return toastError("❌ Geçersiz kupon!");
    if (!c.is_active) return toastError("⛔ Kupon pasif!");

    if (total < c.min_amount)
      return toastError(`🔽 Minimum tutar: ${TRY(c.min_amount)}`);

    const d = c.type === "%" ? (total * c.value) / 100 : c.value;
    const finalDiscount = Math.min(d, total);
    setDiscount(finalDiscount);

    toastSuccess(`🎉 Kupon uygulandı!`);
  };

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

  const validateBeforePayment = async () => {
    if (!user) {
      toastError("🔐 Giriş yapmalısınız!");
      return setTimeout(() => nav("/login"), 1000);
    }
    if (!form.name || !form.phone || !form.address)
      return toastError(" Zorunlu alanları doldurun!");

    if (cart.length === 0)
      return toastError("Sepetiniz boş.");

    if (pay === "iban") setIbanModal(true);
    else finishOrder();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 bg-white min-h-screen">
      {/* BAŞLIK */}
      <h1 className="text-3xl font-bold text-center text-[#333] mb-8">
         Siparişinizi Tamamlayın
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#444]">
            Teslimat Bilgileri
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Ad Soyad *" value={form.name} onChange={(v) => change("name", v)} />
            <Input label="Telefon *" value={form.phone} onChange={(v) => change("phone", v)} />
            <Input label="E-posta" value={form.email} onChange={() => {}} disabled />
            <Input label="Adres *" value={form.address} onChange={(v) => change("address", v)} />
            <Textarea label="Not" value={form.note} onChange={(v) => change("note", v)} />
          </div>

          {/* ÖDEME */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-[#444]">Ödeme Yöntemi</h3>

            <div className="grid sm:grid-cols-3 gap-3">
              <PayBtn disabled label="💳 Kredi Kartı (yakında)" />
              <PayBtn active={pay === "iban"} onClick={() => setPay("iban")} label="🏦 Havale / EFT" />
              <PayBtn active={pay === "cod"} onClick={() => setPay("cod")} label="🚚 Kapıda Ödeme" />
            </div>
          </div>

          {/* BUTON */}
          <button
            onClick={validateBeforePayment}
            className="mt-6 w-full py-4 bg-[#f27a1a] hover:bg-[#d9680d] text-white font-bold rounded-xl transition shadow-md"
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
  cartDiscount={cartDiscount}
  finalAmount={finalAmount}   // 🔥 EKLE
  applyCoupon={applyCoupon}
  TRY={TRY}
/>


      </div>

      {/* IBAN MODAL */}
      {ibanModal && (
        <IbanModal close={() => setIbanModal(false)} finishOrder={finishOrder} />
      )}

      {/* MOBİL ALT BAR */}
   <MobileSummaryBar
  coupon={coupon}
  setCoupon={setCoupon}
  applyCoupon={applyCoupon}
  discount={discount}
  cartDiscount={cartDiscount}
  total={total}
  finalAmount={finalAmount}   // 🔥 EKLE
  TRY={TRY}
  validateBeforePayment={validateBeforePayment}
/>

    </div>
  );
}

/* COMPONENTS */

function MobileSummaryBar({ coupon, setCoupon, applyCoupon, discount, cartDiscount, total, finalAmount, TRY, validateBeforePayment }) {


  return (
    <div className="md:hidden fixed bottom-[70px] left-0 right-0 z-[999] px-4">
      <div className="bg-white border border-gray-300 rounded-xl shadow-md p-4">
        
        <div className="flex gap-2 mb-3">
         <input
  placeholder="Kupon Kodu"
  value={coupon}
  onChange={(e) => setCoupon(e.target.value)}
  className="
    flex-1 px-3 py-2 
    border border-gray-300 
    rounded-lg text-sm
    text-[#333]
    placeholder:text-gray-400
    focus:border-[#f27a1a]
    focus:ring-1 focus:ring-[#f27a1a]
  "
/>

          <button
            onClick={applyCoupon}
            className="px-4 py-2 bg-[#f27a1a] text-white rounded-lg font-bold"
          >
            Uygula
          </button>
        </div>

        <div className="flex justify-between font-bold text-[#333]">
          <span>Genel Toplam</span>
      <span>{TRY(finalAmount)}</span>
        </div>

        <button
          onClick={validateBeforePayment}
          className="mt-4 w-full py-3 bg-[#f27a1a] text-white rounded-xl font-bold"
        >
          Siparişi Tamamla
        </button>
      </div>
    </div>
  );
}

function Summary({ cart, total, coupon, setCoupon, discount, cartDiscount, finalAmount, applyCoupon, TRY }) {


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-fit hidden md:block">
      <h3 className="text-lg font-bold mb-3 text-[#444]">Sipariş Özeti</h3>

     <div className="space-y-2">
  {cart.map((it) => (
    <div
      key={it.id}
      className="flex justify-between items-center text-sm py-3 
                 border-b border-gray-300 text-gray-800 font-medium"
    >
      <span className="text-gray-800">
        {it.title || it.name || it.product_name} × {it.quantity}
      </span>

      <span className="text-gray-900 font-semibold">
        {TRY((it.price || 0) * (it.quantity || 1))}
      </span>
    </div>
  ))}
</div>

      <div className="mt-4 flex justify-between text-sm font-semibold text-[#333]">
        <span>Toplam</span> <span>{TRY(total)}</span>
      </div>

      {/* Kupon */}
      <div className="mt-3 flex gap-2">
       <input
  placeholder="Kupon Kodu"
  value={coupon}
  onChange={(e) => setCoupon(e.target.value)}
  className="
    flex-1 px-3 py-2 
    border border-gray-300 
    rounded-lg text-sm
    text-[#333]
    placeholder:text-gray-400
    focus:border-[#f27a1a]
    focus:ring-1 focus:ring-[#f27a1a]
  "
/>

        <button
          onClick={applyCoupon}
          className="px-4 py-2 bg-[#f27a1a] text-white rounded-lg font-bold"
        >
          Uygula
        </button>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600 mt-2">
          <span>İndirim</span>
          <span>-{TRY(discount)}</span>
        </div>
      )}

      <div className="mt-2 pt-3 border-t border-gray-200 flex justify-between font-bold text-[#222] text-lg">
        <span>GENEL TOPLAM</span>
    <span>{TRY(finalAmount)}</span>
      </div>
    </div>
  );
}

function IbanModal({ close, finishOrder }) {
  return (
    <div onClick={close} className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-[9999]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] text-white w-full max-w-md p-6 rounded-xl shadow-xl border border-gray-700"
      >
        <h2 className="text-xl font-bold text-center mb-4">🏦 Havale / EFT Bilgileri</h2>

        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
          <p><b>Hesap Sahibi:</b> Burak AGARAK</p>
          <p className="mt-2">
            <b>IBAN:</b>
            <span
              onClick={() => {
                navigator.clipboard.writeText("TR66 0015 7000 0000 0095 7755 66");
                window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", text: "IBAN kopyalandı!" } }));
              }}
              className="block bg-black text-white font-mono text-center py-2 px-3 rounded-lg border border-gray-600 mt-2 cursor-pointer"
            >
              TR66 0015 7000 0000 0095 7755 66
            </span>
          </p>
        </div>

        <button
          onClick={finishOrder}
          className="mt-4 w-full py-3 bg-[#f27a1a] text-black rounded-lg font-bold"
        >
          Ödemeyi Tamamladım
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, disabled }) {
  return (
    <label className="text-sm text-[#555]">
      <span className="block mb-1">{label}</span>
      <input
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-[#333] focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="text-sm text-[#555]">
      <span className="block mb-1">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-[#333] focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none"
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
            ? "bg-[#f27a1a] text-white border-[#e1680d]"
            : "bg-white text-[#444] border-gray-300 hover:border-[#f27a1a]"
        }
      `}
    >
      {label}
    </button>
  );
}
