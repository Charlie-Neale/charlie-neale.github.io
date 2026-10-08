"use client";

import { useEffect, useRef } from "react";
import { PALETTE, RED_SLAB, WHITE_SHARD, WHITE_SHARD_BAND, fillSlab, tracePolygon } from "./streetArt";

// Hard-edged colour blocks behind the victory bolt. Lives inside HomeMap so it
// scales with the map during the ZoomNav zoom. Drawn once per resize.
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

      // 3. Red slab tearing in from the top-left
      fillSlab(ctx, RED_SLAB, w, h, PALETTE.red);
    };

    resizeAndDraw();
    window.addEventListener("resize", resizeAndDraw);
    return () => window.removeEventListener("resize", resizeAndDraw);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
