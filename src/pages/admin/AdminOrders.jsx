import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const STATUS = {
  awaiting_payment: "Bekleyen Ödeme",
  processing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};




 
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState({});

    // ❌ İPTAL MODALI
  const [cancelModal, setCancelModal] = useState(null); 
  // { orderId, email, full_name }

  const [cancelReason, setCancelReason] = useState("");


  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchOrders() {
    const { data: od } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    setOrders(od || []);

    if (od?.length) {
     const { data: its } = await supabase
  .from("order_items")
  .select("id, order_id, product_name, quantity, unit_price, color, image_url")
  .in("order_id", od.map(o => o.id));

      const grouped = {};
      (its || []).forEach(it => {
        (grouped[it.order_id] ||= []).push(it);
      });
      setItems(grouped);
    }
  }

  const TRY = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

  const toast = (text) =>
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text },
      })
    );

 async function approve(orderId) {
  // Siparişi processing yap
  await supabase
    .from("orders")
    .update({ status: "processing" })
    .eq("id", orderId);

  // Siparişi getir
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  // Mail gönder
  if (order) {
   await fetch(
  "https://tvsfhhxxligbqrcqtprq.supabase.co/functions/v1/send-mail",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      to: order.email,
      subject: "Siparişiniz Onaylandı ✔",
      html: `
<div style="padding:20px;font-family:Arial;background:#0d0d0d;color:white;border-radius:14px;border:1px solid #333">

  <div style="text-align:center; margin-bottom:20px;">
    <img src="https://tvsfhhxxligbqrcqtprq.supabase.co/storage/v1/object/public/notification-images/logo%20(3).png" 
         alt="MaximoraShop"
         style="width:120px; height:auto; border-radius:10px;" />
  </div>

  <h2 style="color:#facc15; text-align:center;">🎉 Siparişiniz Onaylandı!</h2>

  <p>Merhaba <b>${order.full_name}</b>,</p>
  <p>Havale / EFT ödemeniz onaylanmıştır. Siparişiniz hazırlanıyor.</p>

  <div style="margin-top:15px;padding:15px;background:#111;border-radius:10px;border:1px solid #444">
    <b>Sipariş No:</b> #${order.id}<br/>
    <b>Tutar:</b> ₺${order.final_amount}<br/>
    <b>Adres:</b> ${order.address}<br/>
    ${
      order.coupon
        ? `<b>Kupon:</b> ${order.coupon}<br/>${order.coupon_discount_amount > 0 ? `
<b>Kupon:</b> ${order.coupon}<br/>
<b>Kupon İndirimi:</b> ₺${order.coupon_discount_amount}<br/>
` : ""}

${order.cart_discount_amount > 0 ? `
<b>Sepet İndirimi:</b> ₺${order.cart_discount_amount}<br/>
` : ""}
<br/>`
        : ""
    }
  </div>

  <p style="margin-top:20px;color:#bbb;text-align:center;">
   Bizi tercih ettiğiniz için teşekkür ederiz
Siparişiniz özenle hazırlanıyor. Güvenli ödeme, hızlı teslimat ve premium alışveriş deneyimi için buradayız..<br/>
    <b>MaximoraShop 💛</b>
  </p>
</div>
`,
    }),
  }
);

  }

  toast("✅ Ödeme Onaylandı! Müşteriye mail gönderildi.");
  fetchOrders();
}


  async function updateStatus(orderId, status) {


    await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    toast("🔄 Sipariş Güncellendi");
    fetchOrders();
  }

    async function confirmCancel() {
    if (!cancelReason.trim()) {
      alert("İptal sebebi yazman lazım");
      return;
    }

    const { orderId, email, full_name } = cancelModal;

    // 1️⃣ Siparişi iptal et + sebebi kaydet
    await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancel_reason: cancelReason,
      })
      .eq("id", orderId);

    // 2️⃣ Müşteriye mail
    await fetch(
      "https://tvsfhhxxligbqrcqtprq.supabase.co/functions/v1/send-mail",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: email,
          subject: "Siparişiniz İptal Edildi",
         html: `
<div style="
  padding:24px;
  font-family:Arial, Helvetica, sans-serif;
  background:#0d0d0d;
  color:white;
  border-radius:16px;
  border:1px solid #333;
">

  <!-- LOGO -->
  <div style="text-align:center; margin-bottom:22px;">
    <img
      src="https://tvsfhhxxligbqrcqtprq.supabase.co/storage/v1/object/public/notification-images/logo%20(3).png"
      alt="MaximoraShop"
      style="width:120px; height:auto; border-radius:12px;"
    />
  </div>

  <!-- TITLE -->
  <h2 style="color:#ef4444; text-align:center; margin-bottom:12px;">
    ❌ Siparişiniz İptal Edildi
  </h2>

  <!-- TEXT -->
  <p style="font-size:14px; line-height:1.6;">
    Merhaba <b>${full_name}</b>,
  </p>

  <p style="font-size:14px; line-height:1.6;">
    Oluşturmuş olduğunuz sipariş, aşağıda belirtilen sebepten dolayı
    <b>iptal edilmiştir</b>.
  </p>

  <!-- REASON BOX -->
  <div style="
    margin-top:16px;
    padding:14px;
    background:#1a1a1a;
    border-radius:12px;
    border:1px solid #444;
  ">
    <p style="margin:0; font-size:13px; color:#fca5a5;">
      <b>İptal Sebebi:</b>
    </p>
    <p style="margin-top:6px; font-size:14px; color:#fff;">
      ${cancelReason}
    </p>
  </div>

  <!-- INFO -->
  <p style="margin-top:18px; font-size:13px; color:#bbb;">
    Eğer ödemeniz alınmışsa, ücret iadesi en kısa sürede tarafınıza
    gerçekleştirilecektir.
  </p>

  <p style="margin-top:10px; font-size:13px; color:#bbb;">
    Siparişlerinizi ve durumlarını <b>Siparişlerim</b> sayfasından
    takip edebilirsiniz.
  </p>

  <!-- FOOTER -->
  <p style="margin-top:22px; text-align:center; font-size:13px; color:#aaa;">
    Anlayışınız için teşekkür ederiz.<br/>
    <b style="color:#facc15;">MaximoraShop 💛</b>
  </p>

</div>
`,

        }),
      }
    );

    toast("🚫 Sipariş iptal edildi, mail gönderildi.");

    setCancelModal(null);
    setCancelReason("");
    fetchOrders();
  }


  async function remove(orderId) {
    if (!confirm("Siparişi silmek istiyor musun?")) return;

    await supabase.from("order_items").delete().eq("order_id", orderId);
    await supabase.from("orders").delete().eq("id", orderId);

    toast("🗑️ Sipariş silindi!");
    fetchOrders();
  }

  return (
<div className="bg-white text-gray-900 rounded-xl p-6 border border-gray-200 shadow-sm mt-24">

     <h1 className="text-3xl font-bold mb-6 text-gray-900">
  📦 Sipariş Yönetimi
</h1>



      {orders.length === 0 ? (
        <p className="text-gray-500">Henüz sipariş yok.</p>
      ) : (
        orders.map(o => {
        
const couponDiscount = Number(o.coupon_discount_amount || 0);
const cartDiscount = Number(o.cart_discount_amount || 0);
const totalDiscount = couponDiscount + cartDiscount;




          return (
            <div
  key={o.id}
  className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm hover:shadow-md transition"
>
 


              <header className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold">Sipariş #{o.id}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(o.created_at).toLocaleString("tr-TR")}
                  </p>
                 <p className="text-xs mt-1 text-gray-700">
                    <b>Ad:</b> {o.full_name || "-"} — <b>Tel:</b> {o.phone || "-"}
                  </p>
               <p className="text-xs text-gray-700">
                    <b>Adres:</b> {o.address || "Belirtilmedi"}
                  </p>
                 {couponDiscount > 0 && o.coupon && (
  <p className="text-xs text-blue-600 font-semibold mt-1">
    🎟 Kupon: {o.coupon} ( -{TRY.format(couponDiscount)} )
  </p>
)}

{cartDiscount > 0 && (
  <p className="text-xs text-orange-600 font-semibold mt-1">
    🔥 Sepet İndirimi: -{TRY.format(cartDiscount)}
  </p>
)}



                  {o.note && (
                <p className="text-xs text-gray-600 mt-1 italic">
                      “{o.note}”
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {/* 🔥 İndirim varsa göster */}


{totalDiscount > 0 && (
  <p className="text-emerald-600 text-sm font-semibold">
    Toplam İndirim: -{TRY.format(totalDiscount)}
  </p>
)}

<p className="text-lg font-bold text-gray-900 mt-1">
  Ödenen Tutar: {TRY.format(o.final_amount)}
</p>




{/* 🚚 KARGO DURUMU */}
{o.shipping_type === "free_shipping" ? (
  <span className="inline-block mt-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
    🚚 Ücretsiz Kargo
  </span>
) : (
  <span className="inline-block mt-1 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg">
    💸 Kargo Müşteriden
  </span>
)}





                  {o.status === "pending" || o.status === "awaiting_payment" ? (
                    <button
  onClick={() => approve(o.id)}
 className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
>

                      ✅ Ödeme Onayla
                    </button>
                  ) : (
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                     className="mt-2 bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-800"
                    >
                      {Object.keys(STATUS).map(k => (
                        <option key={k} value={k}>{STATUS[k]}</option>
                      ))}
                    </select>
                  )}


                  {o.status !== "cancelled" && (
  <button
    onClick={() =>
      setCancelModal({
        orderId: o.id,
        email: o.email,
        full_name: o.full_name,
      })
    }
    className="block text-orange-600 hover:text-orange-700 text-xs mt-1 font-semibold"
  >
    🚫 Siparişi İptal Et
  </button>
)}


                  <button
                    onClick={() => remove(o.id)}
                    className="block text-red-500 hover:text-red-400 text-xs mt-2"
                  >
                     Sil
                  </button>
                </div>
              </header>
              {o.status === "cancelled" && o.cancel_reason && (
  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
    <b>İptal Sebebi:</b><br />
    {o.cancel_reason}
  </div>
)}


            <ul className="mt-3 text-sm text-gray-700 ml-2 space-y-1 border-t border-gray-200 pt-2">
  {(items[o.id] || []).map((it) => {
    let info = null;
    try {
      if (it.custom_info) info = JSON.parse(it.custom_info);
    } catch (err) {
      console.warn("custom_info JSON hatası:", err);
    }

    return (
      <ul className="mt-4 space-y-3 border-t border-gray-200 pt-4">
  {(items[o.id] || []).map((it) => (
    <li
      key={it.id}
      className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50"
    >
      {/* ✅ Ürün görseli */}
      <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0">
        <img
          src={it.image_url || "/products/default.png"}
          alt={it.product_name || "Ürün"}
          className="w-full h-full object-cover"
          draggable="false"
        />
      </div>

      {/* ✅ Ürün adı + adet + renk */}
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 truncate">
          {it.product_name || "Ürün"} × {it.quantity}
        </p>

        <p className="text-sm font-extrabold text-gray-900">
          {TRY.format(it.unit_price || 0)}
        </p>

        <p className="text-xs text-gray-600 mt-1">
          Renk:{" "}
          <span className="font-semibold text-gray-800">
            {it.color || "Belirtilmedi"}
          </span>
        </p>
      </div>
    </li>
  ))}
</ul>

    );
  })}
</ul>

          
            </div>
          );
        })
      )}

      {cancelModal && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-md rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-2">
        Siparişi İptal Et
      </h2>

      <p className="text-sm text-gray-600 mb-3">
        Müşteriye gönderilecek iptal sebebini yaz:
      </p>

      <textarea
        rows={4}
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        className="w-full border rounded-xl p-3 text-sm"
        placeholder="Örn: Ödeme süresi dolduğu için iptal edilmiştir."
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => {
            setCancelModal(null);
            setCancelReason("");
          }}
          className="px-4 py-2 text-sm rounded-lg border"
        >
          Vazgeç
        </button>

        <button
          onClick={confirmCancel}
          className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold"
        >
          İptal Et
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
