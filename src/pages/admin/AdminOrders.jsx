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
    await supabase
      .from("orders")
      .update({ status: "processing" })
      .eq("id", orderId);

    toast("✅ Ödeme Onaylandı!");
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
    <div className="bg-neutral-900 text-white rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-6 text-yellow-400">
        📦 Sipariş Yönetimi
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">Henüz sipariş yok.</p>
      ) : (
        orders.map(o => {
         const originalTotal = (items[o.id] || []).reduce(
  (s, it) => s + it.unit_price * it.quantity, 0
  
);

const total = o.final_amount ?? o.total_amount ?? originalTotal;
const discount = o.discount_amount ?? 0;



          return (
            <div
              key={o.id}
              className="border border-neutral-700 bg-neutral-800/40 rounded-xl p-4 mb-4 shadow-lg"
            >
              <header className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold">Sipariş #{o.id}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(o.created_at).toLocaleString("tr-TR")}
                  </p>
                  <p className="text-xs mt-1 text-gray-300">
                    <b>Ad:</b> {o.full_name || "-"} — <b>Tel:</b> {o.phone || "-"}
                  </p>
                  <p className="text-xs text-gray-300">
                    <b>Adres:</b> {o.address || "Belirtilmedi"}
                  </p>
                  {discount > 0 && o.coupon && (
  <p className="text-xs text-blue-400 font-semibold mt-1">
    🎟 Kupon: {o.coupon} (İndirim: -{TRY.format(discount)})
  </p>
)}


                  {o.note && (
                    <p className="text-xs text-gray-400 mt-1 italic">
                      “{o.note}”
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {/* 🔥 İndirim varsa göster */}
{discount > 0 && (
  <p className="text-emerald-400 text-sm font-semibold">
    İndirim: -{TRY.format(discount)}
  </p>
)}

{/* ✅ Final Tutar */}
<p className="text-lg font-bold text-yellow-300">
  {TRY.format(total)}
</p>

{/* 🧾 Ürünlerin gerçek toplamını küçük göster */}
{discount > 0 && (
  <p className="text-xs text-gray-400 line-through">
    {TRY.format(originalTotal)}
  </p>
)}


                  {o.status === "pending" || o.status === "awaiting_payment" ? (
                    <button
                      onClick={() => approve(o.id)}
                      className="mt-2 bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-sm font-semibold"
                    >
                      ✅ Ödeme Onayla
                    </button>
                  ) : (
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="mt-2 bg-neutral-700 px-2 py-1 rounded text-xs"
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
                    🗑️ Sil
                  </button>
                </div>
              </header>

              <ul className="mt-3 text-xs text-gray-300 ml-2 space-y-1">
                {(items[o.id] || []).map(it => (
                  <li key={it.id}>
                    ✅ {it.product_name} × {it.quantity} —{" "}
                    {TRY.format(it.unit_price)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}
