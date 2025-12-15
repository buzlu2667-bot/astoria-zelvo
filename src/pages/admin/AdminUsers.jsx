// ✅ src/pages/admin/AdminUsers.jsx — CLEAN WHITE UI FINAL
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

  // ------------------------------
  // Kullanıcıları çek
  // ------------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
  "id, full_name, email, phone, address, total_spent, points, rewards, role, is_online, last_seen"
)

        .order("created_at", { ascending: false });

      if (!error) setUsers(data || []);
      setLoading(false);
    })();
  }, []);


  // ------------------------------
// 🔄 10 sn'de bir online durum yenile
// ------------------------------
useEffect(() => {
  const interval = setInterval(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, phone, address, total_spent, points, rewards, role, last_seen"
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  }, 10000); // 10 saniye

  return () => clearInterval(interval);
}, []);


  // ------------------------------
  // Harcama / puan / hediye hesaplama
  // ------------------------------
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

  // ------------------------------
  // Arama filtresi
  // ------------------------------
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

  // ------------------------------
  // Kullanıcı sil
  // ------------------------------
  async function handleDelete(id, name) {
    if (!window.confirm(`⚠️ "${name}" adlı kullanıcı silinsin mi?`)) return;

    if (name.toLowerCase().includes("admin")) {
      alert("❌ Admin kullanıcı silinemez!");
      return;
    }

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;

      setUsers((prev) => prev.filter((u) => u.id !== id));

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", text: "✅ Kullanıcı silindi!" },
        })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "danger", text: "❌ Silme işlemi hatası!" },
        })
      );
    }
  }
 
  // ------------------------------
// ONLINE KULLANICI SAYISI
// ------------------------------
const onlineCount = users.filter(
  (u) =>
    u.last_seen &&
    Date.now() - new Date(u.last_seen).getTime() < 60000
).length;


  // ------------------------------
  // LOADING
  // ------------------------------
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        ⏳ Kullanıcılar yükleniyor...
      </div>
    );

  // ------------------------------
  // UI — WHITE CLEAN PANEL
  // ------------------------------
  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 shadow-md p-6 rounded-xl">

        <h1 className="text-3xl font-bold mb-6">👥 Kullanıcı Bilgileri</h1>

        <div className="mb-6">
  <span className="inline-block bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 font-semibold">
    👤 Toplam kayıtlı kullanıcı: {users.length}
  </span>
</div>

   <div className="mb-6">
  <span className="inline-block bg-green-50 border border-green-300 rounded-lg px-4 py-2 text-green-700 font-semibold">
    🟢 Şu an online: {onlineCount}
  </span>
</div>



        {/* ARAMA */}
        <input
          type="text"
          placeholder="Kullanıcı ara (ad, e-posta, telefon...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full mb-6 px-4 py-3
            rounded-lg border border-gray-300
            bg-white text-gray-900
            placeholder-gray-500
            focus:ring-2 focus:ring-orange-300
            outline-none
          "
        />

        {/* TABLO */}
        <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="py-2 px-3 text-center">Durum</th>
                <th className="py-2 px-3 text-center">Sil</th>
                <th className="py-2 px-3 text-left">Ad Soyad</th>
                <th className="py-2 px-3 text-left">E-posta</th>
                <th className="py-2 px-3 text-left">Telefon</th>
                <th className="py-2 px-3 text-left">Adres</th>
                <th className="py-2 px-3 text-right">Harcama</th>
                <th className="py-2 px-3 text-right">Puan</th>
                <th className="py-2 px-3 text-right">Hediye</th>
                <th className="py-2 px-3 text-right">Rol</th>
              </tr>
            </thead>

        <tbody>
  {filtered.map((u) => {
  const isOnline =
    u.last_seen &&
    Date.now() - new Date(u.last_seen).getTime() < 60000;

  return (
    <tr key={u.id}>
      <td className="py-3 px-3 text-center">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
          }`}
          title={
            isOnline
              ? "Şu an sitede"
              : u.last_seen
              ? `Son görülme: ${new Date(u.last_seen).toLocaleString("tr-TR")}`
              : "Offline"
          }
        />
      </td>


        {/* SİL */}
        <td className="py-3 px-3 text-center">
          <button
            onClick={() => handleDelete(u.id, u.full_name)}
            className="text-red-500 hover:text-red-600 text-lg"
          >
            🗑️
          </button>
        </td>

        <td className="py-3 px-3 font-semibold text-gray-900">
          {u.full_name || "-"}
        </td>
        <td className="px-3 text-gray-800">{u.email || "-"}</td>
        <td className="px-3 text-gray-800">{u.phone || "-"}</td>

        <td className="px-3 text-gray-700 truncate max-w-[230px]">
          {u.address || "Adres belirtilmedi"}
        </td>

        <td className="px-3 text-right text-green-600 font-bold">
          {TRY(u.real_spent || 0)}
        </td>

        <td className="px-3 text-right text-yellow-600 font-bold">
          {u.real_points || 0}
        </td>

        <td className="px-3 text-right text-blue-600 font-semibold">
          {u.real_rewards || 0} 🎁
        </td>

        <td className="px-3 text-right text-gray-700">
          {u.role || "-"}
        </td>
      </tr>
    );
  })}
</tbody>


          </table>
        </div>

      </div>
    </div>
  );
}
