"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SectionType } from "./ZoomNav";
import { LetterLabel, PROJECTS_NAV, EXPERIENCE_NAV, ABOUT_ME_NAV } from "./LetterLabel";
import StreetBackdrop from "./StreetBackdrop";
import BoltFlicker from "./BoltFlicker";
import ThemeStar from "./ThemeStar";
import { useIntro } from "./Intro";
import { ParallaxLayer } from "./Parallax";
import { VICTORY_BOLT, tracePolygon } from "./streetArt";
import { THEME_EVENT, currentAccent } from "./theme";

// Torn-paper cut for the name card: hard notches, slanted right edge, no curves
const NAME_CARD_CLIP =
  'polygon(0 6%, 4% 0, 62% 3%, 100% 0, 96% 48%, 100% 100%, 38% 96%, 3% 100%, 0 70%)';

const NAME_CARD_HIDDEN = { x: -120, opacity: 0 };

const NAV_CONFIGS = {
  PROJECTS: PROJECTS_NAV,
  EXPERIENCE: EXPERIENCE_NAV,
  "ABOUT ME": ABOUT_ME_NAV,
} as const;

export default function HomeMap({ onNavigate }: { onNavigate: (section: SectionType, x?: number, y?: number) => void }) {
  const sharpCanvasRef = useRef<HTMLCanvasElement>(null);
  const intro = useIntro();

  useEffect(() => {
    const sharpCanvas = sharpCanvasRef.current;
    const sharpCtx = sharpCanvas?.getContext("2d");
    if (!sharpCanvas || !sharpCtx) return;

    const resizeAndDraw = () => {
      const dpr = window.devicePixelRatio || 1;
      // Layout size, not getBoundingClientRect — that includes parallax/zoom transforms
      const w = sharpCanvas.clientWidth;
      const h = sharpCanvas.clientHeight;

      sharpCanvas.width = w * dpr;
      sharpCanvas.height = h * dpr;
      sharpCtx.scale(dpr, dpr);
      sharpCtx.clearRect(0, 0, w, h);

      // 1. SECONDARY BACKGROUND SHADOW BOLT (Accent, offset left and down)
      tracePolygon(sharpCtx, VICTORY_BOLT, w, h, -w * 0.04, h * 0.04);
      sharpCtx.fillStyle = currentAccent();
      sharpCtx.fill();

      // 2. MAIN ACCENT BOLT
      tracePolygon(sharpCtx, VICTORY_BOLT, w, h);
      sharpCtx.fillStyle = currentAccent();
      sharpCtx.fill();

      // 3. CUT-PAPER THICK STROKE
      sharpCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      sharpCtx.lineWidth = 6;
      sharpCtx.stroke();

      // 4. THIN WHITE 1px OUTLINE
      sharpCtx.strokeStyle = "#FFFFFF";
      sharpCtx.lineWidth = 1;
      sharpCtx.stroke();
    };

    resizeAndDraw();
    window.addEventListener("resize", resizeAndDraw);
    window.addEventListener(THEME_EVENT, resizeAndDraw);
    return () => {
      window.removeEventListener("resize", resizeAndDraw);
      window.removeEventListener(THEME_EVENT, resizeAndDraw);
    };
  }, []);


  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start text-[var(--white)] overflow-hidden">
      
      {/* Street-art colour blocks behind everything */}
      <StreetBackdrop />

      {/* Bolt layer: flicker echoes + the bolt itself. Ignites with a hard
          on/off/on after the slabs land (first load per tab only). */}
      <ParallaxLayer
        depth={6}
        className="z-10"
        hidden={{ opacity: 0 }}
        shown={{ opacity: [0, 1, 0, 1] }}
        transition={{ duration: 0.3, times: [0, 0.3, 0.55, 1], ease: "linear", delay: 0.3 }}
      >
        {/* Randomised flicker echoes + flying zigzags, behind the bolt */}
        <BoltFlicker />

        {/* Canvas Sharp Pass (Static) */}
        <canvas
          ref={sharpCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      </ParallaxLayer>

      {/* Invisible click target over the main star — cycles the accent theme.
          Same depth as the stars layer so it stays on top of the main star. */}
      <ParallaxLayer depth={10} className="z-20">
        <ThemeStar />
      </ParallaxLayer>

      {/* Top Left Corner Identity Watermark — on a torn-paper black card so it
          stays readable over the slab and bolt in every accent theme.
          The TEXT is never hidden: it's the page's Largest Contentful Paint, and
          text that starts at opacity 0 and fades in on the compositor never
          registers as LCP (Lighthouse then can't score performance at all).
          Only the card backing slams in behind it. */}
      <ParallaxLayer depth={12} className="z-20">
      <div
        className="absolute top-5 left-5 sm:top-9 sm:left-9 flex flex-col items-start pointer-events-none"
        style={{ padding: '14px 26px 16px 18px' }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={NAME_CARD_HIDDEN}
          animate={intro === "pending"
            ? NAME_CARD_HIDDEN
            : { x: 0, opacity: 1, transition: intro === "skip" ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 15, delay: 0.2 } }}
        >
          {/* White cut-paper offset behind the card — shows on the slab in any theme */}
          <div
            className="absolute inset-0"
            style={{ background: '#FFF', clipPath: NAME_CARD_CLIP, transform: 'translate(7px, 7px)' }}
          />
          {/* Black card face */}
          <div
            className="absolute inset-0"
            style={{ background: '#000', clipPath: NAME_CARD_CLIP }}
          />
        </motion.div>

        <h1
          className="relative"
          style={{
            fontFamily: 'var(--font-oswald)',
            fontWeight: 900,
            fontSize: '60px',
            lineHeight: 1,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            textShadow: '4px 4px 0px var(--red)',
            WebkitTextStroke: '2px #FFFFFF',
          }}
        >
          Charlie Neale
        </h1>

        <h2
          className="relative"
          style={{
            fontFamily: 'var(--font-oswald)',
            fontWeight: 400,
            fontSize: '16px',
            color: '#FFFFFF',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginTop: '6px',
          }}
        >
          UNDERGRADUATE · UNIVERSITY OF TORONTO
        </h2>

        <h3
          className="relative"
          style={{
            fontFamily: 'var(--font-marker)',
            fontSize: '14px',
            color: 'var(--red)',
            marginTop: '3px',
          }}
        >
          Computer Science · Astrophysics · Leadership
        </h3>
      </div>
      </ParallaxLayer>

      {/* Map Nodes Overlaid on Canvas Path — nearest layer, drifts the most */}
      <ParallaxLayer depth={12} className="z-20">
        {/* PROJECTS */}
        <MapNode
          label="PROJECTS"
          section="projects"
          onNavigate={onNavigate}
          baseScale={1.2}
          rotation={-20}
          cardRotation={-4}
          delay={0.8}
          direction="left"
          bottom="12%"
          left="25%"
        />

        {/* EXPERIENCE */}
        <MapNode
          label="EXPERIENCE"
          section="experience"
          onNavigate={onNavigate}
          baseScale={1.0}
          rotation={10}
          cardRotation={-2}
          delay={1.0}
          direction="left"
          top="30%"
          left="28%"
          portrait={{ top: "33%", left: "8%", scale: 0.85 }}
        />

        {/* ABOUT ME */}
        <MapNode
          label="ABOUT ME"
          section="about"
          onNavigate={onNavigate}
          baseScale={1.0}
          rotation={-15}
          cardRotation={-5}
          delay={1.2}
          direction="right"
          top="20%"
          left="70%"
          portrait={{ top: "46%", left: "6%", scale: 0.85 }}
        />
      </ParallaxLayer>

    </div>
  );
}


