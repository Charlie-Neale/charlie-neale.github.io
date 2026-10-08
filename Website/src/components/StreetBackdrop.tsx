"use client";

import { useCallback, useEffect, useRef } from "react";
import { BOLT_BURST_EVENT } from "./BoltFlicker";
import { useIntro } from "./Intro";
import { ParallaxLayer } from "./Parallax";
import {
  CUT_LINES, PALETTE, RED_SLAB, SPLATTERS, STAR_BURSTS, WHITE_SHARD, WHITE_SHARD_BAND,
  drawCutLine, drawSplatter, drawStarBurst, fillSlab, tracePolygon,
} from "./streetArt";
import { THEME_EVENT } from "./theme";

// Hard-edged colour blocks behind the victory bolt, split into three canvases
// so each can slam in and drift on its own: the white shard (with its splatter
// and cut lines), the star cluster, and the red slab. Lives inside HomeMap so
// it scales with the map during the ZoomNav zoom.

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

// Sizes a canvas to its layout box (not getBoundingClientRect — that includes
// the parallax/zoom transforms), redraws on resize and theme change, and hands
// back `repaint` for layers that animate.
const useLayerCanvas = (draw: Draw) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const size = useRef({ w: 0, h: 0 });

  const repaint = useCallback(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const { w, h } = size.current;
    ctx.clearRect(0, 0, w, h);
    drawRef.current(ctx, w, h);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.current = { w, h };
      repaint();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener(THEME_EVENT, repaint);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(THEME_EVENT, repaint);
    };
  }, [repaint]);

  return { ref, repaint };
};

const LayerCanvas = ({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement> }) => (
  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
);

// ── White shard + splatter + cut lines ────────────────────────────────────────
function ShardLayer() {
  const { ref } = useLayerCanvas((ctx, w, h) => {
    // Dark-grey echo of the white shard — a sliver on black, barely there
    fillSlab(ctx, WHITE_SHARD, w, h, PALETTE.greyDark, -w * 0.012, -h * 0.02);

    // White shard, with a light-grey cut band clipped inside it
    fillSlab(ctx, WHITE_SHARD, w, h, PALETTE.white);
    ctx.save();
    tracePolygon(ctx, WHITE_SHARD, w, h);
    ctx.clip();
    fillSlab(ctx, WHITE_SHARD_BAND, w, h, PALETTE.greyLight);
    ctx.restore();

    // Ink splatter off the shard's edge: black lands on the white, white kicks
    // out into the black
    drawSplatter(ctx, SPLATTERS.shardIn, w, h);
    drawSplatter(ctx, SPLATTERS.shardOut, w, h);

    // Sharp cut lines in the black gaps
    CUT_LINES.forEach(line => drawCutLine(ctx, line, w, h));
  });
  return <LayerCanvas canvasRef={ref} />;
}

// ── Star cluster: pops in one by one, snaps on every bolt flicker ────────────
const STAR_START_MS = 450;  // first star pops after the slab and shard land
const STAR_STAGGER_MS = 90;
const STAR_POP_MS = 160;
const POP_SCALE = 0.35;     // extra size at the start of the pop
const POP_TWIST = -25;      // degrees at the start of the pop
const SNAP_MIN = 2;         // degrees per flicker snap
const SNAP_MAX = 5;

function StarsLayer() {
  const intro = useIntro();
  const twist = useRef(STAR_BURSTS.map(() => 0));   // accumulated snap rotation
  // Per-star pop progress 0→1 (0 = not drawn yet); null = all at rest
  const pop = useRef<number[] | null>(STAR_BURSTS.map(() => 0));

  const { ref, repaint } = useLayerCanvas((ctx, w, h) => {
    STAR_BURSTS.forEach((burst, i) => {
      const p = pop.current ? pop.current[i] : 1;
      if (p <= 0) return;
      const k = 1 - p;
      drawStarBurst(ctx, burst, w, h, {
        rotate: twist.current[i] + POP_TWIST * k,
        scale: 1 + POP_SCALE * k,
      });
    });
  });

  // Intro: skip → draw at rest; play → staggered pops
  useEffect(() => {
    if (intro === "pending") return;
    if (intro === "skip") {
      pop.current = null;
      repaint();
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = now - start;
      pop.current = STAR_BURSTS.map((_, i) =>
        Math.min(1, Math.max(0, (t - STAR_START_MS - i * STAR_STAGGER_MS) / STAR_POP_MS)),
      );
      repaint();
      if (pop.current.every(p => p === 1)) {
        pop.current = null;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [intro, repaint]);

  // Snap: every bolt burst kicks each star a few degrees, alternating
  // direction, and it stays there — no tween, just a cut.
  useEffect(() => {
    const snap = () => {
      twist.current = twist.current.map(
        (v, i) => v + (i % 2 ? -1 : 1) * (SNAP_MIN + Math.random() * (SNAP_MAX - SNAP_MIN)),
      );
      repaint();
    };
    window.addEventListener(BOLT_BURST_EVENT, snap);
    return () => window.removeEventListener(BOLT_BURST_EVENT, snap);
  }, [repaint]);

  return <LayerCanvas canvasRef={ref} />;
}

// ── Red slab ──────────────────────────────────────────────────────────────────
function SlabLayer() {
  const { ref } = useLayerCanvas((ctx, w, h) => fillSlab(ctx, RED_SLAB, w, h, PALETTE.red));
  return <LayerCanvas canvasRef={ref} />;
}

// Slam-in: slab from the top-left, shard from the bottom-right — hard springs
const SLAM = { type: "spring", stiffness: 260, damping: 26 } as const;

export default function StreetBackdrop() {
  return (
    <>
      <ParallaxLayer depth={4} className="z-0" hidden={{ x: "35%", y: "35%" }} transition={{ ...SLAM, delay: 0.1 }}>
        <ShardLayer />
      </ParallaxLayer>
      <ParallaxLayer depth={10} className="z-0">
        <StarsLayer />
      </ParallaxLayer>
      <ParallaxLayer depth={4} className="z-0" hidden={{ x: "-35%", y: "-35%" }} transition={SLAM}>
        <SlabLayer />
      </ParallaxLayer>
    </>
  );
}
