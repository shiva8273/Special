import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PhotoLightbox({ items, index, setIndex, onClose }) {
  const n = items.length;
  const go = d => setIndex((index + d + n) % n);
  const it = items[index];
  const [currentSrc, setCurrentSrc] = useState(it?.src);

  useEffect(() => {
    setCurrentSrc(it?.src);
  }, [index, it?.src]);

  useEffect(() => {
    const k = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  if (!it) return null;

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className="lb-btn lb-close" onClick={onClose} aria-label="Close photo viewer"><X /></button>
      <button className="lb-btn lb-prev" onClick={e => { e.stopPropagation(); go(-1); }} aria-label="Previous photo"><ChevronLeft /></button>
      <button className="lb-btn lb-next" onClick={e => { e.stopPropagation(); go(1); }} aria-label="Next photo"><ChevronRight /></button>
      <motion.figure
        key={index}
        style={{ perspective: 1000 }}
        initial={{ opacity: 0, rotateY: 45, scale: 0.85 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={(_, i) => { if (i.offset.x < -60) go(1); else if (i.offset.x > 60) go(-1); }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={currentSrc}
          alt={it.alt}
          onError={() => {
            if (it.fallback && currentSrc !== it.fallback) {
              setCurrentSrc(it.fallback);
            }
          }}
          draggable="false"
        />
        <figcaption>
          <span className="lb-caption-text">{it.caption}</span>
          <span className="lb-counter">{index + 1} / {n}</span>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}
