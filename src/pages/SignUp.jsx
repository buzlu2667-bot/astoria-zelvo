import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsun...");
      setTimeout(() => navigate("/signin"), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleSignup}
        className="bg-neutral-900 p-8 rounded-xl shadow-lg w-96 flex flex-col gap-4 border border-neutral-700"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Kayıt Ol</h1>

        {error && (
          <p className="text-red-500 text-center bg-neutral-800 p-2 rounded">{error}</p>
        )}
        {message && (
          <p className="text-green-400 text-center bg-neutral-800 p-2 rounded">{message}</p>
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
              : "bg-gradient-to-r from-yellow-500 to-red-600 hover:opacity-90"
          } text-black font-semibold py-2 rounded transition`}
        >
          {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-2">
          Zaten hesabın var mı?{" "}
          <Link to="/signin" className="text-yellow-400 hover:underline">
            Giriş Yap
          </Link>
        </p>
      </form>
    </div>
  );
}
