import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { sendShopAlert } from "../utils/sendShopAlert";
import { Link } from "react-router-dom";
import { Home, ShoppingCart } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Banknote, CreditCard, Truck, Store } from "lucide-react";
const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

export default function Checkout() {
const {
  cart,

  subtotal,                 // ✅ indirimsiz ara toplam
  cartExtraDiscount,        // ✅ sepet indirimi tutarı
  cartExtraDiscountPercent, // ✅ sepet indirimi %
  total,                    // ✅ sepet indirimi sonrası toplam (kargo hariç)

  hasFreeShipping,          // ✅ ücretsiz kargo kazanıldı mı
  remainingForFreeShipping, // ✅ ücretsiz kargo için kalan

  placeOrder,
  clearCart,
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
  const [showPayment, setShowPayment] = useState(false);

  const [errors, setErrors] = useState({
  name: false,
  phone: false,
  address: false,
});



const finalAmount = Math.max(
  Number(total || 0) - Number(discount || 0),
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
cart_discount_amount: cartExtraDiscount,
total_amount: total,            // sepet indirimi sonrası (kargo hariç)
final_amount: finalAmount,      // kupon + kargo sonrası tek gerçek


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

// 🔥 KUPON KULLANIM SAYISI + PASİFLEŞTİRME
if (coupon && discount > 0) {
  const { data: c } = await supabase
    .from("coupons")
    .select("id, used_count, usage_limit")
    .eq("code", coupon)
    .single();

  if (c) {
    const newUsedCount = (c.used_count || 0) + 1;

    await supabase
      .from("coupons")
      .update({
        used_count: newUsedCount,
        is_active:
          c.usage_limit !== null
            ? newUsedCount < c.usage_limit
            : true,
      })
      .eq("id", c.id);
  }
}


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
${cartExtraDiscount > 0 ? `<b>Sepet İndirimi:</b> ₺${cartExtraDiscount}<br/>` : ""}

   

   
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
  if (!code) return toastError("❌ Kupon kodu boş!");

  const { data: c } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!c) return toastError("❌ Geçersiz kupon!");

  // 🔥 KULLANIM LİMİTİ DOLMUŞ MU?
  if (
    c.usage_limit !== null &&
    c.used_count !== null &&
    c.used_count >= c.usage_limit
  ) {
    return toastError("🚫 Bu kuponun kullanım hakkı dolmuştur.");
  }

  // 🔒 MANUEL PASİF
  if (!c.is_active) {
    return toastError("⛔ Bu kupon şu anda aktif değil.");
  }

  if (total < (c.min_amount || 0)) {
    return toastError(`🔽 Minimum sepet tutarı: ${TRY(c.min_amount)}`);
  }

  const d = c.type === "%" ? (total * c.value) / 100 : c.value;
  const finalDiscount = Math.min(d, total);

  setDiscount(finalDiscount);
  toastSuccess("🎉 Kupon başarıyla uygulandı!");
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
  if (pay === "shopier") {
  const item = cart[0];

  if (!item?.shopier_product_id) {
    return toastError("Shopier ürün bağlantısı bulunamadı.");
  }

  // önce siparişi DB’ye kaydet (awaiting_payment)
  const res = await placeOrder({
    full_name: form.name,
    phone: form.phone,
    email: form.email,
    address: form.address,
    note: form.note,
    payment_method: "shopier",
    status: "awaiting_payment",

    coupon: discount > 0 ? coupon : null,
    coupon_discount_amount: discount,
    cart_discount_amount: cartExtraDiscount,
    total_amount: total,
    final_amount: finalAmount,
  });

  if (!res?.orderId) {
    return toastError("Sipariş oluşturulamadı.");
  }

  // 🔥 SHOPIER’E GİT
window.location.href =
 window.location.href =
  `https://www.shopier.com/maximora/${item.shopier_product_id}`;



  return;
}

  if (!user) {
    toastError("🔐 Giriş yapmalısınız!");
    return setTimeout(() => nav("/login"), 1000);
  }

  // 🔥 kırmızıları yak
  const nextErrors = {
    name: !form.name?.trim(),
    phone: !form.phone?.trim(),
    address: !form.address?.trim(),
  };
  setErrors(nextErrors);

  if (nextErrors.name || nextErrors.phone || nextErrors.address) {
    return toastError("Zorunlu alanları doldurun!");
  }

  if (cart.length === 0) return toastError("Sepetiniz boş.");

  if (pay === "iban") setIbanModal(true);
  else finishOrder();
};

  return (
<div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10">

  {/* Breadcrumb */}
  <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
    <Link to="/" className="inline-flex items-center gap-1 hover:text-gray-800">
      <Home className="w-4 h-4" />
      <span>Ana Sayfa</span>
    </Link>

    <span className="text-gray-300">/</span>

    <Link to="/cart" className="hover:text-gray-800">
      Sepetim
    </Link>

    <span className="text-gray-300">/</span>

    <span className="text-gray-900 font-semibold">
      Ödeme
    </span>
  </nav>

  {/* Premium Header */}
  <div className="
    relative overflow-hidden rounded-3xl
    border border-white/10 bg-gray-900/85 backdrop-blur
    shadow-[0_18px_60px_-40px_rgba(0,0,0,0.85)]
    px-5 py-6 sm:px-7 sm:py-7
  ">
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_circle_at_15%_20%,rgba(249,115,22,0.35),transparent_60%)]" />

    <div className="relative flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-orange-300" />
        </div>

        <div>
          <div className="text-xs font-semibold tracking-wide text-gray-300">
            Güvenli Ödeme
          </div>

          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
            Siparişinizi Tamamlayın
          </h1>

          <p className="mt-1 text-sm sm:text-base text-gray-200">
            Teslimat ve ödeme bilgilerinizi girerek siparişinizi oluşturun.
          </p>
        </div>
      </div>

      <div className="hidden sm:block text-right">
        <div className="text-xs text-gray-300">Toplam</div>
        <div className="text-sm font-semibold text-white">
          {TRY(finalAmount)}
        </div>
      </div>
    </div>
  </div>
