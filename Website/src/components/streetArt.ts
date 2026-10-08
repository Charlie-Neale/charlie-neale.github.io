// ── Street-art drawing helpers ────────────────────────────────────────────────
// Pure canvas functions shared by HomeMap and StreetBackdrop. All shapes are
// polygons in fractions of the viewport (0–1, may overshoot to bleed off-screen).

import { ACCENT, paint } from "./theme";

export type Pt = { x: number; y: number };

// Mirrors the tokens in globals.css — canvas can't read CSS vars directly.
// `red` is the theme accent token: always draw it through `paint()`.
// Greys are deliberately close to black/white: felt more than noticed.
export const PALETTE = {
  red: ACCENT,
  black: "#000000",
  white: "#FFFFFF",
  greyDark: "#141414",
  greyLight: "#EDEDED",
} as const;

export const tracePolygon = (
  ctx: CanvasRenderingContext2D,
  points: Pt[],
  w: number,
  h: number,
  dx = 0,
  dy = 0,
) => {
  ctx.beginPath();
  ctx.moveTo(points[0].x * w + dx, points[0].y * h + dy);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * w + dx, points[i].y * h + dy);
  }
  ctx.closePath();
};

export const fillSlab = (
  ctx: CanvasRenderingContext2D,
  points: Pt[],
  w: number,
  h: number,
  fill: string,
  dx = 0,
  dy = 0,
) => {
  tracePolygon(ctx, points, w, h, dx, dy);
  ctx.fillStyle = paint(fill);
  ctx.fill();
};

// ── Phase 1 composition ───────────────────────────────────────────────────────
// Hand-placed, like the LetterLabel chaos: tweak points, don't generate them.

// Red block tearing in from the top-left corner, behind the name. Its lower
// edge stays above the bolt's upper edge so a black gap keeps them apart.
export const RED_SLAB: Pt[] = [
  { x: -0.05, y: -0.05 },
  { x: 0.56, y: -0.05 },
  { x: 0.44, y: 0.08 },
  { x: 0.50, y: 0.10 },
  { x: 0.36, y: 0.22 },
  { x: 0.41, y: 0.24 },
  { x: 0.20, y: 0.36 },
  { x: 0.24, y: 0.39 },
  { x: 0.04, y: 0.47 },
  { x: -0.05, y: 0.52 },
];

// White shard in the bottom-right corner, clear of the bolt and its shadow so
// the bolt reads as its own section. Its upper edge zigzags parallel to the bolt.
export const WHITE_SHARD: Pt[] = [
  { x: 1.05, y: 0.30 },
  { x: 1.05, y: 1.05 },
  { x: 0.50, y: 1.05 },
  { x: 0.60, y: 0.95 },
  { x: 0.55, y: 0.92 },
  { x: 0.72, y: 0.78 },
  { x: 0.66, y: 0.74 },
  { x: 0.84, y: 0.62 },
  { x: 0.78, y: 0.58 },
  { x: 0.97, y: 0.46 },
  { x: 0.92, y: 0.42 },
];

// Light-grey cut band inside the white shard — only visible up close.
export const WHITE_SHARD_BAND: Pt[] = [
  { x: 1.05, y: 0.55 },
  { x: 1.05, y: 0.575 },
  { x: 0.695, y: 1.05 },
  { x: 0.67, y: 1.05 },
];

// ── Nested star bursts ────────────────────────────────────────────────────────
// Phantom Thieves star: filled five-point stars stacked from largest to
// smallest, alternating colours, so the gaps read as thick bands.
export type StarBurst = {
  cx: number;          // viewport fraction
  cy: number;          // viewport fraction
  radius: number;      // fraction of min(w, h) — keeps the star unstretched
  innerRatio: number;  // inner/outer vertex radius; higher = chunkier star
  rotation: number;    // degrees, whole burst
  ringTwist: number[]; // extra degrees per ring, hand-set — one entry per ring
  colors: string[];    // cycled outermost → innermost
  // Portrait screens: the shard's open white sits higher (PROJECTS covers its
  // bottom), so each burst gets its own placement there.
  portrait: { cx: number; cy: number; radius: number };
};

const traceStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  rotationDeg: number,
) => {
  const start = ((rotationDeg - 90) * Math.PI) / 180; // first point straight up
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = start + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

export const drawStarBurst = (ctx: CanvasRenderingContext2D, burst: StarBurst, w: number, h: number) => {
  const place = h > w ? burst.portrait : burst;
  const cx = place.cx * w;
  const cy = place.cy * h;
  const outer = place.radius * Math.min(w, h);
  const rings = burst.ringTwist.length;

  burst.ringTwist.forEach((twist, i) => {
    const r = outer * (1 - i / rings);
    traceStar(ctx, cx, cy, r, r * burst.innerRatio, burst.rotation + twist);
    ctx.fillStyle = paint(burst.colors[i % burst.colors.length]);
    ctx.fill();
  });
};

// STAR_BURSTS[MAIN_STAR] doubles as the theme switch (see ThemeStar).
export const MAIN_STAR = 1;

// One tight cluster on the bottom-right white shard: every burst touches at
// least one other, white shows around the cluster. Drawn back to front.
// Portrait: PROJECTS covers the shard's bottom, so the cluster sits in the open
// white strip above it instead.
const { black, red, white } = PALETTE;

export const STAR_BURSTS: StarBurst[] = [
  // Corner: big red/black burst filling the bottom-right, behind the main
  {
    cx: 0.95, cy: 0.95, radius: 0.15, innerRatio: 0.5, rotation: 22,
    ringTwist: [0, -2, 1, -3, 2],
    colors: [red, black],
    portrait: { cx: 0.91, cy: 0.70, radius: 0.13 },
  },
  // Main: red/black bands like the reference
  {
    cx: 0.87, cy: 0.82, radius: 0.17, innerRatio: 0.5, rotation: -12,
    ringTwist: [0, 2, -1, 3, 1, -2],
    colors: [black, red],
    portrait: { cx: 0.84, cy: 0.62, radius: 0.13 },
  },
  // Upper: red/white outline rings above the main star
  {
    cx: 0.93, cy: 0.685, radius: 0.09, innerRatio: 0.5, rotation: 8,
    ringTwist: [0, 3, -2, 1],
    colors: [red, white, red, black],
    portrait: { cx: 0.88, cy: 0.565, radius: 0.08 },
  },
  // Mid: solid black/red burst on the main star's left arm
  {
    cx: 0.76, cy: 0.79, radius: 0.07, innerRatio: 0.5, rotation: -25,
    ringTwist: [0, 4, -2],
    colors: [black, red, black],
    portrait: { cx: 0.76, cy: 0.67, radius: 0.06 },
  },
  // Small: black outline rings — white between them is the shard — red heart
  {
    cx: 0.72, cy: 0.89, radius: 0.1, innerRatio: 0.5, rotation: 14,
    ringTwist: [0, -3, 2, 0],
    colors: [black, white, black, red],
    portrait: { cx: 0.79, cy: 0.75, radius: 0.07 },
  },
  // Bottom: black/white outline burst dipping off the bottom edge, red heart
  {
    cx: 0.79, cy: 0.99, radius: 0.085, innerRatio: 0.5, rotation: -6,
    ringTwist: [0, 2, -1, 3, 0],
    colors: [black, white, black, white, red],
    portrait: { cx: 0.96, cy: 0.61, radius: 0.06 },
  },
];

// Chaotic Joker Victory Bolt — shared by HomeMap (draws it) and BoltFlicker
// (echoes it and throws sparks off its vertices).
export const VICTORY_BOLT: Pt[] = [
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
  { x: -0.1, y: 1.0 },
];
