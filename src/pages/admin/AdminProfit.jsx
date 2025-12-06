import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Search, Calendar, DollarSign, FileDown } from "lucide-react";

export default function AdminProfit() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // ---------------------------------------------------------
  // 🔥 TÜM VERİLERİ YÜKLE
  // ---------------------------------------------------------
  useEffect(() => {
    load();
  }, []);

 async function load() {
  setLoading(true);

  // 1) Önce tüm siparişleri çek
  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at");

  if (!orders) return;

  const flat = [];

  // 2) Her siparişin ürünlerini order_items tablosundan çek
  for (const order of orders) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, product_name, unit_price, quantity")
      .eq("order_id", order.id);

    if (!items) continue;

    for (const it of items) {
      // Ürün maliyetini products tablosundan al
      const { data: prod } = await supabase
        .from("products")
        .select("cost_price")
        .eq("id", it.product_id)
        .single();

      const cost = Number(prod?.cost_price || 0);

      flat.push({
          id: it.id,    
        date: order.created_at.split("T")[0],
        month: order.created_at.substring(0, 7),
        name: it.product_name,
        sell_price: Number(it.unit_price) * Number(it.quantity),
        cost_price: cost,
        qty: Number(it.quantity),
      });
    }
  }

  setRows(flat);
  setFiltered(flat);
  setLoading(false);
}


  // ---------------------------------------------------------
  // 🔥 FİLTRE TABLOLARI
  // ---------------------------------------------------------
  const dailyRows = rows.filter((x) => x.date === dateFilter);
  const monthlyRows = rows.filter((x) => x.month === monthFilter);

  // ---------------------------------------------------------
  // 🔥 KÂR HESAPLARI
  // ---------------------------------------------------------
  const totalDailyProfit = dailyRows.reduce(
    (a, b) => a + (b.sell_price - b.cost_price),
    0
  );

  const totalMonthlyProfit = monthlyRows.reduce(
    (a, b) => a + (b.sell_price - b.cost_price),
    0
  );

  const totalProfit = rows.reduce(
    (a, b) => a + (b.sell_price - b.cost_price),
    0
  );

  // ---------------------------------------------------------
  // 🔥 PDF EXPORT
  // ---------------------------------------------------------