</div>

{/* 📱 MOBİL SIPARIS OZETI – HEADER ALTINDA */}
<MobileSummaryBar
  cart={cart}
  coupon={coupon}
  setCoupon={setCoupon}
  applyCoupon={applyCoupon}
  discount={discount}

  subtotal={subtotal}
  cartExtraDiscount={cartExtraDiscount}
  cartExtraDiscountPercent={cartExtraDiscountPercent}
  hasFreeShipping={hasFreeShipping}
  remainingForFreeShipping={remainingForFreeShipping}

  total={total}
  finalAmount={finalAmount}
  TRY={TRY}
  validateBeforePayment={validateBeforePayment}
/>


{/* ✅ ORTALAMA WRAPPER (PROTEINOCN GİBİ) */}
<div className="w-full">
<div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
    
    {/* FORM */}
 <div className="px-4 py-6 sm:px-8 sm:py-10 lg:px-24 lg:py-16">
      <h2 className="text-lg font-semibold mb-4 text-[#444]">
        Teslimat Bilgileri
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
       <Input
  label="Ad Soyad *"
  value={form.name}
  onChange={(v) => {
    change("name", v);
    if (errors.name && v.trim()) setErrors((e) => ({ ...e, name: false }));
  }}
  error={errors.name}
/>

       <Input
  label="Telefon *"
  value={form.phone}
  onChange={(v) => {
    change("phone", v);
    if (errors.phone && v.trim()) setErrors((e) => ({ ...e, phone: false }));
  }}
  error={errors.phone}
/>
        <Input label="E-posta" value={form.email} onChange={() => {}} disabled />

       <Input
  label="Adres *"
  value={form.address}
  onChange={(v) => {
    change("address", v);
    if (errors.address && v.trim()) setErrors((e) => ({ ...e, address: false }));
  }}
  error={errors.address}
/>
        <Textarea label="Not" value={form.note} onChange={(v) => change("note", v)} />
      </div>

    {/* 🔥 ÖDEMEYE GEÇ BUTONU – FORM BİTİŞİ */}
