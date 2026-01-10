import { Minus, Plus, Trash2, Hourglass } from "lucide-react";

export default function ProductCardCart({ item, inc, dec, remove }) {
  const price = Number(item.price ?? 0);
  const old = Number(item.old_price ?? 0);
  const hasDiscount = old > price;
  const discount = hasDiscount ? Math.round(((old - price) / old) * 100) : 0;

  const imageSrc =
    item.main_img ||
    item.image_url ||
    (Array.isArray(item.gallery) ? item.gallery[0] : null) ||
    "/products/default.png";

  return (
    <div className="
      bg-white border-b last:border-b-0
      px-4 py-4
      flex gap-4
      items-start sm:items-center
    ">

      {/* FOTO */}
      <div className="w-20 h-24 shrink-0 rounded-2xl bg-white/70 backdrop-blur border shadow-sm flex items-center justify-center">
        <img
          src={imageSrc}
          draggable="false"
          className="w-16 h-20 object-contain"
        />
      </div>

      {/* ORTA */}
      <div className="flex-1 min-w-0">

        <div className="font-semibold text-gray-900 truncate">
          {item.title || item.name}
        </div>

        {/* STOK */}
        <div className="mt-1">
          {item.stock <= 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-[2px] rounded-md border border-red-200">
              Tükendi
            </span>
          ) : item.stock < 10 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-[2px] rounded-md border border-orange-200">
              <Hourglass className="w-3.5 h-3.5 animate-hourglass" />
              Son Adetler
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-[2px] rounded-md border border-emerald-200">
              Stokta
            </span>
          )}
        </div>

        {/* FİYAT */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {hasDiscount && (
            <>
              <span className="text-[11px] bg-red-100 text-red-600 px-2 py-[2px] rounded-lg font-bold">
                -%{discount}
              </span>
              <span className="text-gray-400 line-through text-xs font-semibold">
                ₺{old.toLocaleString("tr-TR")}
              </span>
            </>
          )}

          <span className={`text-lg font-extrabold ${hasDiscount ? "text-red-600" : "text-gray-900"}`}>
            ₺{price.toLocaleString("tr-TR")}
          </span>
        </div>
      </div>

      {/* SAĞ */}
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">

        <div className="flex items-center bg-white border rounded-xl overflow-hidden shadow-sm">
          <button onClick={() => dec(item.product_id)} className="px-3 py-1 text-gray-700">−</button>
          <div className="px-4 font-bold text-gray-900">{item.quantity}</div>
          <button onClick={() => inc(item.product_id)} className="px-3 py-1 text-gray-700">+</button>
        </div>

        <button
          onClick={() => remove(item.product_id)}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 size={18}/>
        </button>
      </div>
    </div>
  );
}
