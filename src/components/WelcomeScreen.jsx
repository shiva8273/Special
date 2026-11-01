import { useState } from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { data } from "../data/birthdayData";
import Particles from "./Particles";
import useReducedMotion from "../hooks/useReducedMotion";

function daysLeft() {
  const parts = data.birthday.split("-").map(Number);
  const b = new Date(parts[0], parts[1] - 1, parts[2]);
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  b.setFullYear(n.getFullYear());
  if (b < n) b.setFullYear(n.getFullYear() + 1);
  return Math.round((b - n) / 864e5);
}

export default function WelcomeScreen({ onOpen }) {
  const reduce = useReducedMotion();
  const [d] = useState(daysLeft);
  const [clicked, setClicked] = useState(false);
  const words = "A little world, made just for you.".split(" ");
  const parts = data.birthday.split("-").map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const dateStr = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const handleClick = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (clicked) return;
    setClicked(true);
    onOpen();
  };

  return (
    <motion.section
      className={`welcome ${clicked ? "exiting" : ""}`}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      aria-label="Welcome"
      style={clicked ? { pointerEvents: "none" } : undefined}
    >
      <div className="aurora" aria-hidden="true" />
      <Particles n={24} />
      <h1 className="welcome-title" aria-label="A little world, made just for you.">
        {words.map((w, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, y: 30, rotateX: -45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        ))}
      </h1>
      <motion.p
        className="glow-date"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        {d === 0 ? "Today is the day. Happy Birthday!" : `${d} ${d === 1 ? "day" : "days"} until ${dateStr}`}
      </motion.p>
      <motion.button
        type="button"
        className="cta welcome-btn"
        onClick={handleClick}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") handleClick(e);
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
      >
        <Gift size={20} aria-hidden="true" /> Open Your Birthday Surprise
      </motion.button>
    </motion.section>
  );
}
