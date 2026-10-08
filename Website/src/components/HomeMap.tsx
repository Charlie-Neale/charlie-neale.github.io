"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SectionType } from "./ZoomNav";
import { LetterLabel, PROJECTS_NAV, EXPERIENCE_NAV, ABOUT_ME_NAV } from "./LetterLabel";

const NAV_CONFIGS = {
  PROJECTS: PROJECTS_NAV,
  EXPERIENCE: EXPERIENCE_NAV,
  "ABOUT ME": ABOUT_ME_NAV,
} as const;

export default function HomeMap({ onNavigate }: { onNavigate: (section: SectionType, x?: number, y?: number) => void }) {
  const glowCanvasRef = useRef<HTMLCanvasElement>(null);
  const sharpCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const glowCanvas = glowCanvasRef.current;
    const sharpCanvas = sharpCanvasRef.current;
    if (!glowCanvas || !sharpCanvas) return;
    
    const glowCtx = glowCanvas.getContext("2d");
    const sharpCtx = sharpCanvas.getContext("2d");
    if (!glowCtx || !sharpCtx) return;

    const resizeAndDraw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = glowCanvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      [glowCanvas, sharpCanvas].forEach(canvas => {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      });
      [glowCtx, sharpCtx].forEach(ctx => {
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);
      });

      // Chaotic Joker Victory Bolt Polygon (Percentages of w, h)
      const primaryPoints = [
        // Bottom Edge
        { x: -0.1, y: 1.1 },
        { x: 0.2, y: 1.1 },
        
        // Right/Lower Edge (Zigzagging up-right)
        { x: 0.35, y: 0.85 }, // Near PROJECTS
        { x: 0.25, y: 0.75 }, // notch
        { x: 0.55, y: 0.65 }, // spike
        { x: 0.40, y: 0.55 }, // deep cut
        { x: 0.65, y: 0.50 }, // Near EXPERIENCE
        { x: 0.60, y: 0.35 }, // notch
        { x: 0.85, y: 0.25 }, // spike
        { x: 0.80, y: 0.15 }, // notch
        { x: 1.1, y: -0.1 },  // Tip off-screen
        
        // Top/Upper Edge (Zigzagging down-left)
        { x: 0.9, y: -0.1 }, 
        { x: 0.6, y: 0.15 }, // cut down
        { x: 0.65, y: 0.2 }, // spike out
        { x: 0.4, y: 0.35 }, // cut down
        { x: 0.45, y: 0.45 },// spike out
        { x: 0.1, y: 0.55 }, // deep cut down left
        { x: 0.2, y: 0.65 }, // spike out
        { x: 0.0, y: 0.8 },  // cut down
        { x: 0.05, y: 0.9 }, // spike out
        { x: -0.1, y: 1.0 }
      ];

      const drawPolygon = (ctx: CanvasRenderingContext2D, points: {x:number, y:number}[], dx=0, dy=0) => {
        ctx.beginPath();
        ctx.moveTo(points[0].x * w + dx, points[0].y * h + dy);
        for(let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x * w + dx, points[i].y * h + dy);
        }
        ctx.closePath();
      };

      // 1. SECONDARY BACKGROUND SHADOW BOLT (Pure red, offset left and down)
      drawPolygon(sharpCtx, primaryPoints, -w * 0.04, h * 0.04);
      sharpCtx.fillStyle = "#FF0000"; // Pure red accent
      sharpCtx.fill();

      // 2. GLOW PASS (Rendered into glow canvas, CSS pulse animated)
      drawPolygon(glowCtx, primaryPoints);
      glowCtx.filter = "blur(30px)";
      glowCtx.fillStyle = "#FF0000";
      glowCtx.fill();

      // 3. MAIN PURE RED BOLT
      drawPolygon(sharpCtx, primaryPoints);
      sharpCtx.fillStyle = "#FF0000"; // Pure saturated red
      sharpCtx.fill();

      // 4. CUT-PAPER THICK STROKE
      sharpCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      sharpCtx.lineWidth = 6;
      sharpCtx.stroke();

      // 5. THIN WHITE 1px OUTLINE
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
      
      {/* Canvas Glow Pass (CSS Pulse Animated) */}
      <canvas 
        ref={glowCanvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10 bolt-pulse"
      />

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
            textShadow: '3px 3px 0px #FF0000',
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
            color: '#FF0000',
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
