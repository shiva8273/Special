import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { RotateCcw } from "lucide-react";
import { data } from "../data/birthdayData";
import useReducedMotion from "../hooks/useReducedMotion";

export default function FinalSurprise() {
  const root = useRef();
  const reduce = useReducedMotion();
  const [finSrc, setFinSrc] = useState(data.finalPhoto);

  useLayoutEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=120%", pin: true, scrub: 1 } })
        .from(".fin-photo", { scale: 0.5, opacity: 0, borderRadius: "50%" })
        .from(".fin-msg", { opacity: 0, y: 40 }, "+=0.1")
        .from(".fin-btn", { opacity: 0 }, "+=0.1");
      gsap.to(".fin-glow", { scale: 1.4, opacity: 0.8, scrollTrigger: { trigger: root.current, start: "top top", end: "+=120%", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section id="finale" className="finale" ref={root}>
      <div className="fin-glow" aria-hidden="true" />
      <img
        className="fin-photo"
        src={finSrc}
        alt={`${data.name}, smiling`}
        onError={() => {
          if (data.finalPhotoFallback && finSrc !== data.finalPhotoFallback) {
            setFinSrc(data.finalPhotoFallback);
          }
        }}
        loading="lazy"
        decoding="async"
      />
      <p className="fin-msg">{data.finalMessage}</p>
      {/* <button className="cta fin-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <RotateCcw size={16} aria-hidden="true" /> Relive it from the start
      </button> */}
    </section>
  );
}
