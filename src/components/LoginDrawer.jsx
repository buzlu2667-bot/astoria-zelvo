import { useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabaseClient";

export default function LoginDrawer({ open, setOpen, onForgot, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ESC & body scroll kontrol
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email: (email || "").trim(),
      password: password || "",
    });

    setLoading(false);

    if (error) setErrorMsg(error.message);
    else {
      setOpen(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] ${open ? "" : "pointer-events-none"}`}>
      {/* Arka plan blur + gölge */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 backdrop-blur-xl bg-black/60 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-[380px] max-w-[90vw]
        backdrop-blur-2xl bg-[rgba(20,20,20,0.92)]
        border-l border-yellow-500/40 shadow-[0_0_50px_rgba(255,215,0,0.25)]
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-yellow-400">Giriş Yap</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 hover:bg-white/5 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          <div>
            <label className="text-sm text-gray-400">E-posta</label>
            <input
              type="email"
              className="mt-1 w-full p-3 rounded bg-gray-850 border border-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Şifre</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="mt-1 w-full p-3 rounded bg-gray-850 border border-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            <button
  type="button"
  onMouseDown={(e) => e.preventDefault()}
  onClick={() => setShowPass(!showPass)}
  className="absolute right-3 top-3 text-gray-400 hover:text-yellow-300 transition"
>
  {showPass ? (
    <EyeSlashIcon className="w-6 h-6" />
  ) : (
    <EyeIcon className="w-6 h-6" />
  )}
</button>





            </div>
          </div>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-rose-400 text-black font-semibold py-3 rounded hover:brightness-110 transition"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          <div className="flex items-center justify-between text-sm text-gray-300">
            <button onClick={onForgot} type="button" className="hover:text-yellow-300">
              Şifremi Unuttum
            </button>
            <button onClick={onSignup} type="button" className="hover:text-yellow-300">
              Kayıt Ol
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
