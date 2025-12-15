import { STATUS } from "../utils/statusBadge";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

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
        .select("*")
        .eq("order_id", id);

      setOrder(o);
      setItems(it || []);
    })();
  }, [id]);

  if (!order)
    return (
      <div className="h-screen text-gray-600 flex justify-center items-center">
        Sipariş yükleniyor...
      </div>
    );

  const status = STATUS[order.status] || STATUS.pending;

  return (
<div className="min-h-screen bg-white px-4 pt-4 pb-8">

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">

        {/* BAŞLIK */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Sipariş #{order.id}
          </h1>

          <span
            className="
              text-xs px-3 py-1 rounded-full
              bg-orange-100 text-orange-700 border border-orange-300
              font-semibold
            "
          >
            {status?.text || status?.txt}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          {new Date(order.created_at).toLocaleString("tr-TR")}
        </p>

        {/* ÜRÜNLER */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">Ürünler</h2>

        <div className="space-y-3">
          {items.map((i) => {
            const imgSrc = i.image_url?.startsWith("http")
              ? i.image_url
              : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${i.image_url}`;

            return (
              <div
                key={i.id}
                className="
                  flex gap-4 items-center
                  bg-white border border-gray-200
                  rounded-xl p-3 shadow-sm
                "
              >
                <div className="w-[75px] h-[75px] rounded-lg overflow-hidden bg-gray-100 border">
                  <img
                    src={imgSrc}
                    className="w-full h-full object-cover"
                    alt="ürün"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                    {i.product_name}
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    Adet: <span className="font-semibold">{i.quantity}</span>
                  </p>

                  {i.color && (
                    <p className="text-gray-500 text-xs">
                      Renk: <span className="font-semibold">{i.color}</span>
                    </p>
                  )}

                  <p className="text-[#f27a1a] font-bold text-lg mt-1">
                    {TRY(i.unit_price)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ADRES */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-gray-900 font-bold mb-1">Teslimat Adresi</h3>
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {order.address || "Adres belirtilmedi"}
          </p>
        </div>

        {/* NOT */}
        {order.note && (
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-gray-900 font-bold mb-1">Sipariş Notu</h3>
            <p className="text-gray-700 text-sm whitespace-pre-line">
              {order.note}
            </p>
          </div>
        )}

        {/* TOPLAM */}
        <div className="mt-8 bg-white border border-gray-300 rounded-xl p-4">
          <h3 className="text-gray-900 font-bold mb-1">Toplam Tutar</h3>
          <p className="text-gray-900 font-extrabold text-2xl">
            {TRY(order.final_amount ?? order.total_amount)}
          </p>
        </div>

       {/* 🎟 KUPON İNDİRİMİ */}
{/* 🎟 KUPON İNDİRİMİ */}
{order.coupon && order.coupon_discount_amount > 0 && (
  <div className="
    mt-4
    bg-blue-50
    border border-blue-200
    rounded-xl
    p-4
  ">
    <h3 className="text-blue-800 font-bold mb-1">
      🎟 Kupon İndirimi
    </h3>

    <p className="text-blue-700 text-sm">
      Kupon Kodu: <b>{order.coupon}</b>
    </p>

    <p className="text-green-700 font-semibold text-sm mt-1">
      İndirim: -{TRY(order.coupon_discount_amount)}
    </p>
  </div>
)}



  {/* 🎟 SEPET İNDİRİMİ */}
{order.cart_discount_amount > 0 && (
  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
    <h3 className="text-orange-800 font-bold mb-1">
      🔥 Kazanılan İndirim
    </h3>

    <p className="text-orange-700 text-sm">
      Sepete özel indirim uygulandı
    </p>

    <p className="text-green-700 font-semibold text-sm mt-1">
      İndirim: -{TRY(order.cart_discount_amount)}
    </p>
  </div>
)}




        {/* GERİ */}
        <div className="mt-8 text-right">
          <Link
            to="/orders"
            className="
              px-5 py-2 rounded-lg
              bg-[#f27a1a] text-white 
              font-semibold hover:opacity-90
            "
          >
            ← Siparişlere Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
