"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SectionType } from "./ZoomNav";
import { LetterLabel, PROJECTS_NAV, EXPERIENCE_NAV, ABOUT_ME_NAV } from "./LetterLabel";
import StreetBackdrop from "./StreetBackdrop";
import BoltFlicker from "./BoltFlicker";
import { VICTORY_BOLT, tracePolygon } from "./streetArt";

const NAV_CONFIGS = {
  PROJECTS: PROJECTS_NAV,
  EXPERIENCE: EXPERIENCE_NAV,
  "ABOUT ME": ABOUT_ME_NAV,
} as const;

export default function HomeMap({ onNavigate }: { onNavigate: (section: SectionType, x?: number, y?: number) => void }) {
  const sharpCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sharpCanvas = sharpCanvasRef.current;
    const sharpCtx = sharpCanvas?.getContext("2d");
    if (!sharpCanvas || !sharpCtx) return;

    const resizeAndDraw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = sharpCanvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      sharpCanvas.width = w * dpr;
      sharpCanvas.height = h * dpr;
      sharpCtx.scale(dpr, dpr);
      sharpCtx.clearRect(0, 0, w, h);

      // 1. SECONDARY BACKGROUND SHADOW BOLT (Pure red, offset left and down)
      tracePolygon(sharpCtx, VICTORY_BOLT, w, h, -w * 0.04, h * 0.04);
      sharpCtx.fillStyle = "#FF0000"; // Pure red accent
      sharpCtx.fill();

      // 2. MAIN PURE RED BOLT
      tracePolygon(sharpCtx, VICTORY_BOLT, w, h);
      sharpCtx.fillStyle = "#FF0000"; // Pure saturated red
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
    return () => window.removeEventListener("resize", resizeAndDraw);
  }, []);


  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start text-[var(--white)] overflow-hidden">
      
      {/* Street-art colour blocks behind everything */}
      <StreetBackdrop />

      {/* Randomised flicker echoes + flying zigzags, behind the bolt */}
      <BoltFlicker />

      {/* Canvas Sharp Pass (Static) */}
      <canvas 
        ref={sharpCanvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Top Left Corner Identity Watermark */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-20 flex flex-col items-start pointer-events-none">
        <motion.h1
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          style={{ 
            fontFamily: 'var(--font-oswald)',
            fontWeight: 900,
            fontSize: '60px',
            lineHeight: 1,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            textShadow: '4px 4px 0px #000000',
            WebkitTextStroke: '2px #FFFFFF',
          }}
        >
          Charlie Neale
        </motion.h1>

        <h2
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
          style={{
            fontFamily: 'var(--font-marker)',
            fontSize: '14px',
            color: '#000000',
            marginTop: '3px',
          }}
        >
          Computer Science · Astrophysics · Leadership
        </h3>
      </div>

      {/* Map Nodes Overlaid on Canvas Path */}
      <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
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
        />
      </div>

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
  direction
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
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      onNavigate(section, originX, originY);
    }
  };

  return (
    <div 
      className="absolute flex flex-col items-center pointer-events-auto" 
      style={{ top, left, right, bottom, transform: `scale(${baseScale}) rotate(${rotation}deg)` }}
    >
      <motion.div
        ref={nodeRef}
        initial={{ x: direction === 'left' ? -150 : 150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay, type: "spring", stiffness: 100, damping: 14 }}
        whileHover={{ x: -3, y: -3 }}
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
            background: '#FF0000',
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
            background: 'rgba(0,0,0,0.3)', // subtle backing so letters float above
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
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
