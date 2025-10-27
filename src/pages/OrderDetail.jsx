// ✅ src/pages/OrderDetail.jsx — Premium Fixed Version
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const STATUS = {
  pending: { txt: "Bekleyen Ödeme", cls: "bg-yellow-600 text-black" },
  awaiting_payment: { txt: "Bekleyen Ödeme", cls: "bg-yellow-600 text-black" },
  processing: { txt: "Hazırlanıyor", cls: "bg-blue-600 text-white" },
  shipped: { txt: "Kargoda", cls: "bg-purple-600 text-white" },
  delivered: { txt: "Teslim Edildi", cls: "bg-green-600 text-white" },
  cancelled: { txt: "İptal Edildi", cls: "bg-red-600 text-white" },
};

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;
      if (!user) return nav("/dashboard");

      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      const { data: it } = await supabase
        .from("order_items")
        .select("*, products:product_id(image_url,name)")
        .eq("order_id", id);

      setOrder(o);
      setItems(it || []);
    })();
  }, [id]);

  if (!order)
    return (
      <div className="h-screen text-white flex justify-center items-center">
        ⏳ Sipariş bilgileri yükleniyor...
      </div>
    );

  const status = STATUS[order.status] || STATUS.pending;

  return (
    <div className="min-h-screen px-4 py-8 bg-black text-white">
      <div className="max-w-3xl mx-auto bg-neutral-900 p-6 rounded-xl shadow-xl border border-gray-700">

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold">Sipariş #{order.id}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.cls}`}>
            {status.txt}
          </span>
        </div>

        <p className="text-gray-400 text-xs mb-4">
          {new Date(order.created_at).toLocaleString("tr-TR")}
        </p>

        {/* Ürünler */}
        <h3 className="font-semibold mb-3 text-lg">Ürünler</h3>
        <div className="space-y-3">
          {items.map((i) => {
            const img = i.products?.image_url;
            const src = img?.startsWith("http")
              ? img
              : img
              ? `/products/${image}`
              : "/assets/placeholder-product.png";

            return (
              <div key={i.id} className="flex bg-neutral-800 p-3 rounded-lg gap-3">
                <img src={src} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="font-medium">{i.products?.name || i.product_name}</p>
                  <p className="text-gray-400 text-sm">× {i.quantity}</p>
                </div>
                <p className="font-bold text-yellow-400">
                  {TRY(Number(i.unit_price))}
                </p>
              </div>
            );
          })}
        </div>

        {/* Adres */}
        <div className="mt-6 text-sm">
          <p className="text-gray-400 mb-1">Teslimat Adresi:</p>
          <p className="bg-black/30 p-3 rounded-lg text-gray-200">
            {order.address || "Adres belirtilmedi"}
          </p>
        </div>

        {/* Not */}
        {order.note && (
          <div className="mt-4 text-sm">
            <p className="text-gray-400 mb-1">Sipariş Notu:</p>
            <p className="bg-black/30 p-3 rounded-lg text-gray-200">
              {order.note}
            </p>
          </div>
        )}

        {/* Toplam */}
        <div className="mt-6 text-right font-bold text-2xl text-yellow-300">
          Toplam: {TRY(Number(order.total_amount || 0))}
        </div>

        {/* Back */}
        <div className="mt-8 flex justify-end">
          <Link
            to="/orders"
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold"
          >
            ← Siparişlere Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
