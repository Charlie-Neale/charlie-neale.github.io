"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeMap from "./HomeMap";
import SectionPanel from "./SectionPanel";
import { IntroProvider } from "./Intro";
import { ParallaxProvider } from "./Parallax";

export type SectionType = "projects" | "experience" | "about" | null;

// ── Easing ────────────────────────────────────────────────────────────────────
// Aggressive ease-in: starts slow, ends at full speed → feels like acceleration
const ACCEL_EASE: [number, number, number, number] = [0.4, 0, 1, 1];
// Aggressive ease-out: starts at full speed, brakes smoothly → feels like deceleration
const DECEL_EASE: [number, number, number, number] = [0, 0, 0.2, 1];

// ── Map animation keyframes ───────────────────────────────────────────────────
const MAP_IDLE = { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 };
// MAP_EXITED is now computed dynamically per node click
type MapAnimState = typeof MAP_IDLE;

// Panel fades in just after zoom starts
const PANEL_APPEAR_DELAY_MS = 100;

export default function ZoomNav() {
  const [activeSection, setActiveSection] = useState<SectionType>(null);
  const [showPanel, setShowPanel]         = useState(false);

  const [mapAnim, setMapAnim]             = useState<MapAnimState>(MAP_IDLE);
  const [mapTransition, setMapTransition] = useState<object>({
    duration: 0.65,
    ease: ACCEL_EASE,
  });

  // ── Stale-closure guard ───────────────────────────────────────────────────
  const targetSectionRef  = useRef<SectionType>(null);
  const timerRefs         = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mapContainerRef   = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };
  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timerRefs.current.push(t);
  };

  const navigateTo = (section: SectionType, nodeCenterX?: number, nodeCenterY?: number) => {
    clearTimers();

    if (section === null) {
      // ── BACK ─────────────────────────────────────────────────────────────
      // Panel fade-out and map zoom-out happen simultaneously
      setShowPanel(false);
      setMapTransition({ duration: 0.5, ease: DECEL_EASE });
      setMapAnim(MAP_IDLE);
      schedule(() => setActiveSection(null), 550);
      return;
    }

    // ── FORWARD ──────────────────────────────────────────────────────────────
    // Step 1: Lock in target section via ref
    targetSectionRef.current = section;

    // Step 2: Anchor transform origin to the node, then scale up from it
    const exitAnim: MapAnimState = { x: 0, y: 0, scale: 8, rotate: 0, opacity: 0 };
    if (nodeCenterX !== undefined && nodeCenterY !== undefined) {
      if (mapContainerRef.current) {
        mapContainerRef.current.style.transformOrigin = `${nodeCenterX}px ${nodeCenterY}px`;
      }
    }

    // Step 3: Zoom the map into the clicked node
    setMapTransition({ duration: 0.5, ease: ACCEL_EASE });
    setMapAnim(exitAnim);

    // Step 4: Fade in the panel shortly after zoom starts
    schedule(() => {
      setActiveSection(targetSectionRef.current);
      setShowPanel(true);
    }, PANEL_APPEAR_DELAY_MS);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* ── Map container — always mounted, animated as a single unit ── */}
      <motion.div
        ref={mapContainerRef}
        animate={mapAnim}
        transition={mapTransition as never}
        style={{ willChange: "transform" }}
        className="absolute inset-0 w-full h-full"
      >
        {/* Intro: slam-in once per tab. Parallax: mouse-driven layer drift. */}
        <IntroProvider>
          <ParallaxProvider>
            <HomeMap onNavigate={navigateTo} />
          </ParallaxProvider>
        </IntroProvider>
      </motion.div>

      {/* ── Section panel — arrives from top-right, exits back that way ── */}
      <AnimatePresence>
        {showPanel && activeSection && (
          <motion.div
            key={`panel-${activeSection}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full z-30"
          >
            <SectionPanel section={activeSection} onBack={() => navigateTo(null)} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
