// 📄 src/components/AccountModal.jsx
import { X, User2, Heart, PackageSearch, ShieldCheck, LogOut, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";

export default function AccountModal({ open, onClose, session, isAdmin, onOrderCheck, unreadCount }) {

  const [localUnread, setLocalUnread] = useState(0);

  // 🟦 unreadCount sayıya çevir
  const initialUnread = Number(unreadCount || 0);

  // 🟦 Modal AÇILDIĞINDA mesaj sayısını güncelle
  useEffect(() => {
    if (!open) return; // ❗ HOOK İÇİNDE KONTROL OK, RETURN DEĞİL

    async function fetchUnread() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

     const { data, error } = await supabase
  .from("messages")
  .select("*")
  .or(`is_global.eq.true,user_id.eq.${user.id}`)
  .eq("is_read", false)
  .eq("hidden_by_user", false); // ⭐⭐ EKLENECEK SATIR


      if (!error) setLocalUnread(data.length);
    }

    // header’dan geleni koy
    setLocalUnread(initialUnread);

    // veritabanından tazele
    fetchUnread();
  }, [open]);

  // ❗❗❗ HOOKLARDAN SONRA RETURN KOY
  if (!open) return null;

  return (
  <div
  className="
    fixed inset-0 z-[99999]
    flex items-center justify-center
    bg-black/70 backdrop-blur-xl
    animate-fadeIn
  "
>
  <div
    className="
      w-[92%] max-w-md 
      bg-gradient-to-br from-[#0a0a0a]/90 to-[#111]/90
      border border-yellow-500/20 
      rounded-3xl p-7 relative
      shadow-[0_0_65px_rgba(255,215,0,0.25)]
      animate-scaleIn
    "
  >
    {/* Close */}
    <button
      onClick={onClose}
      className="
        absolute right-5 top-5 
        text-gray-400 hover:text-yellow-400 
        transition
      "
    >
      <X className="w-7 h-7" />
    </button>

    {/* USER CARD */}
    <div
      className="
        flex items-center gap-5 mb-7 
        bg-white/5 p-4 rounded-2xl
        border border-white/10
        shadow-[0_0_25px_rgba(255,215,0,0.1)]
      "
    >
      <div
        className="
          w-16 h-16 rounded-2xl flex items-center justify-center
          bg-gradient-to-br from-yellow-400 to-rose-400 
          text-black font-bold text-2xl
          shadow-[0_0_25px_rgba(255,215,0,0.5)]
        "
      >
        {session?.user?.email?.[0]?.toUpperCase()}
      </div>

      <div>
        <p className="text-gray-400 text-xs tracking-wide">Hesap</p>
        <p className="font-bold text-yellow-400 text-sm">
          {session?.user?.email}
        </p>
      </div>
    </div>

    {/* MENU */}
    <div className="space-y-3">

      {/* ITEM TEMPLATE */}
      <Link
        to="/dashboard"
        onClick={onClose}
        className="
          flex items-center gap-3 p-3 rounded-xl
          bg-white/5 hover:bg-white/10 
          transition border border-white/10
        "
      >
        <User2 className="text-purple-400 w-6 h-6" />
        <span className="text-gray-200 font-medium">Profilim</span>
      </Link>

      <Link
        to="/orders"
        onClick={onClose}
        className="
          flex items-center gap-3 p-3 rounded-xl
          bg-white/5 hover:bg-white/10 
          transition border border-white/10
        "
      >
        <PackageSearch className="text-yellow-400 w-6 h-6" />
        <span className="text-gray-200 font-medium">Siparişlerim</span>
      </Link>

      {/* Sipariş Sorgula */}
      <button
        onClick={() => {
          onClose();
          onOrderCheck();
        }}
        className="
          flex items-center gap-3 p-3 rounded-xl w-full
          bg-white/5 hover:bg-white/10 
          transition border border-white/10
        "
      >
        <PackageSearch className="text-blue-400 w-6 h-6" />
        <span className="text-gray-200 font-medium">Sipariş Sorgula</span>
      </button>

      <Link
        to="/favorites"
        onClick={onClose}
        className="
          flex items-center gap-3 p-3 rounded-xl
          bg-white/5 hover:bg-white/10 
          transition border border-white/10
        "
      >
        <Heart className="text-rose-400 w-6 h-6" />
        <span className="text-gray-200 font-medium">Favorilerim</span>
      </Link>

      {/* Mesajlar */}
      <Link
        to="/mesajlarim"
        onClick={onClose}
        className="
          flex items-center justify-between p-3 rounded-xl
          bg-white/5 hover:bg-white/10 
          transition border border-white/10
        "
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="text-blue-400 w-6 h-6" />
          <span className="text-gray-200 font-medium">Mesajlarım</span>
        </div>

        {localUnread > 0 && (
          <span
            className="
              bg-blue-500 text-white text-[11px]
              min-w-[22px] h-[22px]
              flex items-center justify-center
              rounded-full font-bold
              shadow-[0_0_12px_rgba(80,150,255,0.8)]
              border border-blue-300/40
              animate-pulse
            "
          >
            {localUnread}
          </span>
        )}
      </Link>

      {/* Admin */}
      {isAdmin && (
        <Link
          to="/admin"
          onClick={onClose}
          className="
            flex items-center gap-3 p-3 rounded-xl
            bg-yellow-500/10 hover:bg-yellow-500/20
            transition border border-yellow-500/40
            text-yellow-300 font-semibold
          "
        >
          <ShieldCheck className="w-6 h-6" />
          Admin Paneli
        </Link>
      )}

      {/* Çıkış */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          onClose();
          window.location.href = "/";
        }}
        className="
          flex w-full items-center gap-3 p-3 rounded-xl
          bg-red-500/10 hover:bg-red-500/20
          transition text-red-400
          font-medium border border-red-500/40
        "
      >
        <LogOut className="w-6 h-6" />
        Çıkış Yap
      </button>
    </div>
  </div>
</div>

  );
}
