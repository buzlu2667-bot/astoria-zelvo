// 📄 src/components/AccountModal.jsx — TRENDYOL SADE PREMIUM V2
import { X, User2, Heart, PackageSearch, ShieldCheck, LogOut, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";

export default function AccountModal({ open, onClose, session, isAdmin, onOrderCheck, unreadCount }) {

  const [localUnread, setLocalUnread] = useState(0);
  const initialUnread = Number(unreadCount || 0);

  // 🟦 Modal açılınca mesajları çek
  useEffect(() => {
    if (!open) return;

    async function fetchUnread() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`is_global.eq.true,user_id.eq.${user.id}`)
        .eq("is_read", false)
        .eq("hidden_by_user", false);

      if (!error) setLocalUnread(data.length);
    }

    setLocalUnread(initialUnread);
    fetchUnread();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[99999] flex items-center justify-center
        bg-black/60 backdrop-blur-md animate-fadeIn
      "
      onClick={onClose}
    >
      <div
        className="
          w-[92%] max-w-sm bg-[#0d0d0d]/90 rounded-2xl relative
          border border-white/10 shadow-xl animate-scaleIn
        "
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-yellow-400"
        >
          <X className="w-6 h-6" />
        </button>

        {/* USER HEADER */}
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="
                w-12 h-12 rounded-xl flex items-center justify-center
                bg-yellow-400/90 text-black font-bold text-xl
                shadow-[0_0_20px_rgba(255,215,0,0.4)]
              "
            >
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>

            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Hesap</span>
              <span className="text-gray-200 font-medium text-sm">{session?.user?.email}</span>
            </div>
          </div>
        </div>

        {/* MENU LIST */}
        <div className="p-4 space-y-2">

          {/* Profilim */}
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition"
          >
            <User2 className="w-5 h-5 text-purple-400" />
            <span className="text-gray-200 text-[14px]">Profilim</span>
          </Link>

          {/* Siparişlerim */}
          <Link
            to="/orders"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition"
          >
            <PackageSearch className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-200 text-[14px]">Siparişlerim</span>
          </Link>

          {/* Sipariş Sorgula */}
          <button
            onClick={() => {
              onClose();
              onOrderCheck();
            }}
            className="flex items-center gap-3 p-3 rounded-xl w-full hover:bg-white/5 transition"
          >
            <PackageSearch className="w-5 h-5 text-blue-400" />
            <span className="text-gray-200 text-[14px]">Sipariş Sorgula</span>
          </button>

          {/* Favorilerim */}
          <Link
            to="/favorites"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition"
          >
            <Heart className="w-5 h-5 text-rose-400" />
            <span className="text-gray-200 text-[14px]">Favorilerim</span>
          </Link>

          {/* Mesajlar */}
          <Link
            to="/mesajlarim"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span className="text-gray-200 text-[14px]">Mesajlarım</span>
            </div>

            {localUnread > 0 && (
              <span
                className="
                  bg-blue-500 text-white text-[11px] min-w-[20px] h-[20px]
                  flex items-center justify-center rounded-full font-semibold
                  shadow-[0_0_10px_rgba(80,150,255,0.7)]
                "
              >
                {localUnread}
              </span>
            )}
          </Link>

          {/* Admin Panel */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="
                flex items-center gap-3 p-3 rounded-xl
                hover:bg-yellow-500/10 border border-yellow-500/20
                text-yellow-300 text-[14px] font-medium
              "
            >
              <ShieldCheck className="w-5 h-5" />
              Admin Paneli
            </Link>
          )}

          {/* Çıkış Yap */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              onClose();
              window.location.href = "/";
            }}
            className="
              flex items-center gap-3 p-3 rounded-xl w-full
              hover:bg-red-500/10 text-red-400 text-[14px]
              border border-red-500/20
            "
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>

        </div>
      </div>
    </div>
  );
}
