import { Minus, Plus, Trash2 } from "lucide-react";
import { Hourglass } from "lucide-react";
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
        cursor-pointer
        bg-white 
        rounded-xl 
        border border-gray-200 
        hover:shadow-md 
        transition-all 
        p-3 
        flex flex-col
      "
    >
      {/* 📌 GÖRSEL — ÜRÜN KARTIYLA AYNI */}
      <div className="relative w-full h-[210px] rounded-lg overflow-hidden bg-gray-100">
        
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-[2px] rounded-md">
            %{discount}
          </div>
        )}

        {/* FOTO */}
        <img
          src={imageSrc}
          className="w-full h-full object-cover"
          draggable="false"
        />

        {/* SİL BUTONU */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            remove(item.product_id);
          }}
          className="
            absolute bottom-2 right-2 bg-white 
            w-9 h-9 rounded-full 
            flex items-center justify-center 
            border border-gray-300 
            hover:bg-gray-100
            transition
          "
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* BAŞLIK */}
      <p className="text-gray-800 font-semibold text-[15px] truncate mt-3">
        {item.title || item.name}
      </p>

   {/* STOK */}
<div className="mt-1">
  {item.stock <= 0 ? (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-bold
      text-red-600
      bg-red-50
      px-2 py-[2px]
      rounded-md
      border border-red-200
    ">
      Tükendi
    </span>
  ) : item.stock < 10 ? (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-semibold
      text-orange-700
      bg-orange-50
      px-2 py-[2px]
      rounded-md
      border border-orange-200
    ">
      <Hourglass className="w-3.5 h-3.5 animate-hourglass" />
      Son Adetler
    </span>
  ) : (
    <span className="
      inline-flex items-center gap-1
      text-[12px] font-medium
      text-emerald-700
      bg-emerald-50
      px-2 py-[2px]
      rounded-md
      border border-emerald-200
    ">
      Stokta
    </span>
  )}
</div>



      {/* FİYAT — ÜRÜN KARTIYLA AYNI */}
      <div className="mt-3 flex items-center gap-2">
        {hasDiscount && (
          <span className="text-gray-400 line-through text-sm">
            ₺{old.toLocaleString("tr-TR")}
          </span>
        )}

        <span className="text-gray-900 font-bold text-lg">
          ₺{price.toLocaleString("tr-TR")}
        </span>

        {hasDiscount && (
          <span className="bg-red-600 text-white text-xs font-semibold px-2 py-[2px] rounded-md">
            %{discount}
          </span>
        )}
      </div>

      {/* 📌 ADET ALANI — ALTTA MODERN */}
      <div className="flex items-center justify-between mt-4">
        
        {/* + / - */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              dec(item.product_id);
            }}
            className="
              w-9 h-9 flex items-center justify-center 
              border border-gray-300 rounded-lg
              text-gray-600 hover:bg-gray-100
            "
          >
            <Minus size={16} />
          </button>

          <span className="w-8 text-center font-bold text-gray-800 text-base">
            {item.quantity}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              inc(item.product_id);
            }}
            className="
              w-9 h-9 flex items-center justify-center 
              border border-gray-300 rounded-lg
              text-gray-600 hover:bg-gray-100
            "
          >
            <Plus size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
