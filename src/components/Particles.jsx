import { useMemo } from "react";
export default function Particles({ n: full = 28 }) {
  const n = innerWidth < 700 ? Math.round(full / 2) : full;
  const items = useMemo(() => Array.from({ length: n }, (_, i) => ({ i, l: Math.random() * 100, s: 2 + Math.random() * 4, d: 8 + Math.random() * 14, dl: -Math.random() * 20, b: i % 4 === 0 })), [n]);
  return <div className="particles" aria-hidden="true">{items.map(p => <span key={p.i} className={p.b ? "blush" : ""} style={{ left: p.l + "%", width: p.s, height: p.s, animationDuration: p.d + "s", animationDelay: p.dl + "s" }} />)}</div>;
}
