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

// ── Ink splatter ──────────────────────────────────────────────────────────────
// Seeded so the splatter is identical on every load and resize — it scales
// with the viewport but never reshuffles. Like the chaos letters: tune the
// seed/counts by eye, don't regenerate per render.

// mulberry32: tiny deterministic PRNG, returns floats in [0, 1)
export const seededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const insidePolygon = (p: Pt, poly: Pt[]) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
};

export type Splatter = {
  area: Pt[];          // the colour area whose edge throws ink (viewport fractions)
  edge: Pt[];          // polyline along that area's boundary to throw from
  direction: "out" | "in"; // out = ink leaves the area, in = ink lands inside it
  color: string;       // PALETTE colour (accent allowed — goes through paint())
  seed: number;
  clusters: number;
};

export const drawSplatter = (ctx: CanvasRenderingContext2D, s: Splatter, w: number, h: number) => {
  const rand = seededRandom(s.seed);
  const r = (min: number, max: number) => min + rand() * (max - min);
  const S = Math.min(w, h);
  const px = s.edge.map(p => ({ x: p.x * w, y: p.y * h }));
  const area = s.area.map(p => ({ x: p.x * w, y: p.y * h }));

  // Segment lengths so clusters spread evenly along the whole edge
  const lengths = px.slice(1).map((p, i) => Math.hypot(p.x - px[i].x, p.y - px[i].y));
  const total = lengths.reduce((a, b) => a + b, 0);

  ctx.fillStyle = paint(s.color);

  for (let c = 0; c < s.clusters; c++) {
    // Pick a point on the edge
    let at = rand() * total;
    let i = 0;
    while (at > lengths[i] && i < lengths.length - 1) at -= lengths[i++];
    const a = px[i], b = px[i + 1];
    const t = at / lengths[i];
    const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };

    // Normal pointing the way the ink flies
    const tx = (b.x - a.x) / lengths[i], ty = (b.y - a.y) / lengths[i];
    let n = { x: -ty, y: tx };
    const probeInside = insidePolygon({ x: p.x + n.x * 4, y: p.y + n.y * 4 }, area);
    if ((s.direction === "out") === probeInside) n = { x: -n.x, y: -n.y };

    // Main blot straddling the edge, roughened with overlapping lobes
    const blot = r(0.009, 0.02) * S;
    const bx = p.x + n.x * blot * 0.4, by = p.y + n.y * blot * 0.4;
    ctx.beginPath();
    ctx.arc(bx, by, blot, 0, Math.PI * 2);
    for (let k = 0; k < 4; k++) {
      const ang = r(0, Math.PI * 2);
      const lx = bx + Math.cos(ang) * blot * 0.8, ly = by + Math.sin(ang) * blot * 0.8;
      const lobe = blot * r(0.35, 0.6);
      ctx.moveTo(lx + lobe, ly);
      ctx.arc(lx, ly, lobe, 0, Math.PI * 2);
    }
    ctx.fill();

    // Drops thrown outward — smaller the further they fly
    const maxReach = r(0.06, 0.13) * S;
    const drops = Math.floor(r(6, 13));
    ctx.beginPath();
    for (let k = 0; k < drops; k++) {
      const d = r(blot * 1.5, maxReach);
      const spread = r(-0.5, 0.5);
      const dx = n.x * d + tx * d * spread;
      const dy = n.y * d + ty * d * spread;
      const rad = Math.max(1, r(0.002, 0.0065) * S * (1 - d / (maxReach * 1.2)));
      ctx.moveTo(p.x + dx + rad, p.y + dy);
      ctx.arc(p.x + dx, p.y + dy, rad, 0, Math.PI * 2);
    }
    ctx.fill();

    // Streaks: tapered spikes shooting out of the blot
    const streaks = Math.floor(r(0, 3));
    for (let k = 0; k < streaks; k++) {
      const ang = Math.atan2(n.y, n.x) + r(-0.45, 0.45);
      const len = r(0.035, 0.09) * S;
      const half = blot * r(0.25, 0.45);
      const ux = Math.cos(ang), uy = Math.sin(ang);
      ctx.beginPath();
      ctx.moveTo(bx - uy * half, by + ux * half);
      ctx.lineTo(bx + ux * len, by + uy * len);
      ctx.lineTo(bx + uy * half, by - ux * half);
      ctx.closePath();
      ctx.fill();
    }
  }
};

// The white shard's zigzag upper edge
const SHARD_EDGE: Pt[] = [...WHITE_SHARD.slice(2), WHITE_SHARD[0]];

// Bottom-right only: white kicks out of the shard into the black; black lands
// on the white (under the stars). The red slab stays clean on purpose.
export const SPLATTERS = {
  shardOut: { area: WHITE_SHARD, edge: SHARD_EDGE, direction: "out", color: PALETTE.white, seed: 5, clusters: 8 },
  shardIn: { area: WHITE_SHARD, edge: SHARD_EDGE, direction: "in", color: PALETTE.black, seed: 17, clusters: 6 },
} satisfies Record<string, Splatter>;

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
