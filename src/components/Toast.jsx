import { useEffect, useState } from "react";

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const toast = e.detail;
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 3500); // ✅ Premium süre (daha yumuşak süre)
    };

    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  return (
    <>
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((toast, i) => (
          <div
            key={i}
            className={`toast-box ${toast.type === "success" ? "success" : "danger"}`}
          >
           {toast.type === "success" ? "✨" : "⚠️"} {toast.text}

          </div>
        ))}
      </div>

      {/* ✅ Premium Style */}
     <style>{`
.toast-box {
  position: relative;
  background: linear-gradient(135deg, #110016, #1c0124);
  border: 1px solid rgba(180, 100, 255, 0.55);
  padding: 13px 22px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: .35px;
  color: #f4e7ff;
  overflow: hidden;

  backdrop-filter: blur(16px);
  box-shadow: 0 0 28px rgba(160, 60, 255, 0.40);

  transform: translateX(150%) scale(.95);
  opacity: 0;
  animation: toastIn 0.75s cubic-bezier(.25,1.15,.35,1) forwards;
}

/* ✨ Violet Light Sweep */
.toast-box::before {
  content: "";
  position: absolute;
  top: 0; left: -75%;
  width: 65%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(200,100,255,.45), transparent);
  transform: skewX(-28deg);
  animation: shine 3.4s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -75%; }
  50% { left: 130%; }
  100% { left: 130%; }
}

/* SUCCESS = GOLD VIOLET GLOW */
.toast-box.success {
  border-color: rgba(255, 215, 0, 0.65);
  box-shadow: 0 0 32px rgba(255, 215, 0, 0.42);
}

/* ERROR = VIOLET RED GLOW */
.toast-box.danger {
  border-color: rgba(255, 80, 140, .70);
  box-shadow: 0 0 32px rgba(255, 20, 95, .42);
}

/* Entrance premium bounce */
@keyframes toastIn {
  0% { transform: translateX(150%) scale(.88); opacity: 0; }
  60% { transform: translateX(-8%) scale(1.04); opacity: 1; }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}
`}</style>


    </>
  );
}
