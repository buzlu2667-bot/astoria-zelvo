import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const TRY = (n) =>
  Number(n || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

export default function Checkout() {
  const { cart, total, placeOrder, clearCart } = useCart();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [pay, setPay] = useState("iban");

  // Kupon sistemi
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const [ibanModal, setIbanModal] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Kullanıcıyı çek
  useEffect(() => {
    (async () => {
      const { data: ud } = await supabase.auth.getUser();
      const u = ud?.user;
      if (u) {
        setUser(u);
        setForm((f) => ({ ...f, email: u.email }));
      }
    })();
  }, []);

  // ⭐ SİPARİŞİ TAMAMLAMA
  const finishOrder = async () => {
    // Profil kaydet
    try {
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;

      if (user) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: form.name,
            phone: form.phone,
            address: form.address,
            role: "user",
          },
          { onConflict: "id" }
        );
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
    }

    // Sipariş oluştur
   const res = await placeOrder({
  full_name: form.name,
  phone: form.phone,
  email: form.email,
  address: form.address,
  note: form.note,
  payment_method: pay,

  // ⭐ ÖDEME YÖNTEMİNE GÖRE DURUMU AYARLA
  status: pay === "cod" ? "processing" : "awaiting_payment",

  coupon: discount > 0 ? coupon : null,
  discount_amount: discount,
  final_amount: total - discount,
});


    // order_items ekle
    if (res?.data?.id && cart?.length > 0) {
      const orderId = res.data.id;

      const orderItems = cart.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        custom_info: item.custom_info
          ? JSON.stringify(item.custom_info)
          : null,
      }));

      await supabase.from("order_items").insert(orderItems);
    }

    // Puan Güncelle
    try {
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user;
      if (user) {
        await supabase.rpc("update_user_points", {
          user_id: user.id,
          order_total: total - discount,
        });
      }
    } catch (err) {
      console.error("Puan güncelleme hatası:", err);
    }

    // Kupon kullanım arttır
    if (discount > 0 && coupon) {
      await supabase.rpc("increment_coupon", {
        code_input: coupon,
      });
    }

    nav("/orders");
  };

  // Kupon uygula
  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    const { data: c, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !c) {
      setDiscount(0);
      return toast("❌ Geçersiz kupon!");
    }

    if (!c.is_active) return toast("⛔ Kupon pasif!");
    if (c.used_count >= c.usage_limit) return toast("🚫 Limit dolmuş!");
    if (c.expires_at && new Date(c.expires_at) < new Date())
      return toast("⏳ Süresi dolmuş!");

    if (total < c.min_amount)
      return toast(`🔽 Minimum sepet: ${TRY(c.min_amount)}`);

    const d = c.type === "%" ? (total * c.value) / 100 : c.value;
    const fd = Math.min(d, total);
    setDiscount(fd);

    toast(`✅ Kupon uygulandı: -${TRY(fd)}`);
  };

  const toast = (text) =>
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "danger", text },
      })
    );

  // ⭐ Ön kontrol
  const validateBeforePayment = async () => {
    if (!user) {
      setMsg("Giriş yapmalısınız!");
      setTimeout(() => nav("/login"), 1500);
      return;
    }

    if (!form.name || !form.phone || !form.address) {
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
        {/* FORM */}
        <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-yellow-400">
            Teslimat Bilgileri
          </h2>

          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Ad Soyad *" value={form.name} onChange={(v) => change("name", v)} />
            <Input label="Telefon *" value={form.phone} onChange={(v) => change("phone", v)} />

            <Input
              label="E-posta (hesap)"
              value={form.email}
              onChange={() => {}}
              className="opacity-60 cursor-not-allowed"
            />

            <Input label="Adres *" value={form.address} onChange={(v) => change("address", v)} />
            <Textarea label="Not (opsiyonel)" value={form.note} onChange={(v) => change("note", v)} />
          </div>

          {/* ÖDEME */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-yellow-400">Ödeme Yöntemi</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <PayBtn disabled label="💳 Kredi Kartı (yakında)" />
              <PayBtn active={pay === "iban"} onClick={() => setPay("iban")} label="🏦 Havale / EFT" />
              <PayBtn active={pay === "cod"} onClick={() => setPay("cod")} label="🚚 Kapıda Ödeme" />
            </div>
          </div>

          {msg && <p className="mt-4 text-red-400 text-sm text-center">{msg}</p>}

          <button
            onClick={validateBeforePayment}
            className="mt-6 w-full bg-rose-600 hover:bg-rose-700 py-3 rounded-xl font-bold shadow-lg transition"
          >
            Siparişi Tamamla
          </button>
        </div>

        {/* ÖZET */}
        <Summary
          cart={cart}
          total={total}
          coupon={coupon}
          setCoupon={setCoupon}
          discount={discount}
          applyCoupon={applyCoupon}
          TRY={TRY}
        />
      </div>

      {/* IBAN MODAL */}
      {ibanModal && (
        <IbanModal
          close={() => setIbanModal(false)}
          finishOrder={finishOrder}
        />
      )}
    </div>
  );
}

/* ======== Components ======== */

function Summary({ cart, total, coupon, setCoupon, discount, applyCoupon, TRY }) {
  return (
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

      {/* Kupon */}
      <div className="mt-3 flex gap-2">
        <input
          placeholder="Kupon Kodu"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 outline-none text-sm"
        />
        <button
          onClick={applyCoupon}
          className="px-3 py-2 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition text-sm"
        >
          Uygula
        </button>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-sm text-emerald-400 mt-2">
          <span>İndirim</span>
          <span>-{TRY(discount)}</span>
        </div>
      )}

      <div className="mt-2 border-t pt-3 flex justify-between font-bold text-green-400 text-lg">
        <span>GENEL TOPLAM</span>
        <span>{TRY(total - discount)}</span>
      </div>
    </div>
  );
}

function IbanModal({ close, finishOrder }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center p-4 z-[99999]"
      onClick={close}
    >
      <div
        className="relative bg-neutral-950/90 border border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.4)] rounded-2xl p-7 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="absolute top-3 right-3 text-2xl hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-2xl font-extrabold text-center text-yellow-400 mb-4">
          🏦 Havale / EFT
        </h2>

        <div className="bg-neutral-800/60 rounded-lg p-4 border border-yellow-600/30">
          <p className="text-gray-300">
            <b>Hesap Sahibi:</b> Burak AGARAK
          </p>

          <p className="mt-1 text-gray-300">
            <b>IBAN:</b>
            <span
              className="bg-neutral-900 text-yellow-300 px-3 py-2 mt-1 block text-center rounded-lg tracking-wide font-mono cursor-pointer border border-yellow-600/20"
              onClick={() => {
                navigator.clipboard.writeText("TR66 0015 7000 0000 0095 7755 66");
                window.dispatchEvent(
                  new CustomEvent("toast", {
                    detail: { type: "success", text: "📋 IBAN kopyalandı!" },
                  })
                );
              }}
            >
              TR66 0015 7000 0000 0095 7755 66
            </span>
          </p>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Açıklamaya sipariş numarasını yazmayı unutma 💛
        </p>

        <button
          onClick={finishOrder}
          className="w-full mt-5 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 hover:scale-[1.03]"
        >
          ✅ Ödemeyi Tamamladım
        </button>
      </div>
    </div>
  );
}

/* Input components */
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
        active ? "border-yellow-500 bg-yellow-500/10" : "border-neutral-700 bg-neutral-800"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-yellow-500"}`}
    >
      {label}
    </button>
  );
}
