import { useEffect, useRef } from "react";

export default function ScrollingText({ data }) {
  const textRef = useRef(null);
  const containerRef = useRef(null);

 useEffect(() => {
  if (!textRef.current || !containerRef.current) return;

  let x = containerRef.current.offsetWidth; // ✅ sağdan başlasın
  let rafId;
  let lastTime = performance.now();

  const speed = Number(data.speed) || 1; // panel hızı aynen

  const animate = (now) => {
    const delta = now - lastTime;
    lastTime = now;

    x -= speed * (delta / 16.67); // ✅ SAĞDAN SOLA AKIŞ

    const textWidth = textRef.current.offsetWidth;
    const containerWidth = containerRef.current.offsetWidth;

    // ✅ tamamen soldan çıktıysa, sağa geri al
    if (x < -textWidth) {
      x = containerWidth;
    }

    textRef.current.style.transform = `translateX(${x}px)`;
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
