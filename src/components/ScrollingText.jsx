import { useEffect, useRef } from "react";

export default function ScrollingText({ data }) {
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const textEl = textRef.current;
    const containerEl = containerRef.current;
    if (!textEl || !containerEl) return;

    let x = containerEl.offsetWidth; // ✅ sağdan başla
    let rafId;
    let lastTime = performance.now();

    const speed = Number(data.speed) || 1; // 🔒 PANEL HIZI AYNEN

    const animate = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      // ✅ FPS bağımsız, smooth hareket
      x -= speed * (delta / 16.67);

      const textWidth = textEl.offsetWidth;
      const containerWidth = containerEl.offsetWidth;

      // ✅ TAMAMEN soldan çıktıysa → SAĞDAN TEKRAR GİR
      if (x <= -textWidth) {
        x = containerWidth;
      }

      // ✅ GPU FORCE (mobil kasmayı BİTİRİR)
      textEl.style.transform = `translate3d(${x}px, 0, 0)`;

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [data.speed]);

  return (
    <div
      ref={containerRef}
      className="scrolling-text-wrapper"
      style={{
        backgroundColor: data.bg_color || "#000",
        color: data.text_color || "#fff",
        height: `${data.height_px || 40}px`,
      }}
    >
      <span ref={textRef} className="scrolling-text">
        {data.text}
      </span>
    </div>
  );
}
