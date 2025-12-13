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
        .select("*")
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

                  <button
                    onClick={() => remove(o.id)}
                    className="block text-red-500 hover:text-red-400 text-xs mt-2"
                  >
                     Sil
                  </button>
                </div>
              </header>

            <ul className="mt-3 text-sm text-gray-700 ml-2 space-y-1 border-t border-gray-200 pt-2">
  {(items[o.id] || []).map((it) => {
    let info = null;
    try {
      if (it.custom_info) info = JSON.parse(it.custom_info);
    } catch (err) {
      console.warn("custom_info JSON hatası:", err);
    }

    return (
      <li key={it.id}>
        ✅ {it.product_name || it.name} × {it.quantity} —{" "}
        {TRY.format(it.unit_price || it.price)}

       {it.color && (
<p className="ml-6 mt-1 text-gray-600 text-xs">
    Renk: <span className="text-gray-700">{it.color}</span>
  </p>
)}

      </li>
    );
  })}
</ul>

          
            </div>
          );
        })
      )}
    </div>
  );
}
