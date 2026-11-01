import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { data } from "./data/birthdayData";
import WelcomeScreen from "./components/WelcomeScreen";
import Navigation from "./components/Navigation";
import BirthdayHero from "./components/BirthdayHero";
import PhotoGallery from "./components/PhotoGallery";
import VortexGallery from "./components/VortexGallery";
import BirthdayLetter from "./components/BirthdayLetter";
import BirthdayCake from "./components/BirthdayCake";
import FinalSurprise from "./components/FinalSurprise";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const t = data.theme;
    const s = document.documentElement.style;
    s.setProperty("--bg", t.bg);
    s.setProperty("--ink", t.ink);
    s.setProperty("--pink", t.pink);
    s.setProperty("--baby", t.baby);
  }, []);

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    if (opened) {
      const id = setTimeout(() => ScrollTrigger.refresh(), 500);
      return () => clearTimeout(id);
    }
  }, [opened]);

  const handleOpen = () => {
    setOpened(true);
  };

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <AnimatePresence>
        {!opened && <WelcomeScreen key="w" onOpen={handleOpen} />}
      </AnimatePresence>
      {opened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Navigation />
          <main>
            <BirthdayHero />
            <PhotoGallery />
            <VortexGallery />
            <BirthdayLetter />
            <BirthdayCake />
            <FinalSurprise />
          </main>
        </motion.div>
      )}
    </>
  );
}
