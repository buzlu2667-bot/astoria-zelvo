import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { STATUS_BADGE } from "../utils/statusBadge";
import { ShoppingBag } from "lucide-react";
const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

const STATUS_FILTER_MAP = {
  pending: ["awaiting_payment"],
  preparing: ["processing"],
  cargo: ["shipped"],
  completed: ["delivered"],
  cancelled: ["cancelled"],
};

async function fetchAllOrders(setOrders, setItemsByOrder, setLoading) {
  setLoading && setLoading(true);

  const { data: ud } = await supabase.auth.getUser();
  const user = ud?.user;

  if (!user) {
    setOrders([]);
    setItemsByOrder({});
    setLoading(false);
    return;
  }

  const { data: od } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  setOrders(od || []);

  const ids = (od || []).map((o) => o.id);

  if (ids.length > 0) {
    const { data: its } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", ids)
      .order("id", { ascending: false });

    const grouped = {};
    (its || []).forEach((it) => {
      (grouped[it.order_id] ||= []).push(it);
    });

    setItemsByOrder(grouped);
  } else {
    setItemsByOrder({});
  }

  setLoading(false);
}

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [itemsByOrder, setItemsByOrder] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAllOrders(setOrders, setItemsByOrder, setLoading);
  }, [location.pathname]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchAllOrders(setOrders, setItemsByOrder, setLoading);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    if (orders.length > 0 && Object.keys(itemsByOrder).length === 0)
      return orders;

    return orders.filter((o) => {
      const items = itemsByOrder[o.id] || [];
      const text = (search || "").toLowerCase();

      const matchProduct = items.some((it) =>
        (it.product_name || "").toLowerCase().includes(text)
      );

      const matchId = String(o.id || "").includes(text);
      const matchPrice = TRY(o.total_amount || 0).includes(text);

      let matchStatus = true;
      if (statusFilter) {
        const list = STATUS_FILTER_MAP[statusFilter] || [];
        matchStatus = list.includes(o.status);
      }

      return (matchProduct || matchId || matchPrice) && matchStatus;
    });
  }, [orders, itemsByOrder, search, statusFilter]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        Siparişler yükleniyor...
      </div>
    );

return (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">

      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-gray-800">
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">Siparişlerim</span>
      </nav>

    {/* PREMIUM HEADER – ORTADA & KISA */}
<div className="max-w-4xl mx-auto mb-8">
  <div
    className="
      relative overflow-hidden rounded-3xl
      border border-white/10 bg-gray-900/85 backdrop-blur
      shadow-[0_18px_60px_-40px_rgba(0,0,0,0.85)]
      px-6 py-4
    "
  >

        <div
          className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(700px_circle_at_15%_20%,rgba(249,115,22,0.35),transparent_60%)]"
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
          <div
  className="
 w-10 h-10 rounded-xl
    bg-orange-500/15 border border-orange-500/20
    flex items-center justify-center
  "
>
  <ShoppingBag className="w-6 h-6 text-orange-400" />
</div>


            <div>
              <div className="text-xs font-semibold tracking-wide text-gray-300">
                Hesabım
              </div>
             <h1 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-white">
                Siparişlerim
              </h1>
           <p className="mt-0.5 text-sm text-gray-300 leading-snug">
                Tüm siparişlerini ve durumlarını buradan takip edebilirsin.
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <div className="text-xs text-gray-300">Toplam</div>
            <div className="text-sm font-semibold text-white">
              {orders.length} sipariş
            </div>
          </div>
        </div>
      </div>
  </div>
      {/* ====== SENİN ESKİ İÇERİK (AYNEN) ====== */}
      <div className="mt-8 max-w-4xl mx-auto">

        {/* ARAMA & FİLTRE */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Ürün adı, sipariş no veya tutar ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg bg-white text-gray-800 placeholder-gray-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-gray-800"
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Bekliyor</option>
            <option value="preparing">Hazırlanıyor</option>
            <option value="cargo">Kargoda</option>
            <option value="completed">Teslim Edildi</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>

        {/* SİPARİŞ YOK */}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">
              Henüz siparişiniz bulunmuyor.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-[#f27a1a] text-white rounded-lg"
            >
              Alışverişe Başla
            </Link>
          </div>
        )}

        {/* SİPARİŞ LİSTESİ */}
        <div className="space-y-6">
          {filteredOrders.map((o) => {
            const created = new Date(o.created_at).toLocaleString("tr-TR");
            const items = itemsByOrder[o.id] || [];

            return (
              <div
                key={o.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                {/* ÜST BİLGİ */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Sipariş #{o.id}
                    </p>
                    <p className="text-sm text-gray-500">{created}</p>
                  </div>

                  <span className="
                    text-xs px-3 py-1 rounded-full
                    bg-orange-100 text-orange-700
                    border border-orange-300 font-semibold
                  ">
                    {STATUS_BADGE[o.status]?.text}
                  </span>
                </div>

                {/* ÜRÜNLER */}
                <div className="space-y-3">
                  {items.map((it) => {
                    const imageSrc = it.image_url?.startsWith("http")
                      ? it.image_url
                      : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${it.image_url}`;

                    return (
                      <div
                        key={it.id}
                        onClick={() => navigate(`/orders/${o.id}`)}
                        className="
                          w-full bg-white border border-gray-200 rounded-xl
                          p-3 flex items-center gap-4 shadow-sm
                          hover:shadow-md hover:border-gray-300 transition
                          cursor-pointer
                        "
                      >
                        <div className="w-[70px] h-[70px] rounded-lg overflow-hidden border bg-gray-100">
                          <img
                            src={imageSrc}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="text-gray-900 font-medium text-[14px] line-clamp-2">
                            {it.product_name}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Adet: {it.quantity}
                          </p>
                          {it.color && (
                            <p className="text-gray-500 text-xs">
                              Renk: {it.color}
                            </p>
                          )}
                          <p className="text-[#f27a1a] font-bold text-[17px] mt-1">
                            {TRY(it.unit_price)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DETAYA GİT */}
                <div className="flex justify-end mt-4">
                  <Link
                    to={`/orders/${o.id}`}
                    className="px-4 py-2 bg-[#f27a1a] text-white rounded-lg text-sm hover:opacity-90"
                  >
                    Detaya Git →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  </div>
);

}
