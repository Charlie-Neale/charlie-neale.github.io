"use client";

import { useEffect, useRef } from "react";
import { PALETTE, Pt, VICTORY_BOLT, tracePolygon } from "./streetArt";
import { paint } from "./theme";

// ── Flicker patterns ──────────────────────────────────────────────────────────
// An echo is a hard-edged copy of the bolt, offset in viewport fractions.
// A frame with no echoes is a dark beat. Every burst plays one pattern.
type Echo = { dx: number; dy: number; fill: string; stroke?: string };
type Frame = { ms: number; echoes: Echo[] };

const { red, black, white } = PALETTE;

// Five hand-tuned patterns, played in a shuffled rotation.
const FLICKERS: Frame[][] = [
  // 1. Double tap — red, dark, red again further out
  [
    { ms: 70, echoes: [{ dx: 0.03, dy: -0.03, fill: red, stroke: black }] },
    { ms: 60, echoes: [] },
    { ms: 50, echoes: [{ dx: 0.04, dy: -0.04, fill: red, stroke: black }] },
  ],
  // 2. White strike — white flash snapping into a wide red echo
  [
    { ms: 60, echoes: [{ dx: 0.02, dy: -0.025, fill: white }] },
    { ms: 70, echoes: [{ dx: 0.045, dy: -0.04, fill: red, stroke: white }] },
  ],
  // 3. Black cut — black bolt slicing the other way, then a red answer
  [
    { ms: 90, echoes: [{ dx: -0.03, dy: -0.02, fill: black, stroke: white }] },
    { ms: 40, echoes: [] },
    { ms: 50, echoes: [{ dx: 0.03, dy: -0.02, fill: red, stroke: black }] },
  ],
  // 4. Stutter — four fast beats, each a different colour and angle
  [
    { ms: 40, echoes: [{ dx: 0.02, dy: -0.02, fill: red }] },
    { ms: 40, echoes: [{ dx: 0.035, dy: -0.01, fill: white }] },
    { ms: 40, echoes: [{ dx: 0.015, dy: -0.04, fill: red, stroke: black }] },
    { ms: 40, echoes: [{ dx: -0.025, dy: -0.025, fill: black, stroke: white }] },
  ],
  // 5. Heavy hit — black, white and red stacked, then a white after-image
  [
    {
      ms: 120,
      echoes: [
        { dx: 0.05, dy: -0.05, fill: black, stroke: white },
        { dx: 0.033, dy: -0.033, fill: white },
        { dx: 0.016, dy: -0.016, fill: red, stroke: black },
      ],
    },
    { ms: 50, echoes: [] },
    { ms: 40, echoes: [{ dx: 0.025, dy: -0.025, fill: white }] },
  ],
];

const BURST_GAP_MIN_MS = 1500;
const BURST_GAP_MAX_MS = 4000;
const OFFSET_JITTER = 0.016; // per-burst wobble on every echo offset

// ── Sparks: zigzags thrown off the bolt's vertices ───────────────────────────
type Spark = {
  origin: Pt;      // px
  dir: Pt;         // unit vector, outward
  shape: Pt[];     // zigzag points in px, relative to origin
  travel: number;  // px moved over its life
  life: number;    // ms
  width: number;
  color: string;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

const ON_SCREEN_VERTICES = VICTORY_BOLT.filter(p => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1);
const BOLT_CENTRE = {
  x: VICTORY_BOLT.reduce((s, p) => s + p.x, 0) / VICTORY_BOLT.length,
  y: VICTORY_BOLT.reduce((s, p) => s + p.y, 0) / VICTORY_BOLT.length,
};

const makeSpark = (w: number, h: number): Spark => {
  const v = pick(ON_SCREEN_VERTICES);
  const origin = { x: v.x * w, y: v.y * h };

  // Point away from the bolt's centre, then knock the angle off true
  const angle = Math.atan2(origin.y - BOLT_CENTRE.y * h, origin.x - BOLT_CENTRE.x * w) + rand(-0.6, 0.6);
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  const perp = { x: -dir.y, y: dir.x };

  const segments = Math.floor(rand(4, 7));
  const length = rand(90, 210);
  const amp = rand(10, 22);
  const shape = Array.from({ length: segments + 1 }, (_, i) => {
    const along = (length * i) / segments;
    const side = i === 0 ? 0 : (i % 2 ? amp : -amp);
    return { x: dir.x * along + perp.x * side, y: dir.y * along + perp.y * side };
  });

  return {
    origin, dir, shape,
    travel: rand(110, 230),
    life: rand(220, 340),
    width: rand(4, 7),
    color: pick([red, white, black]),
  };
};

export default function BoltFlicker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Shuffled bag of pattern indices, never repeating across a refill
    let bag: number[] = [];
    let last = -1;
    const nextPattern = () => {
      if (bag.length === 0) {
        bag = FLICKERS.map((_, i) => i).sort(() => Math.random() - 0.5);
        if (bag[0] === last) bag.push(bag.shift()!);
      }
      last = bag.shift()!;
      return FLICKERS[last];
    };

    let timer: ReturnType<typeof setTimeout>;
    let frameId = 0;

    const drawEcho = (e: Echo, jx: number, jy: number) => {
      tracePolygon(ctx, VICTORY_BOLT, w, h, (e.dx + jx) * w, (e.dy + jy) * h);
      ctx.fillStyle = paint(e.fill);
      ctx.fill();
      if (e.stroke) {
        ctx.strokeStyle = paint(e.stroke);
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };

    const strokeSpark = (s: Spark, progress: number) => {
      const ox = s.origin.x + s.dir.x * s.travel * progress;
      const oy = s.origin.y + s.dir.y * s.travel * progress;
      ctx.beginPath();
      s.shape.forEach((p, i) => (i === 0 ? ctx.moveTo(ox + p.x, oy + p.y) : ctx.lineTo(ox + p.x, oy + p.y)));
      // Black sparks get a white outline so they read on black
      if (s.color === black) {
        ctx.strokeStyle = white;
        ctx.lineWidth = s.width + 3;
        ctx.stroke();
      }
      ctx.strokeStyle = paint(s.color);
      ctx.lineWidth = s.width;
      ctx.stroke();
    };

    const burst = () => {
      const frames = nextPattern();
      const jx = rand(-OFFSET_JITTER, OFFSET_JITTER);
      const jy = rand(-OFFSET_JITTER, OFFSET_JITTER);
      const sparks = Array.from({ length: Math.floor(rand(3, 7)) }, () => makeSpark(w, h));
      const flickerMs = frames.reduce((s, f) => s + f.ms, 0);
      const totalMs = Math.max(flickerMs, ...sparks.map(s => s.life));
      const start = performance.now();

      const draw = (now: number) => {
        const t = now - start;
        ctx.clearRect(0, 0, w, h);

        let elapsed = 0;
        const frame = frames.find(f => t < (elapsed += f.ms));
        frame?.echoes.forEach(e => drawEcho(e, jx, jy));

        // Sparks snap out of existence at end of life — no fade
        ctx.lineJoin = "miter";
        sparks.forEach(s => t < s.life && strokeSpark(s, t / s.life));

        if (t < totalMs) {
          frameId = requestAnimationFrame(draw);
        } else {
          ctx.clearRect(0, 0, w, h);
          timer = setTimeout(burst, rand(BURST_GAP_MIN_MS, BURST_GAP_MAX_MS));
        }
      };
      frameId = requestAnimationFrame(draw);
    };

    timer = setTimeout(burst, rand(BURST_GAP_MIN_MS, BURST_GAP_MAX_MS));

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