function exportPDF(title, items, totalProfitValue) {
  const w = window.open("", "_blank");

  w.document.write(`
    <html>
    <head>
 
      <style>
        body { font-family: Arial; padding: 25px; }
        h1 { margin-bottom: 10px; }
        p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; border: 1px solid #444; }
        th { background: #eee; }
      </style>
    </head>
    <body>

      <!-- 🔥 LOGO + MARKA BAŞLIĞI -->
      <div style="text-align:center; margin-bottom:20px;">
        <img src="/maximora-logo.png" style="width:140px; margin-bottom:5px;" />
        <h1 style="margin:0; font-size:24px; font-weight:bold;">MAXIMORA</h1>
       
      </div>

      <h2>${title}</h2>
      <p><b>Oluşturma:</b> ${new Date().toLocaleString("tr-TR")}</p>
      <p><b>Toplam Kâr:</b> ${totalProfitValue.toFixed(2)} TL</p>

      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Ürün</th>
            <th>Satış</th>
            <th>Maliyet</th>
            <th>Kâr</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (r) => `
            <tr>
              <td>${r.date}</td>
              <td>${r.name}</td>
              <td>${r.sell_price.toFixed(2)} TL</td>
              <td>${r.cost_price.toFixed(2)} TL</td>
              <td>${(r.sell_price - r.cost_price).toFixed(2)} TL</td>
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


  // ---------------------------------------------------------
  // 🔥 UI
  // ---------------------------------------------------------
  return (
    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <DollarSign size={32} className="text-green-400" />
        Kâr Yönetimi
      </h1>

      {/* ------------------- KÂR KUTULARI ------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="p-4 rounded-xl bg-[#0f1a0f] border border-green-800">
          <p className="text-lg">Genel Toplam Kâr</p>
          <p className="text-3xl font-bold text-green-400">
            {totalProfit.toFixed(2)} TL
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0f0f1a] border border-blue-800">
          <p className="text-lg">Günlük Kâr</p>
          <p className="text-3xl font-bold text-blue-400">
            {totalDailyProfit.toFixed(2)} TL
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#1a0f0f] border border-red-800">
          <p className="text-lg">Aylık Kâr</p>
          <p className="text-3xl font-bold text-red-400">
            {totalMonthlyProfit.toFixed(2)} TL
          </p>
        </div>

      </div>

      {/* ------------------- GÜNLÜK BÖLÜM ------------------- */}
      <div className="mb-6 p-4 border border-[#333] rounded-xl bg-[#0b0b0b]">
        <h2 className="text-xl font-bold mb-2">Günlük Kâr Raporu</h2>

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
                `GÜNLÜK KÂR RAPORU (${dateFilter})`,
                dailyRows,
                totalDailyProfit
              )
            }
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl"
          >
            <FileDown size={18} /> Günlük PDF
          </button>
        </div>

        {dailyRows.length === 0 ? (
          <p className="text-gray-500">Bu güne ait satış bulunamadı.</p>
        ) : (
          <table className="min-w-full text-sm mt-2">
            <thead>
              <tr className="text-gray-300 bg-[#111]">
                <th className="p-2">Tarih</th>
                <th className="p-2 text-left">Ürün</th>
                <th className="p-2 text-center">Satış</th>
                <th className="p-2 text-center">Maliyet</th>
                <th className="p-2 text-center">Kâr</th>
                <th className="p-2 text-center">Sil</th>
              </tr>
            </thead>
            <tbody>
              {dailyRows.map((r, i) => (
                <tr key={i} className="border-b border-[#222]">
                  <td className="p-2">{r.date}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2 text-green-400 text-center">
                    {r.sell_price} TL
                  </td>
                  <td className="p-2 text-center">{r.cost_price} TL</td>
                  <td className="p-2 text-blue-400 text-center">
                    {(r.sell_price - r.cost_price).toFixed(2)} TL

                        
                  </td>

                        <td className="p-2 text-center">
        <button
          onClick={() => deleteItem(r.id)}
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

      {/* ------------------- AYLIK BÖLÜM ------------------- */}
      <div className="mb-6 p-4 border border-[#333] rounded-xl bg-[#0b0b0b]">
        <h2 className="text-xl font-bold mb-2">Aylık Kâr Raporu</h2>

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
                `AYLIK KÂR RAPORU (${monthFilter})`,
                monthlyRows,
                totalMonthlyProfit
              )
            }
            className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-xl"
          >
            <FileDown size={18} /> Aylık PDF
          </button>
        </div>

        {monthlyRows.length === 0 ? (
          <p className="text-gray-500">Bu aya ait satış bulunamadı.</p>
        ) : (
          <table className="min-w-full text-sm mt-2">
            <thead>
              <tr className="text-gray-300 bg-[#111]">
                <th className="p-2">Tarih</th>
                <th className="p-2 text-left">Ürün</th>
                <th className="p-2 text-center">Satış</th>
                <th className="p-2 text-center">Maliyet</th>
                <th className="p-2 text-center">Kâr</th>
                <th className="p-2 text-center">Sil</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((r, i) => (
                <tr key={i} className="border-b border-[#222]">
                  <td className="p-2">{r.date}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2 text-green-400 text-center">
                    {r.sell_price} TL
                  </td>
                  <td className="p-2 text-center">{r.cost_price} TL</td>
                  <td className="p-2 text-blue-400 text-center">
                    {(r.sell_price - r.cost_price).toFixed(2)} TL
                  </td>

                       <td className="p-2 text-center">
        <button
          onClick={() => deleteItem(r.id)}
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

      {loading && <p className="text-gray-500">Yükleniyor...</p>}
    </div>
  );
}
