// ── Street-art drawing helpers ────────────────────────────────────────────────
// Pure canvas functions shared by HomeMap and StreetBackdrop. All shapes are
// polygons in fractions of the viewport (0–1, may overshoot to bleed off-screen).

export type Pt = { x: number; y: number };

// Mirrors the tokens in globals.css — canvas can't read CSS vars directly.
// Greys are deliberately close to black/white: felt more than noticed.
export const PALETTE = {
  red: "#FF0000",
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
  ctx.fillStyle = fill;
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
