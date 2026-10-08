"use client";

import { useEffect, useRef } from "react";
import {
  PALETTE, RED_SLAB, SPLATTERS, STAR_BURSTS, WHITE_SHARD, WHITE_SHARD_BAND,
  drawSplatter, drawStarBurst, fillSlab, tracePolygon,
} from "./streetArt";
import { THEME_EVENT } from "./theme";

// Hard-edged colour blocks behind the victory bolt. Lives inside HomeMap so it
// scales with the map during the ZoomNav zoom. Drawn once per resize and once
// per theme change.
export default function StreetBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resizeAndDraw = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width: w, height: h } = canvas.getBoundingClientRect();
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // 1. Dark-grey echo of the white shard — a sliver on black, barely there
      fillSlab(ctx, WHITE_SHARD, w, h, PALETTE.greyDark, -w * 0.012, -h * 0.02);

      // 2. White shard, with a light-grey cut band clipped inside it
      fillSlab(ctx, WHITE_SHARD, w, h, PALETTE.white);
      ctx.save();
      tracePolygon(ctx, WHITE_SHARD, w, h);
      ctx.clip();
      fillSlab(ctx, WHITE_SHARD_BAND, w, h, PALETTE.greyLight);
      ctx.restore();

      // 3. Ink splatter off the shard's edge: black lands on the white, white
      //    kicks out into the black
      drawSplatter(ctx, SPLATTERS.shardIn, w, h);
      drawSplatter(ctx, SPLATTERS.shardOut, w, h);

      // 4. Star bursts on top of the white shard (and its splatter)
      STAR_BURSTS.forEach(burst => drawStarBurst(ctx, burst, w, h));

      // 5. Red slab tearing in from the top-left
      fillSlab(ctx, RED_SLAB, w, h, PALETTE.red);
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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
