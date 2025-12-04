// ✅ src/pages/admin/AdminUsers.jsx — Final Sürüm
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
const [filtered, setFiltered] = useState([]);


  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, address, total_spent, points, rewards, role"
        )
        .order("created_at", { ascending: false });

      if (error) console.error("❌ Kullanıcı verileri alınamadı:", error);
      else setUsers(data || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
  async function calculateRealSpent() {
    const updated = await Promise.all(
      users.map(async (u) => {
        const { data: orders } = await supabase
          .from("orders")
          .select("final_amount")
          .eq("user_id", u.id);

        const realSpent = (orders || []).reduce(
          (sum, o) => sum + Number(o.final_amount || 0),
          0
        );

        return {
          ...u,
          real_spent: realSpent,
          real_points: Math.floor(realSpent),
          real_rewards: Math.floor(realSpent / 20000),
        };
      })
    );

    setFiltered(updated);
  }

  if (users.length > 0) calculateRealSpent();
}, [users]);


  useEffect(() => {
  const q = search.toLowerCase().trim();

  if (!q) {
    setFiltered(users);
    return;
  }

  const f = users.filter((u) =>
    (u.full_name || "").toLowerCase().includes(q) ||
    (u.email || "").toLowerCase().includes(q) ||
    (u.phone || "").toLowerCase().includes(q) ||
    (u.address || "").toLowerCase().includes(q) ||
    (u.role || "").toLowerCase().includes(q) ||
    String(u.total_spent || "").includes(q) ||
    String(u.points || "").includes(q)
  );

  setFiltered(f);
}, [search, users]);


  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-400">
        ⏳ Kullanıcı bilgileri yükleniyor...
      </div>
    );
 

async function handleDelete(id, name) {
  if (!window.confirm(`⚠️ "${name}" adlı kullanıcıyı silmek istediğine emin misin?`))
    return;

  // 🔒 Admin'i silmeyi engelle (opsiyonel ama mantıklı)
  if (name.toLowerCase().includes("admin")) {
    alert("❌ Admin kullanıcı silinemez!");
    return;
  }

  try {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) throw error;

    // ✅ Tablodan kullanıcıyı anında kaldır
    setUsers((prev) => prev.filter((u) => u.id !== id));

    // ✅ Başarılı toast
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "✅ Kullanıcı silindi!" },
      })
    );
  } catch (err) {
    console.error("❌ Kullanıcı silme hatası:", err);
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "danger", text: "❌ Silme işlemi başarısız!" },
      })
    );
  }
}

    
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="relative max-w-7xl mx-auto bg-neutral-900 p-6 rounded-2xl shadow-xl border border-yellow-600/30 overflow-hidden group">
  {/* ✨ Kayan Altın Işık Efekti */}
  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-400/20 to-transparent 
      opacity-0 group-hover:opacity-40 animate-slideGlow blur-xl pointer-events-none transition-all duration-700"></div>

        <h1 className="text-2xl font-bold text-yellow-400 mb-6">
          👥 Kullanıcı Bilgileri & Puan Takip
        </h1>

        <input
  type="text"
  placeholder="🔍 Kullanıcı ara (ad, e-posta, telefon, adres...)"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="
    w-full mb-5 px-4 py-3 
    rounded-xl 
    bg-neutral-800 
    border border-neutral-700 
    focus:border-yellow-500 
    focus:ring-2 focus:ring-yellow-500/40
    outline-none 
    transition-all
    text-gray-200 
    placeholder-gray-500
    shadow-[0_0_20px_rgba(250,204,21,0.15)]
  "
/>


        {users.length === 0 ? (
          <p className="text-gray-400 text-center">
            Hiç kullanıcı bulunamadı.
          </p>
        ) : (
          <div className="relative overflow-x-auto rounded-xl border border-yellow-500/10 bg-neutral-900/60 shadow-inner overflow-hidden">
  {/* 💫 Kayan Altın Şerit */}
   <div className="absolute top-0 left-[-40%] w-[40%] h-full 
    bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent 
    animate-glowLine blur-2xl pointer-events-none mix-blend-screen"></div>


            <table className="w-full text-sm border-collapse">
              <thead className="border-b border-gray-700 text-gray-400">
                <tr>
                   <th className="py-2 px-2 text-center">Sil</th>
                  <th className="text-left py-2 px-2">Ad Soyad</th>
                  <th className="text-left py-2 px-2">E-posta</th>
                  <th className="text-left py-2 px-2">Telefon</th>
                  <th className="text-left py-2 px-2">Adres</th>
                  <th className="text-right py-2 px-2">Harcama</th>
                  <th className="text-right py-2 px-2">Puan</th>
                  <th className="text-right py-2 px-2">Hediye</th>
                  <th className="text-right py-2 px-2">Rol</th>
                </tr>
              </thead>

              <tbody>
              {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-800 hover:bg-white/5 transition-all"
                  >
                    <td className="px-2 text-center">
                      <button
                      onClick={() => handleDelete(u.id, u.full_name)}
                        className="text-red-500 hover:text-red-400 transition text-lg"
                         title="Kullanıcıyı Sil"
                        >
                             🗑️
                             </button>
                              </td>

                    <td className="py-3 px-2 font-semibold text-white">
                      {u.full_name || "-"}
                    </td>
                    <td className="px-2 text-gray-300">{u.email || "-"}</td>
                    <td className="px-2 text-gray-300">{u.phone || "-"}</td>
                    <td className="px-2 text-gray-400 truncate max-w-[300px]">
                      {u.address || "Adres belirtilmedi"}
                    </td>
                    <td className="text-right px-2 text-green-400 font-semibold">
                  {TRY(u.real_spent || 0)}
                    </td>
                    <td className="text-right px-2 text-yellow-400 font-semibold">
                  {u.real_points || 0}
                    </td>
                    <td className="text-right px-2 text-blue-400">
                  {u.real_rewards || 0} 🎁
                    </td>
                    <td className="text-right px-2 text-gray-400">
                      {u.role || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
<style jsx global>{`
  @keyframes glowLine {
    0% {
      transform: translateX(-100%);
      opacity: 0.3;
    }
    50% {
      transform: translateX(100%);
      opacity: 0.8;
    }
    100% {
      transform: translateX(200%);
      opacity: 0.3;
    }
  }

  .animate-glowLine {
    animation: glowLine 4s linear infinite;
  }
`}</style>

