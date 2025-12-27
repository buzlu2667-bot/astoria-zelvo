import { useEffect } from "react";

export default function Snow() {
  useEffect(() => {

    const now = new Date();
    const month = now.getMonth(); // 0=Ocak, 11=Aralık

    // 🎯 SADECE 1 ARALIK – 31 OCAK ARASI ÇALIŞIR
    const isSeason = (month === 11 || month === 0);
    if (!isSeason) return;

    const style = document.createElement("style");
    style.innerHTML = `
      #snow-wrap{
        position:fixed;
        inset:0;
        pointer-events:none;
        z-index:999999999;
      }
      .snowflake{
        position:absolute;
        top:-10px;
      color:#eafcff;
filter:
  drop-shadow(0 0 3px #9ff)
  drop-shadow(0 0 8px #7dd3fc)
  drop-shadow(0 0 14px rgba(0,200,255,.55));
text-shadow:
  0 0 6px rgba(180,240,255,.9),
  0 0 12px rgba(120,210,255,.8),
  0 0 22px rgba(0,170,255,.6);

        animation: fall linear infinite;
      }
      @keyframes fall{
        to{ transform: translateY(110vh); }
      }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement("div");
    wrap.id = "snow-wrap";
    document.body.appendChild(wrap);

 const isMobile = window.innerWidth < 768;
const count = isMobile ? 20 : 55;


for(let i=0;i<count;i++){

      const s = document.createElement("div");
      s.className="snowflake";
      s.textContent="❄";
      s.style.left = Math.random()*100+"vw";
      s.style.fontSize = 10+Math.random()*18+"px";
      s.style.animationDuration = 6+Math.random()*10+"s";
      s.style.opacity = Math.random();
      s.style.animationDelay = Math.random()*-20+"s";
      wrap.appendChild(s);
    }

    return () => wrap.remove();
  }, []);

  return null;
}
