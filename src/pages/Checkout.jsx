import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

export default function Checkout() {
  const { cart, total, placeOrder } = useCart();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [pay, setPay] = useState("iban");
  const [ibanModal, setIbanModal] = useState(false);
  const [msg, setMsg] = useState("");

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const finishOrder = async () => {
    const res = await placeOrder({
      full_name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      note: form.note,
      payment_method: pay,
    });

    if (res?.error) {
      setMsg("Hata: " + res.error);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", text: "✅ Sipariş oluşturuldu!" },
      })
    );

    nav("/orders");
  };

  const validateBeforePayment = () => {
    if (!form.name || !form.phone || !form.email || !form.address) {
      setMsg("Lütfen zorunlu alanları doldurun.");
      return;
    }

    if (cart.length === 0) {
      setMsg("Sepetiniz boş.");
      return;
    }

    if (pay === "iban") {
      setIbanModal(true);
    } else {
      finishOrder();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Ödeme</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ✅ FORM */}
        <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-yellow-400">
            Teslimat Bilgileri
          </h2>

          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Ad Soyad *" value={form.name} onChange={(v) => change("name", v)} />
            <Input label="Telefon *" value={form.phone} onChange={(v) => change("phone", v)} />
            <Input label="E-posta *" value={form.email} onChange={(v) => change("email", v)} />
            <Input label="Adres *" value={form.address} onChange={(v) => change("address", v)} />
            <Textarea className="md:col-span-2" label="Not (opsiyonel)" value={form.note} onChange={(v) => change("note", v)} />
          </div>

          {/* ✅ ÖDEME TİPİ */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-yellow-400">Ödeme Yöntemi</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <PayBtn disabled label="💳 Kredi Kartı (yakında)" />
              <PayBtn active={pay === "iban"} onClick={() => setPay("iban")} label="🏦 IBAN" />
              <PayBtn active={pay === "cod"} onClick={() => setPay("cod")} label="🚚 Kapıda Ödeme" />
            </div>
          </div>

          {msg && (
            <p className="mt-4 text-red-400 text-sm text-center">
              {msg}
            </p>
          )}

          <button
            onClick={validateBeforePayment}
            className="mt-6 w-full bg-rose-600 hover:bg-rose-700 py-3 rounded-xl font-bold shadow-lg transition"
          >
            Siparişi Tamamla
          </button>

          <p className="text-xs text-gray-500 mt-3">Sipariş verince şartları kabul etmiş olursunuz.</p>
        </div>

        {/* ✅ SİPARİŞ ÖZET */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 h-fit shadow-xl">
          <h3 className="font-semibold mb-3 text-yellow-400">Sipariş Özeti</h3>
          <div className="space-y-2">
            {cart.map((it) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span>{it.name} × {it.quantity}</span>
                <span>{TRY((it.price || 0) * (it.quantity || 1))}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-3 flex justify-between font-bold text-yellow-300">
            <span>Toplam</span>
            <span>{TRY(total)}</span>
          </div>
        </div>
      </div>

      {/* ✅ IBAN MODAL */}
      {ibanModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-[99999] backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-yellow-600/20 shadow-xl animate-slide-in relative">

            <button
              onClick={() => setIbanModal(false)}
              className="absolute top-3 right-3 text-xl hover:text-red-500"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-yellow-400 mb-4">
              Ödeme Bilgileri
            </h2>

            <p className="mb-1">
              <b>IBAN:</b> TR12 3456 7890 1234 5678 9012 34
            </p>
            <p>
              <b>Hesap Sahibi:</b> ELITEMART TİC LTD
            </p>

            <button
              className="mt-4 px-3 py-2 rounded bg-yellow-500 text-black font-bold w-full"
              onClick={() => {
                navigator.clipboard.writeText("TR123456789012345678901234");
                window.dispatchEvent(
                  new CustomEvent("toast", {
                    detail: { type: "success", text: "📋 IBAN kopyalandı!" },
                  })
                );
              }}
            >
              📋 IBAN Kopyala
            </button>

            <button
              onClick={() => {
                setIbanModal(false);
                finishOrder();
              }}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold shadow-lg"
            >
              ✅ Ödemeyi Yaptım
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Havale/EFT açıklamasına sipariş numaranızı yazınız.
            </p>
          </div>
        </div>
      )}

      <p className="text-center text-gray-600 text-xs mt-10 opacity-60">
        © {new Date().getFullYear()} ELITEMART — Güvenli Alışveriş
      </p>
    </div>
  );
}

/* =====================================================
   ✅ Form Components (değişmedi)
===================================================== */

function Input({ label, value, onChange, className = "" }) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="block mb-1 text-gray-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 outline-none"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, className = "" }) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="block mb-1 text-gray-300">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 outline-none"
      />
    </label>
  );
}

function PayBtn({ active, onClick, label, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-3 rounded-xl border text-left ${
        active
          ? "border-yellow-500 bg-yellow-500/10"
          : "border-neutral-700 bg-neutral-800"
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-yellow-500"
      }`}
    >
      {label}
    </button>
  );
}
