// 📄 src/components/ScrollingText.jsx
import { useEffect, useRef } from "react";

export default function ScrollingText({ data }) {
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;

    let pos = containerRef.current.offsetWidth;
    let rafId;
    let isScrolling = false;

    // 🔥 MOBİLDE DAHA YAVAŞ, DESKTOPTA NORMAL
    const speed =
      window.innerWidth < 768
        ? (data.speed || 1) * 0.5
        : data.speed || 1;

    const textEl = textRef.current;
    const containerEl = containerRef.current;

    // 🔥 GPU FORCE
    textEl.style.willChange = "transform";
    textEl.style.transform = "translate3d(0,0,0)";

    function loop() {
      if (!isScrolling) {
        pos -= speed;
        textEl.style.transform = `translate3d(${pos}px,0,0)`;

        if (pos < -textEl.offsetWidth) {
          pos = containerEl.offsetWidth;
        }
      }
      rafId = requestAnimationFrame(loop);
    }

    // 🔥 SCROLL SIRASINDA ANİMASYONU YUMUŞAK DURDUR
    const onScroll = () => {
      isScrolling = true;
      clearTimeout(window.__scrollTimeout);
      window.__scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: data.bg_color || "#000",
        color: data.text_color || "#fff",
        height: `${data.height_px || 40}px`,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 10001,
      }}
      className="flex items-center overflow-hidden border-b border-white/10"
    >
      <span
        ref={textRef}
        className="px-10 font-medium whitespace-nowrap"
        style={{
          fontSize: "14px",
          willChange: "transform",
          transform: "translate3d(0,0,0)",
        }}
      >
        {data.text}
      </span>
    </div>
  );
}
