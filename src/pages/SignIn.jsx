import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // ✅ Login başarılıysa yönlendirme
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-900 p-8 rounded-xl shadow-lg w-96 flex flex-col gap-4 border border-neutral-700"
      >
        <h1 className="text-2xl font-bold text-center">Giriş Yap</h1>
        {error && (
          <p className="text-red-500 text-center bg-neutral-800 p-2 rounded">
            {error}
          </p>
        )}
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading
              ? "bg-neutral-600"
              : "bg-gradient-to-r from-red-600 to-yellow-500 hover:opacity-90"
          } text-black font-semibold py-2 rounded transition`}
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-2">
          Hesabın yok mu?{" "}
          <Link to="/signup" className="text-yellow-400 hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </form>
    </div>
  );
}
