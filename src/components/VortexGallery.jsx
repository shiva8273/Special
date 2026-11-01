import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { data } from "../data/birthdayData";
import PhotoLightbox from "./PhotoLightbox";
import useReducedMotion from "../hooks/useReducedMotion";

function createHeartGeometry() {
  const shape = new THREE.Shape();
  const n = 36;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const s = 0.016;
    if (i === 0) shape.moveTo(x * s, y * s);
    else shape.lineTo(x * s, y * s);
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  geo.center();
  return geo;
}

function createPlaceholderTexture(caption = "Memory") {
  const c = document.createElement("canvas");
  c.width = 500;
  c.height = 640;
  const ctx = c.getContext("2d");
  const grd = ctx.createLinearGradient(0, 0, 0, 640);
  grd.addColorStop(0, "#fff5f8");
  grd.addColorStop(0.5, "#ffd5e5");
  grd.addColorStop(1, "#fca5c5");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 500, 640);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 468, 608);

  ctx.fillStyle = "#e0618f";
  ctx.font = "bold 68px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("♥", 250, 280);

  ctx.font = "italic 22px 'Cormorant Garamond', Georgia, serif";
  ctx.fillStyle = "#5a2740";
  ctx.fillText(caption, 250, 360);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSparkleTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  const rad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  rad.addColorStop(0, "rgba(255, 255, 255, 1)");
  rad.addColorStop(0.3, "rgba(254, 215, 226, 0.9)");
  rad.addColorStop(0.65, "rgba(244, 114, 182, 0.35)");
  rad.addColorStop(1, "rgba(244, 114, 182, 0)");
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.generateMipmaps = false;
  return tex;
}

