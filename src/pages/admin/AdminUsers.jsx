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
      <div className="max-w-7xl mx-auto bg-neutral-900 p-6 rounded-2xl shadow-xl border border-purple-500/30">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">
          👥 Kullanıcı Bilgileri & Puan Takip
        </h1>

        {users.length === 0 ? (
          <p className="text-gray-400 text-center">
            Hiç kullanıcı bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
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
                {users.map((u) => (
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
                      {TRY(u.total_spent || 0)}
                    </td>
                    <td className="text-right px-2 text-yellow-400 font-semibold">
                      {u.points || 0}
                    </td>
                    <td className="text-right px-2 text-blue-400">
                      {u.rewards || 0} 🎁
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
