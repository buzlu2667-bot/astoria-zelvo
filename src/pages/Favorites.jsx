import { useNavigate, Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Trash2, Heart, Home } from "lucide-react";
import { Sparkles } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { Hourglass } from "lucide-react";
const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

// ⭐ Resim seçici
function pickImage(p) {
  return (
    p.image_url ||
    p.main_img ||
    p.img_url ||
    p.img ||
    (Array.isArray(p.images) && p.images[0]) ||
    (Array.isArray(p.gallery) && p.gallery[0]) ||
    "/products/default.png"
  );
}

export default function Favorites() {
  const { favorites, removeFav } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();


  
  /* ----------- BOŞ FAVORİLER ----------- */
 if (!favorites || favorites.length === 0)
  return (
    <div className="min-h-[60vh] bg-white px-5 py-10">

      {/* ✅ BREADCRUMB (BOŞKEN DE GÖZÜKSÜN) */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-gray-900">
          <Home className="w-4 h-4" />
          <span>Ana Sayfa</span>
        </Link>

        <span className="text-gray-300">/</span>

        <span className="text-gray-900 font-semibold">Favorilerim</span>
      </nav>

      {/* BOŞ FAVORİ İÇERİĞİ */}
      <div className="min-h-[45vh] flex flex-col items-center justify-center text-center">
        <Heart className="w-14 h-14 text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.35)]" />

        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          Favoriler Boş
        </h2>

        <p className="text-gray-500 mt-2 text-sm">
          Beğendiğin ürünleri burada görebilirsin.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-5 bg-[#f27a1a] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90"
        >
          Alışverişe Başla
        </button>
      </div>
    </div>
  );


  /* ----------- LİSTE ----------- */
  return (
  <div className="max-w-7xl mx-auto px-5 py-10 bg-white">

    {/* ✅ BREADCRUMB */}
<nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
  <Link to="/" className="inline-flex items-center gap-1 hover:text-gray-900">
    <Home className="w-4 h-4" />
    <span>Ana Sayfa</span>
  </Link>

  <span className="text-gray-300">/</span>

  <span className="text-gray-900 font-semibold">Favorilerim</span>
</nav>

   {/* PREMIUM HEADER */}
<div className="
  relative overflow-hidden rounded-3xl
  border border-gray-200 bg-white
  shadow-[0_18px_60px_-40px_rgba(0,0,0,0.25)]
  px-5 py-6 sm:px-7 sm:py-7 mb-8
">
  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_circle_at_15%_20%,rgba(249,115,22,0.18),transparent_60%)]" />

  <div className="relative flex items-start justify-between gap-4">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
      </div>

      <div className="min-w-0">
        <div className="text-xs font-semibold tracking-wide text-gray-500">
          Favoriler
        </div>

        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          Favorilerim
        </h1>

        <p className="mt-1 text-sm sm:text-base text-gray-600">
          Beğendiklerin burada. Tek tıkla sepete ekle.
        </p>
      </div>
    </div>

    <div className="hidden sm:flex flex-col items-end">
      <div className="text-xs text-gray-500">Toplam</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">
        {favorites.length} ürün
      </div>
    </div>
  </div>
</div>



      {/* Trendyol grid */}
      <div className="
        grid 
        grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 
        gap-5
      ">
        {favorites.map((p) => {
          const img = pickImage(p);

          return (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="
                bg-white 
                border border-gray-200 
                rounded-xl 
                shadow-sm 
                p-3 
                cursor-pointer
                hover:shadow-md 
                transition
                flex flex-col
              "
            >
              {/* FOTO */}
              <div className="w-full h-[180px] rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={img}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* BAŞLIK */}
              <p className="mt-2 font-semibold text-gray-800 text-sm line-clamp-2">
                {p.title || p.name}
              </p>

            {/* STOK */}
<div className="mt-1">
  {p.stock <= 0 ? (
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
  ) : p.stock < 10 ? (
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

              {/* FİYAT */}
              <div className="mt-3">
                {p.old_price > p.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-[2px] rounded-lg font-bold">
                      %{Math.round(((p.old_price - p.price) / p.old_price) * 100)}
                    </span>

                    <span className="text-gray-400 line-through text-sm">
                      ₺{Number(p.old_price).toLocaleString("tr-TR")}
                    </span>
                  </div>
                )}

                <p className="text-lg font-bold text-gray-900">
                  ₺{Number(p.price).toLocaleString("tr-TR")}
                </p>
              </div>

              {/* BUTONLAR */}
              <div className="flex gap-2 mt-4">
                {/* SEPETE EKLE */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();

                    let existed = false;
                    const { data: u } = await supabase.auth.getUser();
                    const user = u?.user;

                    if (!user) {
                      const ls = JSON.parse(localStorage.getItem("elitemart_cart") || "[]");
                      existed = ls.some((i) => String(i.id) === String(p.id));
                    } else {
                      const { data: existRow } = await supabase
                        .from("cart_items")
                        .select("id")
                        .eq("user_id", user.id)
                        .eq("product_id", p.id)
                        .maybeSingle();

                      existed = !!existRow;
                    }

                    addToCart({
                      ...p,
                      image_url: img,
                      quantity: 1,
                    });

                    window.dispatchEvent(
                      new CustomEvent("toast", {
                        detail: existed
                          ? { type: "info", text: "Ürün adedi artırıldı!" }
                          : { type: "success", text: "Sepete eklendi!" },
                      })
                    );
                  }}
                  className="
                    flex-1 flex items-center justify-center gap-1
                    bg-[#f27a1a] text-white 
                    py-2 rounded-lg font-bold 
                    hover:opacity-90 
                    text-sm
                  "
                >
                  <ShoppingCart className="w-4 h-4" /> Sepete
                </button>

                {/* FAVORİDEN SİL */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFav(p.id);

                    window.dispatchEvent(
                      new CustomEvent("toast", {
                        detail: { type: "warning", text: "Favorilerden çıkarıldı!" },
                      })
                    );
                  }}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
