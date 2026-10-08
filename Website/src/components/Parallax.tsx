"use client";

import {
  motion, useMotionValue, useSpring, useTransform,
  type MotionValue, type TargetAndTransition, type Transition,
} from "framer-motion";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useIntro } from "./Intro";

// ── Mouse parallax ────────────────────────────────────────────────────────────
// The mouse position, normalised to -1…1 from screen centre, sprung so layers
// glide rather than jitter. Off on touch screens and under reduced motion —
// the values just stay at 0.
type Pointer = { x: MotionValue<number>; y: MotionValue<number> };
const ParallaxContext = createContext<Pointer | null>(null);

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 120, damping: 20 });
  const y = useSpring(rawY, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduce) return;

    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return <ParallaxContext.Provider value={{ x, y }}>{children}</ParallaxContext.Provider>;
}

// ── Layer: parallax depth + optional intro pose ───────────────────────────────
// `depth` = max px the layer drifts (opposite the mouse, so nearer layers move
// more). `hidden`/`shown`/`transition` give it a slam-in on the first load per
// tab; when the intro is skipped it snaps straight to `shown`.
const AT_REST: TargetAndTransition = { x: 0, y: 0, opacity: 1 };

export function ParallaxLayer({
  depth,
  className = "",
  hidden,
  shown = AT_REST,
  transition,
  children,
}: {
  depth: number;
  className?: string;
  hidden?: TargetAndTransition;
  shown?: TargetAndTransition;
  transition?: Transition;
  children: ReactNode;
}) {
  const pointer = useContext(ParallaxContext);
  const intro = useIntro();
  const fallback = useMotionValue(0);
  const x = useTransform(pointer?.x ?? fallback, v => -v * depth);
  const y = useTransform(pointer?.y ?? fallback, v => -v * depth);

  return (
    <motion.div className={`absolute inset-0 pointer-events-none ${className}`} style={{ x, y }}>
      {hidden ? (
        <motion.div
          className="absolute inset-0"
          initial={hidden as never}
          animate={(intro === "pending" ? hidden : shown) as never}
          transition={intro === "skip" ? { duration: 0 } : transition}
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
}
