import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import useReducedMotion from "../hooks/useReducedMotion";

export default function TiltCard({ p, onOpen }) {
  const reduce = useReducedMotion() || !matchMedia("(hover: hover) and (pointer: fine)").matches;
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(p.src);
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const cfg = { stiffness: 180, damping: 12, mass: 0.6 };
  const sx = useSpring(mx, cfg), sy = useSpring(my, cfg);
  const rY = useTransform(sx, [0, 1], [-24, 24]), rX = useTransform(sy, [0, 1], [20, -20]);
  const ix = useTransform(sx, [0, 1], [-18, 18]), iy = useTransform(sy, [0, 1], [-18, 18]);
  const glare = useTransform([sx, sy], ([x, y]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.55), transparent 60%)`);

  const move = e => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const leave = () => { mx.set(0.5); my.set(0.5); };

  const handleError = () => {
    if (p.fallback && imgSrc !== p.fallback) {
      setImgSrc(p.fallback);
    }
  };

  return (
    <motion.button className="tilt" onClick={onOpen} aria-label={`Open photo: ${p.alt}`}
      onPointerMove={reduce ? undefined : move} onPointerLeave={leave}
      style={reduce ? undefined : { rotateX: rX, rotateY: rY, transformPerspective: 900 }}
      whileHover={reduce ? undefined : { scale: 1.08, z: 60, zIndex: 5 }} whileTap={{ scale: 0.96, rotate: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 14 }}>
      <div className={`tilt-media ${loaded ? "is-loaded" : "is-loading"}`}>
        <motion.img
          src={imgSrc}
          alt={p.alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          width="800"
          height="1000"
          style={reduce ? undefined : { x: ix, y: iy, scale: 1.18 }}
        />
      </div>
      {!reduce && <motion.span className="glare" style={{ background: glare }} aria-hidden="true" />}
      <span className="cap">{p.caption}</span>
    </motion.button>
  );
}
