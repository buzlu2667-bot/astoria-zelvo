import { STATUS_BADGE } from "../utils/statusBadge";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });





export default function Orders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [itemsByOrder, setItemsByOrder] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;
      if (!user) return navigate("/dashboard");

      const { data: od } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (!alive) return;
      setOrders(od || []);

      const ids = (od || []).map((o) => o.id);
      if (ids.length > 0) {
        const { data: its } = await supabase
          .from("order_items")
          .select("*, products:product_id(image_url,name)")
          .in("order_id", ids);

        const grouped = {};
        (its || []).forEach((it) => {
          (grouped[it.order_id] ||= []).push(it);
        });

        if (alive) setItemsByOrder(grouped);
      }

      setLoading(false);
    })();
    return () => (alive = false);
  }, [navigate]);

  const totals = useMemo(() => {
    const m = {};
    for (const o of orders) {
      const arr = itemsByOrder[o.id] || [];
      m[o.id] = arr.reduce(
        (s, it) =>
          s +
          (Number(it.unit_price) || 0) * (Number(it.quantity) || 1),
        0
      );
    }
    return m;
  }, [orders, itemsByOrder]);

  async function handleDelete(id) {
    if (!window.confirm("Bu siparişi silmek istediğine emin misin?")) return;
    try {
      await supabase.from("order_items").delete().eq("order_id", id);
      await supabase.from("orders").delete().eq("id", id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Sipariş silinemedi!");
    }
  }

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        ⏳ Sipariş bilgileri yükleniyor...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>

      {orders.length === 0 ? (
        <p className="text-gray-400">
          Henüz sipariş yok.{" "}
          <Link className="underline" to="/">
            Alışverişe başla
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const b = STATUS_BADGE[o.status] || STATUS_BADGE.pending;
            const created = new Date(o.created_at).toLocaleString("tr-TR");

           return (
  <div
    key={o.id}
    className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:border-purple-500/50 transition-all"
  >
    <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div>
        <p className="font-semibold">Sipariş #{o.id}</p>
        <p className="text-gray-400 text-sm">{created}</p>
      </div>

      <div className="flex items-center gap-3">

        <span className={`flex items-center gap-1 text-sm ${b.cls}`}>
  {b.text} {b.icon}
</span>

        <span className="text-lg font-bold text-yellow-400">
          {TRY(totals[o.id])}
        </span>
      </div>

    </header>


                {/* Ürünler */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(itemsByOrder[o.id] || []).map((it) => {
                    const image = it.products?.image_url;
                    return (
                      <div
                        key={it.id}
                        className="flex items-center gap-3 bg-neutral-800 rounded-lg p-2"
                      >
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-black/40">
                          <img
                            src={
                              image?.startsWith?.("http")
                                ? image
                                : image
                                ? `/products/${image}`
                                : "/assets/placeholder-product.png"
                            }
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold">
                            {it.products?.name}
                          </div>
                          <div className="text-gray-400">× {it.quantity}</div>
                        </div>
                        <div className="ml-auto font-semibold">
                          {TRY(it.unit_price)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sil & Detay */}
                <footer className="mt-4 flex justify-end gap-3">
                  {["pending", "awaiting_payment"].includes(o.status) && (
                    <button
                      onClick={() => handleDelete(o.id)}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500"
                    >
                       Sil
                    </button>
                  )}

                  <Link
                    to={`/orders/${o.id}`}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
                  >
                    Detaya Git →
                  </Link>
                </footer>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
