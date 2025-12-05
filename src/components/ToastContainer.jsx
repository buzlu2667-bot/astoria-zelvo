// src/components/ToastContainer.jsx
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Math.random().toString(36);
      const toast = { id, ...e.detail };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 3000);
    };

    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  const icons = {
    success: <CheckCircle className="text-green-500 w-6 h-6" />,
    error: <XCircle className="text-red-500 w-6 h-6" />,
    info: <Info className="text-blue-500 w-6 h-6" />,
  };

  return (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-3 items-center">

      {toasts.map((t) => (
        <div
          key={t.id}
          className="
            flex items-center gap-3 px-4 py-3 rounded-xl
            shadow-lg backdrop-blur-md border
            animate-toastSlide 
            bg-white/90 border-gray-200 text-gray-800
            dark:bg-black/80 dark:border-gray-700 dark:text-gray-200
          "
        >
          {icons[t.type]}
          <span className="text-sm font-medium">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
