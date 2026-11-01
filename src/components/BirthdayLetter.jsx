import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { data } from "../data/birthdayData";
import useReducedMotion from "../hooks/useReducedMotion";

export default function BirthdayLetter() {
  const [open, setOpen] = useState(false); const reduce = useReducedMotion();
  return (
    <section id="letter" className="letter-sec">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button key="env" className="envelope" onClick={() => setOpen(true)} exit={{ y: 40, opacity: 0 }} whileHover={{ y: -6 }} aria-label="Open the letter">
            <span className="flap" /><span className="seal">♥</span><span className="env-text">Tap to open</span>
          </motion.button>
        ) : (
          <motion.article key="paper" className="paper" initial={{ opacity: 0, y: 80, rotateX: 25 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: reduce ? 0 : 1 }}>
            {data.letter.map((l, i) => (
              <motion.p key={i} className={i === 0 ? "salute" : ""} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.8 + i * 0.9, duration: 0.9 }}>{l}</motion.p>
            ))}
          </motion.article>
        )}
      </AnimatePresence>
    </section>
  );
}
