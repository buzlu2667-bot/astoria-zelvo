// 📄 src/components/ScrollingText.jsx
import { useEffect, useRef } from "react";

export default function ScrollingText({ data }) {
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;

    let pos = containerRef.current.offsetWidth;
    const speed = data.speed || 1;

    function loop() {
      pos -= speed;
      textRef.current.style.transform = `translateX(${pos}px)`;

      if (pos < -textRef.current.offsetWidth) {
        pos = containerRef.current.offsetWidth;
      }
      requestAnimationFrame(loop);
    }

    loop();
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        background: data.bg_color,
        color: data.text_color,
        height: `${data.height_px}px`,
      }}
      className="flex items-center w-full overflow-hidden border-b border-white/10"
    >
      <span
        ref={textRef}
        className="px-10 font-medium whitespace-nowrap"
        style={{ fontSize: "14px" }}
      >
        {data.text}
      </span>
    </div>
  );
}
