import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { DollarSign, FileDown } from "lucide-react";

export default function AdminSales() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data: orders } = await supabase
      .from("orders")
      .select("id, created_at");

    if (!orders) return;

    const flat = [];

    for (const order of orders) {
      const { data: items } = await supabase
        .from("order_items")
        .select("id, product_name, unit_price, quantity")
        .eq("order_id", order.id);

      if (!items) continue;

      for (const it of items) {
        flat.push({
          id: it.id,
          date: order.created_at.split("T")[0],
          month: order.created_at.substring(0, 7),
          name: it.product_name,
          price: Number(it.unit_price),
          qty: Number(it.quantity),
          total: Number(it.unit_price) * Number(it.quantity),
        });
      }
    }

    setRows(flat);
    setLoading(false);
  }

  // 🔥 SİL FONKSİYONU
  async function deleteSale(id) {
    const yes = confirm("Bu satış kaydını silmek istediğine emin misin?");
    if (!yes) return;

    await supabase.from("order_items").delete().eq("id", id);

    load();
  }

  const dailyRows = rows.filter((x) => x.date === dateFilter);
  const monthlyRows = rows.filter((x) => x.month === monthFilter);

  const totalDailySales = dailyRows.reduce((a, b) => a + b.total, 0);
  const totalMonthlySales = monthlyRows.reduce((a, b) => a + b.total, 0);
  const totalSales = rows.reduce((a, b) => a + b.total, 0);

  function exportPDF(title, items, totalValue) {
    const w = window.open("", "_blank");

    w.document.write(`
      <html>
      <head>
        <style>
          body { font-family: Arial; padding: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px; border: 1px solid #444; }
          th { background: #eee; }
        </style>
      </head>
      <body>

        <div style="text-align:center; margin-bottom:20px;">
          <img src="/maximora-logo.png" style="width:140px; margin-bottom:5px;" />
          <h1 style="margin:0; font-size:24px; font-weight:bold;">MAXIMORA</h1>
        </div>

        <h2>${title}</h2>
        <p><b>Oluşturma:</b> ${new Date().toLocaleString("tr-TR")}</p>
        <p><b>Toplam Satış:</b> ${totalValue.toFixed(2)} TL</p>

        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Ürün</th>
              <th>Adet</th>
              <th>Birim Fiyat</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (r) => `
                  <tr>
                    <td>${r.date}</td>
                    <td>${r.name}</td>
                    <td>${r.qty}</td>
                    <td>${r.price} TL</td>
                    <td>${r.total} TL</td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);

    w.document.close();
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <DollarSign size={32} className="text-yellow-400" />
        Satış Yönetimi
      </h1>

      {/* ------------------- KUTULAR ------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-[#1a1a0f] border border-yellow-700">
          <p className="text-lg">Genel Toplam Satış</p>
          <p className="text-3xl font-bold text-yellow-400">
            {totalSales} TL
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1a1a] border border-blue-700">
          <p className="text-lg">Günlük Satış</p>
          <p className="text-3xl font-bold text-blue-300">
            {totalDailySales} TL
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#1a0f1a] border border-purple-700">
          <p className="text-lg">Aylık Satış</p>
          <p className="text-3xl font-bold text-purple-300">
            {totalMonthlySales} TL
          </p>
        </div>
      </div>

      {/* ------------------- GÜNLÜK TABLO ------------------- */}
      <div className="mb-6 p-4 border border-[#333] rounded-xl bg-[#0b0b0b]">
        <h2 className="text-xl font-bold mb-2">Günlük Satış Raporu</h2>

        <div className="flex items-center gap-3 mb-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#111] border border-[#444] p-2 rounded-lg text-white"
          />

          <button
            onClick={() =>
              exportPDF(
                `GÜNLÜK SATIŞ RAPORU (${dateFilter})`,
                dailyRows,
                totalDailySales
              )
            }
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl"
          >
            <FileDown size={18} /> Günlük PDF
          </button>
        </div>

        {dailyRows.length === 0 ? (
          <p className="text-gray-500">Bu güne ait satış yok.</p>
        ) : (
          <table className="min-w-full text-sm mt-2">
            <thead>
              <tr className="text-gray-300 bg-[#111]">
                <th className="p-2">Tarih</th>
                <th className="p-2 text-left">Ürün</th>
                <th className="p-2 text-center">Adet</th>
                <th className="p-2 text-center">Birim</th>
                <th className="p-2 text-center">Toplam</th>
                <th className="p-2 text-center">Sil</th>
              </tr>
            </thead>

            <tbody>
              {dailyRows.map((r, i) => (
                <tr key={i} className="border-b border-[#222]">
                  <td className="p-2">{r.date}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2 text-center">{r.qty}</td>
                  <td className="p-2 text-center">{r.price} TL</td>
                  <td className="p-2 text-green-400 text-center">{r.total} TL</td>

                  {/* 🔥 SİL BUTTON */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteSale(r.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ------------------- AYLIK TABLO ------------------- */}
      <div className="mb-6 p-4 border border-[#333] rounded-xl bg-[#0b0b0b]">
        <h2 className="text-xl font-bold mb-2">Aylık Satış Raporu</h2>

        <div className="flex items-center gap-3 mb-3">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-[#111] border border-[#444] p-2 rounded-lg text-white"
          />

          <button
            onClick={() =>
              exportPDF(
                `AYLIK SATIŞ RAPORU (${monthFilter})`,
                monthlyRows,
                totalMonthlySales
              )
            }
            className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-xl"
          >
            <FileDown size={18} /> Aylık PDF
          </button>
        </div>

        {monthlyRows.length === 0 ? (
          <p className="text-gray-500">Bu aya ait satış yok.</p>
        ) : (
          <table className="min-w-full text-sm mt-2">
            <thead>
              <tr className="text-gray-300 bg-[#111]">
                <th className="p-2">Tarih</th>
                <th className="p-2 text-left">Ürün</th>
                <th className="p-2 text-center">Adet</th>
                <th className="p-2 text-center">Birim</th>
                <th className="p-2 text-center">Toplam</th>
                <th className="p-2 text-center">Sil</th>
              </tr>
            </thead>

            <tbody>
              {monthlyRows.map((r, i) => (
                <tr key={i} className="border-b border-[#222]">
                  <td className="p-2">{r.date}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2 text-center">{r.qty}</td>
                  <td className="p-2 text-center">{r.price} TL</td>
                  <td className="p-2 text-purple-400 text-center">{r.total} TL</td>

                  {/* 🔥 SİL BUTTON */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteSale(r.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