<button
  onClick={() => setShowPayment((s) => !s)}
  className={`
    mt-8 w-full flex items-center justify-between
    px-6 py-5 rounded-2xl font-extrabold text-lg
    transition-all duration-300
    ${
      showPayment
        ? "bg-gray-900 text-white"
        : "bg-gradient-to-r from-black to-gray-800 text-white hover:scale-[1.01]"
    }
  `}
>
  <span>💳 Ödemeye Geç</span>
 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
  <ChevronDown
    className={`
      w-5 h-5 text-white
      transition-transform duration-300
      ${showPayment ? "rotate-180" : ""}
    `}
  />
</div>

</button>

{showPayment && (
  <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-6">
    <h2 className="text-xl font-extrabold mb-6 text-gray-900">
      Ödeme Yöntemi
    </h2>

    {/* ✅ AKTİF ÖDEME YÖNTEMLERİ */}
   <div className="grid gap-4 sm:grid-cols-2">
  <PayBtn
    active={pay === "iban"}
    onClick={() => setPay("iban")}
    label="Havale / EFT"
    icon={Banknote}
  />

  <PayBtn
    active={pay === "cod"}
    onClick={() => setPay("cod")}
    label="Kapıda Ödeme"
    icon={Truck}
  />

  <PayBtn
  active={pay === "shopier"}
  onClick={() => setPay("shopier")}
  label="💳 Kredi / Banka Kartı ile Öde"
  icon={CreditCard}
/>


</div>



    {/* 🔥 TEK VE GERÇEK CTA */}
    <button
      onClick={validateBeforePayment}
      className="mt-8 w-full py-4 bg-[#f27a1a] hover:bg-[#d9680d] text-white font-extrabold rounded-2xl shadow-xl text-lg"
    >
      Siparişi Tamamla
    </button>
  </div>
)}

     
    </div>

    

    {/* ÖZET */}
    <div className="hidden lg:block w-full">
     <Summary
  cart={cart}

  subtotal={subtotal}
  cartExtraDiscount={cartExtraDiscount}
  cartExtraDiscountPercent={cartExtraDiscountPercent}
  hasFreeShipping={hasFreeShipping}
  remainingForFreeShipping={remainingForFreeShipping}

  total={total}
  coupon={coupon}
  setCoupon={setCoupon}
  discount={discount}
  finalAmount={finalAmount}
  applyCoupon={applyCoupon}
  TRY={TRY}
/>

    </div>

  </div>
</div>

      {/* IBAN MODAL */}
      {ibanModal && (
        <IbanModal close={() => setIbanModal(false)} finishOrder={finishOrder} />
      )}

   

    </div>
  );
}

/* COMPONENTS */

