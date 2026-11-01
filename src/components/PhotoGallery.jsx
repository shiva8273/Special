import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { data } from "../data/birthdayData";
import TiltCard from "./TiltCard";
import PhotoLightbox from "./PhotoLightbox";
import useReducedMotion from "../hooks/useReducedMotion";

const layout = ["tall", "wide", "sq", "tall", "sq", "wide"];
export default function PhotoGallery() {
  const root = useRef(), track = useRef(); const reduce = useReducedMotion();
  const [open, setOpen] = useState(null);
  useLayoutEffect(() => {
    if (reduce) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(min-width: 800px)", () => {
        const dist = () => track.current.scrollWidth - window.innerWidth + 120;
        gsap.to(track.current, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true } });
      });
      mm.add("(max-width: 799px)", () => {
        gsap.utils.toArray(".shot").forEach(el => gsap.from(el, { opacity: 0, y: 60, rotate: gsap.utils.random(-4, 4), duration: 1, scrollTrigger: { trigger: el, start: "top 88%" } }));
      });
    }, root);
    return () => { ctx.revert(); mm.revert(); };
  }, [reduce]);
  return (
    <section id="memories" className="gallery" ref={root}>
      <h2 className="sec-title">Moments that stayed</h2>
      <ul className="track" ref={track}>
        {data.gallery.map((p, i) => (
          <li key={i} className={`shot ${layout[i % layout.length]}`} style={{ "--r": (i % 2 ? 2 : -2.5) + "deg" }}>
            <TiltCard p={p} onOpen={() => setOpen(i)} />
          </li>
        ))}
      </ul>
      <AnimatePresence>{open !== null && <PhotoLightbox items={data.gallery} index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
