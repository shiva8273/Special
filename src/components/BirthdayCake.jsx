import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { data } from "../data/birthdayData";
import Confetti from "./Confetti";
import useReducedMotion from "../hooks/useReducedMotion";

export default function BirthdayCake() {
  const [out, setOut] = useState(false); const reduce = useReducedMotion();
  return (
    <section id="wish" className="cake-sec">
      <h2 className="sec-title">Close your eyes. Make a wish.</h2>
      <svg className="cake" viewBox="0 0 300 260" role="img" aria-label="Birthday cake with candles">
        <ellipse cx="150" cy="238" rx="130" ry="14" fill="#000" opacity=".35" />
        <rect x="30" y="150" width="240" height="84" rx="12" fill="#f6a4c3" />
        <path d="M30 168c20 18 40-6 60 8s40-8 60 8 40-8 60 8 40-8 60 4v-30H30z" fill="#ffffff" />
        <rect x="55" y="104" width="190" height="52" rx="10" fill="#ec7fa8" />
        <path d="M55 120c16 14 32-4 48 8s32-6 48 6 32-8 48 6 32-6 46 2v-18H55z" fill="#ffffff" />
        {[95, 130, 165, 200].map((x, i) => (
          <g key={x}>
            <rect x={x} y="68" width="10" height="38" rx="3" stroke="#e0618f" strokeWidth="1" fill={i % 2 ? "#f6a4c3" : "#ffffff"} />
            {!out && <g className="flame" style={{ animationDelay: i * 0.18 + "s", transformOrigin: `${x + 5}px 66px` }}><ellipse cx={x + 5} cy="56" rx="6" ry="12" fill="#ffb347" /><ellipse cx={x + 5} cy="60" rx="3" ry="7" fill="#fff3b0" /></g>}
            {out && <path className="smoke" d={`M${x + 5} 66c-6-10 6-16 0-28`} stroke="#c9879f" fill="none" strokeWidth="2" strokeLinecap="round" />}
          </g>
        ))}
      </svg>
      <button className="cta" onClick={() => setOut(true)} disabled={out}><Sparkles size={18} aria-hidden="true" /> {out ? "Wish made" : "Make a Wish"}</button>
      <Confetti run={out && !reduce} />
      <AnimatePresence>{out && <motion.p className="wish-msg" role="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }}>{data.wishMessage}</motion.p>}</AnimatePresence>
    </section>
  );
}
