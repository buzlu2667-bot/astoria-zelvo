import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { ShoppingBag, Heart, ShoppingCart, MessageCircle, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ShieldCheck, Lock } from "lucide-react";

export default function Dashboard() {
  const nav = useNavigate();
  const { favorites } = useFavorites();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
 const { cart } = useCart();
 

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return nav("/");

      setUser(data.user);

      const { data: ord } = await supabase.from("orders").select("id").eq("user_id", data.user.id);
      setOrders(ord || []);

     
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-16 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-16 flex flex-col sm:flex-row items-center justify-between gap-6">

  <div className="flex items-center gap-5">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xl">
      <span className="text-2xl font-black">
        {user?.email?.charAt(0)?.toUpperCase() || "U"}
      </span>
    </div>

    <div>
     <h1 className="
  text-3xl sm:text-4xl font-black flex items-center gap-3
  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
  bg-clip-text text-transparent
">
  Hesabım

  <span className="
    text-[11px] px-3 py-1 rounded-full
    bg-gradient-to-r from-emerald-400 to-teal-400
    text-white font-bold shadow-md
  ">
    AKTİF
  </span>
</h1>

      <p className="text-sm text-gray-500">{user?.email}</p>

     <div className="flex flex-wrap gap-3 mt-4">

  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-md border border-gray-200">
    <ShieldCheck className="w-4 h-4 text-emerald-500" />
    <span className="text-xs font-semibold text-gray-700">Doğrulanmış Hesap</span>
  </div>

  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-md border border-gray-200">
    <Truck className="w-4 h-4 text-blue-500" />
    <span className="text-xs font-semibold text-gray-700">Hızlı Kargo</span>
  </div>

  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-md border border-gray-200">
    <Lock className="w-4 h-4 text-purple-500" />
    <span className="text-xs font-semibold text-gray-700">Güvenli Ödeme</span>
  </div>

</div>


    </div>
  </div>

  <button
  onClick={() => nav("/orders")}
  className="
    px-8 py-3 rounded-full text-sm font-bold
    text-white
    bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
    shadow-xl
    hover:scale-105 hover:shadow-2xl
    transition
    backdrop-blur-md
  "
>
  Siparişlerime Git →
</button>


</div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {cart.length > 0 && (
  <div className="mt-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 flex items-center justify-between shadow-2xl animate-[softPulse_2.5s_infinite]">

    <div>
      <p className="text-white text-sm opacity-90">Sepetinde ürün var 👀</p>
      <h3 className="text-2xl font-black text-white">
        Kaldığın Yerden Devam Et
      </h3>
    </div>

    <button
      onClick={() => nav("/cart")}
     className="bg-white text-orange-600 font-black px-6 py-3 rounded-full shadow-xl hover:scale-105 transition animate-pulse"

    >
      Sepete Git →
    </button>
  </div>
)}


          <DashCard icon={ShoppingBag} label="Siparişlerim" value={orders.length} to="/orders" color="from-orange-500 to-orange-600" />
          <DashCard icon={Heart} label="Favorilerim" value={favorites?.length || 0} to="/favorites" color="from-pink-500 to-rose-500" />
          <DashCard
  icon={ShoppingCart}
  label="Sepetim"
  value={cart.reduce((a, b) => a + (b.quantity || 1), 0)}
  to="/cart"
  color="from-blue-500 to-indigo-500"
/>

       <DashCard
  icon={Truck}
  label="Kargo Takip"
  value={orders.length > 0 ? "Siparişlerini Gör" : "Henüz Yok"}
  to="/orders"
  color="from-emerald-500 to-green-600"
/>


        </div>

        <div className="mt-12 flex justify-center">
         <button
  onClick={() => window.open("https://wa.me/905384657526", "_blank")}
  className="
    flex items-center gap-3
    px-12 py-4 rounded-full text-lg font-black
    text-white
    bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400
    shadow-2xl
    hover:scale-110 hover:shadow-emerald-300/50
    transition
    backdrop-blur-md
  "
>
  <MessageCircle size={22} className="drop-shadow" />
  Canlı Destek
</button>


        </div>
<p className="mt-3 text-xs text-gray-400 text-center">
  Ortalama yanıt süresi: <b>2 dakika</b> • Gerçek müşteri temsilcisi
</p>

      </div>
    </div>
  );
}

function DashCard({ icon: Icon, label, value, to, color }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(to)}
      className={`relative p-6 rounded-3xl text-white shadow-xl hover:scale-105 transition bg-gradient-to-br ${color}`}
    >
      <div className="absolute right-5 top-5 opacity-20">
        <Icon size={64} />
      </div>

      <div className="text-left">
        <p className="text-sm opacity-90">{label}</p>
        <p className="text-3xl font-black mt-2">{value}</p>
      </div>
    </button>
  );
}
