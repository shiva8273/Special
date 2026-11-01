import { motion } from "framer-motion";
const links = [["hero", "Hello"], ["memories", "Memories"], ["vortex", "3D"], ["letter", "Letter"], ["wish", "Wish"], ["finale", "Finale"]];
export default function Navigation() {
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    // <motion.nav className="nav" aria-label="Sections" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }}>
    //   {links.map(([id, t]) => <button key={id} onClick={() => go(id)}>{t}</button>)}
    // </motion.nav>
    <> </>
  );
}
