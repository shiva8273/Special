import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { data } from "../data/birthdayData";
import Particles from "./Particles";
import useReducedMotion from "../hooks/useReducedMotion";

export default function BirthdayHero() {
  const root = useRef();
  const reduce = useReducedMotion();
  const [heroSrc, setHeroSrc] = useState(data.heroPhoto);

  useLayoutEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.25, defaults: { ease: "power3.out" } });
      tl.from(".hero-name span", { yPercent: 110, stagger: 0.05, duration: 1.1 })
        .from(".hero-head", { opacity: 0, y: 24, duration: 0.8 }, "-=0.6")
        .from(".hero-photo", { clipPath: "inset(100% 0 0 0)", duration: 1.2, ease: "power4.inOut" }, "-=1.0")
        .from(".hero-photo img", { scale: 1.3, duration: 1.6 }, "<")
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.7 }, "-=0.7");
      gsap.to(".hero-photo img", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section id="hero" className="hero" ref={root}>
      <Particles n={22} />
      <div className="hero-text">
        <p className="hero-head">Happy birthday,</p>
        <h2 className="hero-name" aria-label={data.name}>
          {[...data.name].map((c, i) => (
            <span key={i} aria-hidden="true">{c}</span>
          ))}
        </h2>
        <p className="hero-sub">Another year of you. The world is better for it.</p>
      </div>
      <figure className="hero-photo">
        <img
          src={heroSrc}
          alt={`Portrait of ${data.name}`}
          onError={() => {
            if (data.heroPhotoFallback && heroSrc !== data.heroPhotoFallback) {
              setHeroSrc(data.heroPhotoFallback);
            }
          }}
          loading="eager"
          decoding="async"
        />
      </figure>
    </section>
  );
}
