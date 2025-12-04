import { Minus, Plus, Trash2 } from "lucide-react";

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
  <div
    className="
      bg-[#0e0e0e]
      rounded-2xl
      border border-[#1b1b1b]
      hover:border-[#00ffcc80]
      transition-all duration-300
      hover:shadow-[0_0_18px_rgba(0,255,200,0.25)]
      p-4
      flex flex-col
      gap-4
      w-full

      min-h-[420px]   /* ⭐ BUNA BURAYA EKLİYORSUN */
    "
  >

      {/* 🔥 ÜRÜN GÖRSELİ */}
      <div className="relative w-full h-[140px] rounded-xl overflow-hidden bg-black group">
        {hasDiscount && (
          <div
            className="
              absolute top-3 left-3 z-30
              bg-red-700/60 text-red-200 
              font-bold text-xs px-2 py-[2px]
              rounded-lg border border-red-500/40
            "
          >
            %{discount}
          </div>
        )}

        <img
          src={imageSrc}
          className="
            w-full h-full object-cover 
            transition duration-700 
            group-hover:scale-110 
            group-hover:brightness-110
          "
        />
      </div>

      {/* ÜRÜN ADI */}
   <p className="text-white font-semibold text-[15px] leading-tight min-h-[40px]">
  {item.title || item.name}
</p>


      {/* STOK DURUMU */}
    <div className="text-[12px] min-h-[22px] flex items-center">
        {item.stock <= 0 ? (
          <span className="text-red-500 font-semibold">Tükendi ❌</span>
        ) : item.stock < 10 ? (
          <span className="text-yellow-400 font-semibold">Az Kaldı ⚠️</span>
        ) : (
          <span className="text-green-500 font-semibold">Stokta ✔</span>
        )}
      </div>

      {/* FİYAT BLOĞU */}
     <div
  className="
    flex items-center gap-3
    bg-black/40
    border border-yellow-500/30
    rounded-xl
    px-4 py-3
    shadow-[0_0_12px_rgba(255,200,0,0.15)]
    min-h-[55px]
  "
>

        {hasDiscount && (
          <>
            <span
              className="
                bg-red-700/60 text-red-200
                font-bold text-xs px-2 py-[2px]
                rounded-lg border border-red-500/40
              "
            >
              %{discount}
            </span>

            <span className="text-gray-400 line-through text-sm font-semibold">
              ₺{old.toLocaleString("tr-TR")}
            </span>
          </>
        )}

        <span
          className="
            text-yellow-300 
            font-extrabold 
            text-lg
            drop-shadow-[0_0_6px_rgba(255,220,0,0.4)]
          "
        >
          ₺{price.toLocaleString("tr-TR")}
        </span>
      </div>

      {/* 🔥 ADET & SİL */}
      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => dec(item.product_id)}
            className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700"
          >
            <Minus size={14} />
          </button>

          <span className="w-8 text-center font-bold text-base">
            {item.quantity}
          </span>

          <button
            onClick={() => inc(item.product_id)}
            className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={() => remove(item.product_id)}
          className="text-red-500 hover:text-red-400"
        >
          <Trash2 size={22} />
        </button>
      </div>
    </div>
  );
}
