import { useEffect, useRef } from "react";
export default function Confetti({ run }) {
  const ref = useRef();
  useEffect(() => {
    if (!run) return;
    const c = ref.current, x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
    const cols = ["#f6a4c3", "#e0618f", "#ffffff", "#ffd1e1"];
    const ps = Array.from({ length: 140 }, () => ({ x: c.width / 2, y: c.height * 0.6, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 18 - 4, w: 6 + Math.random() * 6, h: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[(Math.random() * 4) | 0] }));
    let raf, t = 0;
    const tick = () => { t++; x.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.globalAlpha = Math.max(0, 1 - t / 200); x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); });
      if (t < 200) raf = requestAnimationFrame(tick); else x.clearRect(0, 0, c.width, c.height); };
    tick(); return () => cancelAnimationFrame(raf);
  }, [run]);
  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}