export default function VortexGallery() {
  const box = useRef();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const spinToRef = useRef(null);
  const triggerBurstRef = useRef(null);

  const galleryItems = data.gallery;

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100);

    const fitCamera = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      const aspect = w / h;
      cam.aspect = aspect;
      if (aspect < 0.75) {
        cam.fov = 52;
        cam.position.set(0, 0.05, 7.2);
      } else if (aspect < 1.2) {
        cam.fov = 46;
        cam.position.set(0, 0.05, 7.6);
      } else {
        cam.fov = 40;
        cam.position.set(0, 0.05, 8.0);
      }
      cam.updateProjectionMatrix();
    };
    fitCamera();

    // Balanced lighting for clean, crisp photographic cards
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3f8, 1.3);
    dirLight.position.set(2, 6, 8);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffc2d4, 1.0, 18);
    pointLight.position.set(0, 2, 4);
    scene.add(pointLight);

    // Carousel main group
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    // Decreased 3D Card Dimensions: neat, compact, and perfectly proportioned
    const heartGeo = createHeartGeometry();
    const cardBackGeo = new THREE.BoxGeometry(1.52, 2.02, 0.035);
    const photoPlaneGeo = new THREE.PlaneGeometry(1.38, 1.76);
    const fallbackTex = createPlaceholderTexture();
    const loader = new THREE.TextureLoader();

    const n = galleryItems.length;
    const R = Math.max(3.8, n * 0.32);

    // Card frame materials
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.05,
    });

    const heartPinMat = new THREE.MeshStandardMaterial({
      color: 0xe0618f,
      roughness: 0.18,
      metalness: 0.15,
    });

    // Create the photo cards
    const cardMeshes = [];
    const cardGroups = galleryItems.map((it, i) => {
      const cardGroup = new THREE.Group();

      // 1. Backing frame (clean white artboard)
      const frameMesh = new THREE.Mesh(cardBackGeo, frameMat);
      cardGroup.add(frameMesh);

      // 2. Photo front (clean, crystal-clear, zero distortion)
      const photoMat = new THREE.MeshBasicMaterial({
        map: fallbackTex,
        toneMapped: false,
      });

      loader.load(
        it.src,
        loadedTex => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          loadedTex.generateMipmaps = true;
          loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
          photoMat.map = loadedTex;
          photoMat.needsUpdate = true;
        },
        undefined,
        () => {
          if (it.fallback) {
            loader.load(it.fallback, fbTex => {
              fbTex.colorSpace = THREE.SRGBColorSpace;
              fbTex.generateMipmaps = true;
              fbTex.minFilter = THREE.LinearMipmapLinearFilter;
              photoMat.map = fbTex;
              photoMat.needsUpdate = true;
            });
          }
        }
      );

      const photoMesh = new THREE.Mesh(photoPlaneGeo, photoMat);
      photoMesh.position.set(0, -0.04, 0.024);
      photoMesh.userData = { i, it };
      cardGroup.add(photoMesh);
      cardMeshes.push(photoMesh);

      // 3. Cute 3D Heart Pin on top of each card
      const pinHeart = new THREE.Mesh(heartGeo, heartPinMat);
      pinHeart.scale.setScalar(0.16);
      pinHeart.position.set(0, 0.88, 0.03);
      cardGroup.add(pinHeart);

      // Position in cylinder circle
      const angle = (i / n) * Math.PI * 2;
      cardGroup.position.set(Math.sin(angle) * R, 0, Math.cos(angle) * R);
      cardGroup.rotation.y = angle;
      cardGroup.userData = { i, it, angle, pinHeart };

      carouselGroup.add(cardGroup);
      return cardGroup;
    });

    // ==========================================
    // LOVE ANIMATION: Floating 3D Extruded Hearts
    // ==========================================
    const heartColors = [
      new THREE.Color("#e0618f"), // rose pink
      new THREE.Color("#ff3366"), // vibrant ruby
      new THREE.Color("#f472b6"), // berry pink
      new THREE.Color("#fbcfe8"), // soft blush
      new THREE.Color("#fcd34d"), // champagne gold
    ];

    const heartCount = window.innerWidth < 768 ? 16 : 26;
    const floatingHeartsGroup = new THREE.Group();
    scene.add(floatingHeartsGroup);

    const floatingHearts = Array.from({ length: heartCount }, (_, idx) => {
      const color = heartColors[idx % heartColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.18,
        metalness: 0.12,
      });

      const heartMesh = new THREE.Mesh(heartGeo, mat);
      const angle = (idx / heartCount) * Math.PI * 2 + Math.random() * 0.4;
      const orbitR = R * 0.68 + Math.random() * (R * 0.65);
      const baseY = (Math.random() - 0.5) * 3.8;
      const baseScale = 0.35 + Math.random() * 0.45;

      heartMesh.position.set(Math.sin(angle) * orbitR, baseY, Math.cos(angle) * orbitR);
      heartMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      heartMesh.scale.setScalar(baseScale);

      floatingHeartsGroup.add(heartMesh);

      return {
        mesh: heartMesh,
        angle,
        orbitR,
        baseY,
        baseScale,
        orbitSpeed: (0.0016 + Math.random() * 0.0022) * (Math.random() > 0.5 ? 1 : -1),
        bobSpeed: 1.2 + Math.random() * 1.5,
        bobPhase: Math.random() * Math.PI * 2,
        rotSpeedX: 0.008 + Math.random() * 0.015,
        rotSpeedY: 0.01 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    // ==========================================
    // LOVE BURST SYSTEM: Interactive Spawning Hearts
    // ==========================================
    const burstHearts = [];
    const burstGroup = new THREE.Group();
    scene.add(burstGroup);

    const triggerBurst = () => {
      const burstMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ff3366"),
        roughness: 0.15,
        metalness: 0.1,
      });

      const count = 10;
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(heartGeo, burstMat);
        const startX = (Math.random() - 0.5) * 1.2;
        const startY = -0.9 + Math.random() * 0.4;
        const startZ = 2.0 + Math.random() * 1.0;
        mesh.position.set(startX, startY, startZ);
        const scale = 0.28 + Math.random() * 0.35;
        mesh.scale.setScalar(scale);

        const vx = (Math.random() - 0.5) * 0.035;
        const vy = 0.04 + Math.random() * 0.05;
        const vz = (Math.random() - 0.5) * 0.025;

        burstGroup.add(mesh);
        burstHearts.push({
          mesh,
          vx,
          vy,
          vz,
          scale,
          life: 1.0,
          decay: 0.012 + Math.random() * 0.008,
        });
      }
    };
    triggerBurstRef.current = triggerBurst;

    // Background Romantic Sparkles
    const pCount = window.innerWidth < 768 ? 90 : 160;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount);

    const pPalette = [
      new THREE.Color("#ffd1e1"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#fbcfe8"),
      new THREE.Color("#fef08a"),
    ];

    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const dist = R * 0.5 + Math.random() * (R * 0.9);
      pPos[i3] = Math.cos(angle) * dist;
      pPos[i3 + 1] = (Math.random() - 0.5) * 6.5;
      pPos[i3 + 2] = Math.sin(angle) * dist;

      const c = pPalette[Math.floor(Math.random() * pPalette.length)];
      pCol[i3] = c.r;
      pCol[i3 + 1] = c.g;
      pCol[i3 + 2] = c.b;

      pSpeeds[i] = 0.0035 + Math.random() * 0.007;
    }

    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));

    const sparkleTex = createSparkleTexture();
    const pMat = new THREE.PointsMaterial({
      size: window.innerWidth < 768 ? 0.2 : 0.25,
      vertexColors: true,
      map: sparkleTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Physics & Interaction variables
    let rot = 0;
    let vel = 0;
    let targetRot = null;
    let isDragging = false;
    let lastX = 0;
    let movedTotal = 0;
    let hovIdx = -1;
    let isVisible = true;
    let rafId = null;
    let tiltX = 0;
    let tiltY = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(9, 9);
    const clock = new THREE.Clock();

    const updateMouse = e => {
      const r = el.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };

    const handlePointerDown = e => {
      isDragging = true;
      targetRot = null;
      lastX = e.clientX;
      movedTotal = 0;
      updateMouse(e);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
    };

    const handlePointerMove = e => {
      updateMouse(e);
      tiltX = mouse.x;
      tiltY = mouse.y;

      if (isDragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        movedTotal += Math.abs(dx);
        vel += dx * 0.00065;
      }
    };

    const handlePointerUp = e => {
      if (!isDragging) return;
      isDragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}

      // Click detection: tap a card
      if (movedTotal < 8) {
        updateMouse(e);
        raycaster.setFromCamera(mouse, cam);
        const hit = raycaster.intersectObjects(cardMeshes)[0];
        if (hit) {
          const clickedI = hit.object.userData.i;
          const normRot = ((-rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const currentFront = Math.round((normRot / (Math.PI * 2)) * n) % n;

          triggerBurst();

          if (clickedI === currentFront) {
            setOpen(clickedI);
          } else {
            const step = (Math.PI * 2) / n;
            let diff = clickedI - currentFront;
            if (diff > n / 2) diff -= n;
            if (diff < -n / 2) diff += n;
            targetRot = rot - diff * step;
          }
        } else {
          // Tapping anywhere in 3D scene also bursts hearts
          triggerBurst();
        }
      }
    };

    const handleWheel = e => {
      const delta = (e.deltaX || 0) + (e.deltaY || 0);
      vel += delta * 0.00025;
      targetRot = null;
    };

    const handlePointerLeave = () => {
      mouse.set(9, 9);
      tiltX = 0;
      tiltY = 0;
    };

    spinToRef.current = stepDelta => {
      const step = (Math.PI * 2) / n;
      const normRot = ((-rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const currentFront = Math.round((normRot / (Math.PI * 2)) * n) % n;
      const nextIdx = (currentFront + stepDelta + n) % n;
      let diff = nextIdx - currentFront;
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
      targetRot = rot - diff * step;
    };

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", handlePointerUp);
    el.addEventListener("pointercancel", handlePointerUp);
    el.addEventListener("pointerleave", handlePointerLeave);
    el.addEventListener("wheel", handleWheel, { passive: true });

    const ro = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      fitCamera();
      renderer.setSize(el.clientWidth, el.clientHeight);
    });
    ro.observe(el);

    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !rafId) {
        clock.start();
        tick();
      }
    });
    io.observe(el);

    // Animation loop
    const tick = () => {
      if (!isVisible) {
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(tick);

      const elapsedTime = clock.getElapsedTime();

      // Smooth target interpolation if snapping or navigating
      if (targetRot !== null) {
        const diff = targetRot - rot;
        rot += diff * 0.08;
        if (Math.abs(diff) < 0.001) {
          rot = targetRot;
          targetRot = null;
        }
      } else {
        if (!isDragging && !reduce) {
          rot += 0.0015; // Gentle continuous auto-drift
        }
        rot += vel;
        vel *= 0.93;
        vel = Math.max(-0.06, Math.min(0.06, vel));
      }

      carouselGroup.rotation.y = rot;
      carouselGroup.rotation.x += (tiltY * 0.1 - carouselGroup.rotation.x) * 0.06;
      carouselGroup.position.x += (tiltX * 0.35 - carouselGroup.position.x) * 0.06;

      const normRot = ((-rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const currentFrontIdx = Math.round((normRot / (Math.PI * 2)) * n) % n;
      setActiveIdx(currentFrontIdx);

      raycaster.setFromCamera(mouse, cam);
      const hit = raycaster.intersectObjects(cardMeshes)[0];
      hovIdx = hit ? hit.object.userData.i : -1;

      // Card 3D scale and depth focus (compact, neat proportion)
      cardGroups.forEach((cg, idx) => {
        const cardWorldPos = new THREE.Vector3();
        cg.getWorldPosition(cardWorldPos);
        const depth = (cardWorldPos.z + R) / (2 * R);

        const isFront = idx === currentFrontIdx;
        const isHovered = idx === hovIdx;

        let targetScale = 0.78 + depth * 0.24;
        if (isFront) targetScale = 1.02;
        if (isHovered) targetScale *= 1.06;

        cg.scale.setScalar(targetScale);

        if (cg.userData.pinHeart) {
          const pinScale = 0.16 * (1 + 0.12 * Math.sin(elapsedTime * 4 + idx));
          cg.userData.pinHeart.scale.setScalar(pinScale);
        }
      });

      // Animate floating 3D hearts
      floatingHearts.forEach(fh => {
        fh.angle += fh.orbitSpeed;
        const hx = Math.sin(fh.angle) * fh.orbitR;
        const hz = Math.cos(fh.angle) * fh.orbitR;
        const hy = fh.baseY + Math.sin(elapsedTime * fh.bobSpeed + fh.bobPhase) * 0.32;
        fh.mesh.position.set(hx, hy, hz);

        fh.mesh.rotation.x += fh.rotSpeedX;
        fh.mesh.rotation.y += fh.rotSpeedY;

        const pulse = 1.0 + 0.12 * Math.sin(elapsedTime * 3.6 + fh.pulsePhase);
        fh.mesh.scale.setScalar(fh.baseScale * pulse);
      });

      // Animate burst hearts
      for (let i = burstHearts.length - 1; i >= 0; i--) {
        const b = burstHearts[i];
        b.mesh.position.x += b.vx;
        b.mesh.position.y += b.vy;
        b.mesh.position.z += b.vz;
        b.mesh.rotation.x += 0.05;
        b.mesh.rotation.y += 0.06;
        b.life -= b.decay;
        b.mesh.scale.setScalar(Math.max(0, b.scale * b.life));

        if (b.life <= 0) {
          burstGroup.remove(b.mesh);
          b.mesh.geometry.dispose();
          burstHearts.splice(i, 1);
        }
      }

      // Animate sparkles
      const positions = pGeo.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += pSpeeds[i];
        if (positions[i3 + 1] > 3.8) {
          positions[i3 + 1] = -3.8;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = rot * 0.3;

      renderer.domElement.style.cursor = hovIdx >= 0 ? "pointer" : isDragging ? "grabbing" : "grab";
      renderer.render(scene, cam);
    };

    tick();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();

      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", handlePointerUp);
      el.removeEventListener("pointercancel", handlePointerUp);
      el.removeEventListener("pointerleave", handlePointerLeave);
      el.removeEventListener("wheel", handleWheel);

      heartGeo.dispose();
      cardBackGeo.dispose();
      photoPlaneGeo.dispose();
      fallbackTex.dispose();
      sparkleTex.dispose();
      pGeo.dispose();
      pMat.dispose();
      frameMat.dispose();
      heartPinMat.dispose();

      cardGroups.forEach(cg => {
        cg.children.forEach(child => {
          if (child.material) {
            if (child.material.map && child.material.map !== fallbackTex) {
              child.material.map.dispose();
            }
            child.material.dispose();
          }
        });
      });

      floatingHearts.forEach(fh => {
        fh.mesh.material.dispose();
      });

      burstHearts.forEach(b => {
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
      });

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [reduce, galleryItems]);

  const handleJumpTo = useCallback(targetIdx => {
    if (spinToRef.current) {
      const n = galleryItems.length;
      let diff = targetIdx - activeIdx;
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
      spinToRef.current(-diff);
    }
  }, [activeIdx, galleryItems.length]);

  const activePhoto = galleryItems[activeIdx] || galleryItems[0];

  return (
    <section id="vortex" className="vortex" aria-label="3D photo carousel">
      {/* Header Info */}
      <div className="vortex-header">
        <h2 className="sec-title vortex-title">Spin through your memories</h2>
        <div className="vortex-subtitle">
          {/* <span className="vortex-badge">Photo {activeIdx + 1} of {galleryItems.length}</span> */}
          {/* {activePhoto?.alt?.trim() ? (
            <span className="vortex-photo-alt">{activePhoto.alt.trim()}</span>
          ) : (
            <span className="vortex-photo-alt">Sweet Memory #{activeIdx + 1}</span>
          )}
          {activePhoto?.caption?.trim() && (
            <span className="vortex-caption-highlight"> — “{activePhoto.caption.trim()}”</span>
          )} */}
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="vortex-canvas" ref={box} />

      {/* Clean Unobtrusive Dots Indicator at Bottom */}
      <div className="vortex-bottom-bar">
        <div className="vortex-dots" aria-label="Choose photo">
          {galleryItems.map((_, i) => (
            <button
              key={i}
              className={`vortex-dot ${i === activeIdx ? "is-active" : ""}`}
              onClick={() => handleJumpTo(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>

        <p className="vortex-hint">
          <Sparkles size={14} aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          Swipe to spin 3D • Tap any photo to view in HD
        </p>
      </div>

      {/* Screen reader fallback */}
      <ul className="sr-only">
        {galleryItems.map((p, i) => (
          <li key={i}>
            <button onClick={() => setOpen(i)}>View photo: {p.alt}</button>
          </li>
        ))}
      </ul>

      {/* Full-screen Photo Lightbox */}
      <AnimatePresence>
        {open !== null && (
          <PhotoLightbox
            items={galleryItems}
            index={open}
            setIndex={setOpen}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