// ── MapNode ────────────────────────────────────────────────────────────────
const MapNode = ({
  label,
  section,
  onNavigate,
  top, left, right, bottom,
  baseScale,
  rotation = 0,
  cardRotation = 0,
  delay,
  direction,
  portrait,
}: {
  label: string;
  section: "projects" | "experience" | "about";
  onNavigate: (section: "projects" | "experience" | "about", x: number, y: number) => void;
  top?: string; left?: string; right?: string; bottom?: string;
  baseScale: number;
  rotation?: number;
  cardRotation?: number;
  delay: number;
  direction: 'left' | 'right';
  // Portrait-screen overrides; anything left out falls back to the values above
  portrait?: { top?: string; left?: string; right?: string; bottom?: string; scale?: number };
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const intro = useIntro();
  const offstage = { x: direction === 'left' ? -150 : 150, opacity: 0 };

  const handleClick = () => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      onNavigate(section, originX, originY);
    }
  };

  // Placement as CSS vars so `.map-node` can swap to the portrait set without
  // a JS layout check (no flash on load). Portrait vars only set when given.
  const placement = {
    "--top": top ?? "auto", "--left": left ?? "auto",
    "--right": right ?? "auto", "--bottom": bottom ?? "auto",
    "--scale": baseScale, "--rot": `${rotation}deg`,
    ...(portrait?.top && { "--p-top": portrait.top }),
    ...(portrait?.left && { "--p-left": portrait.left }),
    ...(portrait?.right && { "--p-right": portrait.right }),
    ...(portrait?.bottom && { "--p-bottom": portrait.bottom }),
    ...(portrait?.scale && { "--p-scale": portrait.scale }),
  } as React.CSSProperties;

  return (
    <div
      className="map-node absolute flex flex-col items-center pointer-events-auto"
      style={placement}
    >
      <motion.div
        ref={nodeRef}
        initial={offstage}
        animate={intro === "pending"
          ? offstage
          : { x: 0, opacity: 1, transition: intro === "skip" ? { duration: 0 } : { delay, type: "spring", stiffness: 100, damping: 14 } }}
        whileHover={{ x: -3, y: -3, transition: { type: "spring", stiffness: 400, damping: 20 } }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="p5-interactive relative cursor-pointer"
        style={{ transform: `rotate(${cardRotation}deg)` }}
      >
        {/* Red offset stamp shadow behind */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: isHovered ? 'translate(7px, 7px)' : 'translate(4px, 4px)',
            transition: 'transform 0.15s ease',
            background: 'var(--red)',
            clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
            zIndex: 0,
          }}
        />
        {/* Letter cluster container */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '8px 12px',
            clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
            background: '#000', // solid backing — reads over the bolt, flicker and dots
            boxShadow: isHovered ? 'inset 0 0 0 2px #FFF' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <LetterLabel letterConfigs={NAV_CONFIGS[label as keyof typeof NAV_CONFIGS] ?? []} isHovered={isHovered} />
        </div>
      </motion.div>
    </div>
  );
};