function MobileSummaryBar({
  cart,
  coupon,
  setCoupon,
  applyCoupon,
  discount,

  subtotal,
  cartExtraDiscount,
  cartExtraDiscountPercent,

  hasFreeShipping,
  remainingForFreeShipping,

  total,
  finalAmount,
  TRY,
  validateBeforePayment,
}) {

  const [open, setOpen] = useState(false);

  useEffect(() => {
  if (!open) return;

  let lastY = window.scrollY;

  const onScroll = () => {
    const currentY = window.scrollY;

    // aşağı doğru scroll varsa kapat
    if (currentY > lastY + 10) {
      setOpen(false);
    }

    lastY = currentY;
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, [open]);


  const itemCount = cart.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

  return (
  <div className="md:hidden w-full px-4 mb-6">

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* HEADER (Özet bar) */}
       {/* HEADER (Özet bar) - Mavi, ok'lu */}
<button
  onClick={() => setOpen((s) => !s)}
  className={`
    w-full flex items-center justify-between
    px-5 py-4 rounded-2xl
    font-extrabold text-base
    transition-all duration-300
    ${open ? "bg-[#0b4dbb] text-white" : "bg-[#0f62fe] text-white hover:brightness-95"}
  `}
>
  <div className="flex flex-col text-left leading-tight">
    <span className="flex items-center gap-2">
       Sipariş Özeti
      <span className="text-white/80 font-semibold text-sm">
        ({itemCount} ürün)
      </span>
    </span>
    <span className="text-xs text-white/80 font-medium">
      Dokun → detayları gör
    </span>
  </div>

  <div className="flex items-center gap-3">
    <span className="text-base font-extrabold">
      {TRY(finalAmount)}
    </span>

   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
  <ChevronDown
    className={`
      w-5 h-5 text-white
      transition-transform duration-300
      ${open ? "rotate-180" : ""}
    `}
  />
</div>

  </div>
</button>


        {/* BODY (açılır panel) */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            open ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-4 pb-4">
            {/* Ürün listesi */}
            <div className="max-h-[220px] overflow-auto pr-1">
              {cart.map((it) => (
                <div
                  key={it.id || it.product_id}
                  className="flex items-center justify-between py-3 border-b border-gray-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {it.title || it.name || it.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Adet: {it.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-gray-900">
                    {TRY((it.price || 0) * (it.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>

            {/* Kupon */}
            <div className="mt-4 flex gap-2">
              <input
                placeholder="Kupon Kodu"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="
                  flex-1 px-3 py-2
                  border border-gray-300
                  rounded-xl text-sm
                  text-gray-900
                  placeholder:text-gray-400
                  focus:border-[#f27a1a]
                  focus:ring-1 focus:ring-[#f27a1a]
                  outline-none
                "
              />
              <button
                onClick={applyCoupon}
                className="px-4 py-2 bg-[#f27a1a] text-white rounded-xl font-extrabold"
              >
                Uygula
              </button>
            </div>

            {/* Tutarlar */}
            <div className="mt-4 space-y-2 text-sm">
             <Row label="Ara Toplam" value={TRY(subtotal)} />

{cartExtraDiscount > 0 && (
  <Row
    label={`Sepet İndirimi (%${cartExtraDiscountPercent})`}
    value={`- ${TRY(cartExtraDiscount)}`}
    valueClass="text-green-600"
  />
)}



{discount > 0 && (
  <Row
    label="Kupon İndirimi"
    value={`- ${TRY(discount)}`}
    valueClass="text-green-600"
  />
)}

{!hasFreeShipping && (
  <p className="text-[11px] text-blue-600 mt-1">
    🚚 Ücretsiz kargo için {TRY(remainingForFreeShipping)} kaldı
  </p>
)}

{hasFreeShipping && (
  <p className="text-[11px] text-green-600 font-semibold mt-1">
    🎉 Ücretsiz kargo kazandınız
  </p>
)}


              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base font-extrabold text-gray-900">
                  Toplam
                </span>
                <span className="text-base font-extrabold text-gray-900">
                  {TRY(finalAmount)}
                </span>
              </div>

              <p className="text-[11px] text-gray-400">
                * Özet mobilde açılır/kapanır. Bilgileri kontrol edip siparişi tamamlayabilirsin.
              </p>
            </div>
            

          
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = "text-gray-900" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 font-semibold">{label}</span>
      <span className={`font-extrabold ${valueClass}`}>{value}</span>
    </div>
  );
}


function Summary({
  cart,

  subtotal,
  cartExtraDiscount,
  cartExtraDiscountPercent,

  hasFreeShipping,
  remainingForFreeShipping,

  total,
  coupon,
  setCoupon,
  discount,
  finalAmount,
  applyCoupon,
  TRY,
}) {

  const itemCount = cart.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

  return (
 <div className="h-full">
      {/* Sticky sağ panel */}
 <div className="h-full">
 <div className="sticky top-0 min-h-screen bg-gray-50 px-14 py-16 flex flex-col">


          {/* Header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-gray-900">
                Sipariş Özeti
              </h3>
              <span className="text-sm font-semibold text-gray-500">
                {itemCount} ürün
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-3">
              <p className="text-xs font-semibold text-gray-500">Ödenecek Tutar</p>
              <p className="text-2xl font-extrabold text-gray-900">
                {TRY(finalAmount)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                * Kupon / sepet indirimi uygulanınca güncellenir
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="p-5">
            <div className="max-h-[340px] overflow-auto pr-1 space-y-3">
              {cart.map((it) => (
                <div
                  key={it.id || it.product_id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:shadow-sm transition"
                >
                  {/* Görsel */}
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    <img
                      src={it.main_img || it.img_url || it.image_url || "/products/default.png"}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable="false"
                    />
                  </div>

                  {/* Başlık */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {it.title || it.name || it.product_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Adet: <span className="font-semibold">{it.quantity}</span>
                    </p>
                  </div>

                  {/* Fiyat */}
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gray-900">
                      {TRY((it.price || 0) * (it.quantity || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Kupon */}
            <div className="mt-5">
              <p className="text-sm font-bold text-gray-900 mb-2">Promosyon Kodu</p>
              <div className="flex gap-2">
                <input
                  placeholder="Kupon Kodu"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="
                    flex-1 px-3 py-2
                    border border-gray-300 rounded-xl text-sm
                    text-gray-900 placeholder:text-gray-400
                    focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a]
                    outline-none
                  "
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-[#f27a1a] text-white rounded-xl font-extrabold"
                >
                  Uygula
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-2">
             <Row label="Ara Toplam" value={TRY(subtotal)} />

{cartExtraDiscount > 0 && (
  <Row
    label={`Sepet İndirimi (%${cartExtraDiscountPercent})`}
    value={`- ${TRY(cartExtraDiscount)}`}
    valueClass="text-green-600"
  />
)}



{discount > 0 && (
  <Row
    label="Kupon İndirimi"
    value={`- ${TRY(discount)}`}
    valueClass="text-green-600"
  />
)}

{!hasFreeShipping && (
  <p className="text-[11px] text-blue-600 mt-1">
    🚚 Ücretsiz kargo için {TRY(remainingForFreeShipping)} kaldı
  </p>
)}

{hasFreeShipping && (
  <p className="text-[11px] text-green-600 font-semibold mt-1">
    🎉 Ücretsiz kargo kazandınız
  </p>
)}



              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base font-extrabold text-gray-900">
                  Toplam
                </span>
                <span className="text-base font-extrabold text-gray-900">
                  {TRY(finalAmount)}
                </span>
              </div>
            </div>

            {/* Trust */}
            <div className="mt-5 grid gap-2">
              <div className="rounded-xl border border-gray-100 p-3 text-sm text-gray-700">
                ✅ <span className="font-semibold">Değişim</span> • 🚚 Hızlı kargo
              </div>
              <div className="rounded-xl border border-gray-100 p-3 text-sm text-gray-700">
                🔒 <span className="font-semibold">Güvenli alışveriş</span> • Destek: WhatsApp
              </div>
            </div>
          </div>
        </div>
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

function Input({ label, value, onChange, disabled, error }) {
  return (
    <label className="text-sm text-[#555]">
      <span className="block mb-1">{label}</span>

      <input
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-4 py-3 border rounded-xl bg-white text-[#333] outline-none
          ${error ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a]"}
        `}
      />

      {error && (
        <span className="block mt-1 text-xs font-semibold text-red-500">
          Bu alan zorunlu
        </span>
      )}
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

function PayBtn({ active, onClick, label, icon: Icon, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-full flex items-center gap-4
        px-5 py-4 rounded-2xl border
        transition-all duration-300
        ${
          disabled
            ? "opacity-30 cursor-not-allowed bg-gray-100"
            : active
            ? "bg-[#f27a1a] border-[#f27a1a] text-white shadow-[0_0_0_3px_rgba(242,122,26,0.35)]"
            : "bg-white border-gray-300 text-gray-700 hover:border-[#f27a1a]"
        }
      `}
    >
      {/* ICON */}
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          transition
          ${
            active
              ? "bg-white/20 text-white"
              : "bg-gray-100 text-gray-700 group-hover:bg-[#f27a1a]/10"
          }
        `}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>

      {/* TEXT */}
      <div className="flex flex-col text-left">
        <span className="text-sm font-extrabold">{label}</span>
        {!disabled && (
          <span className="text-xs opacity-70">
            Güvenli ödeme
          </span>
        )}
      </div>
    </button>
  );
}

