'use client'
import { useEffect, useRef } from 'react'

// ── Cursor sparkle trail ──────────────────────────────────────────────────────
// The four-point sparkles from the Joker victory screen trail the cursor. Black
// like the reference, with a thin white edge so they read on black, red, white
// and every accent theme. Each one pops to full size, drifts a touch, then
// shrinks to nothing — no fades, per the site's snap-don't-fade rule.
// One fixed canvas over everything (pointer-events: none). The loop only runs
// while sparkles are alive. Off on touch screens and under reduced motion.

const SPAWN_EVERY_PX = 22    // cursor travel between sparkles
const MAX_SPARKLES = 60
const SIZE_MIN = 9           // px, half-height of the sparkle
const SIZE_MAX = 24
const ARM_FATNESS = 0.16     // 0 = needle-thin arms, higher = chunkier body
const LIFE_MIN_MS = 450
const LIFE_MAX_MS = 750
const POP_FRACTION = 0.12    // share of life spent popping up to full size
const SCATTER_PX = 14        // random offset from the cursor path
const DRIFT_PX = 18          // how far a sparkle drifts over its life

type Sparkle = {
  x: number; y: number
  dx: number; dy: number     // drift over the whole life
  rv: number; rh: number     // vertical / horizontal arm length
  tilt: number               // radians
  born: number; life: number
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

// Pinched four-point star: each arm curves in toward the centre. The control
// points sit slightly out from the centre so the body has some weight.
const traceSparkle = (ctx: CanvasRenderingContext2D, rv: number, rh: number) => {
  const c = Math.min(rv, rh) * ARM_FATNESS
  ctx.beginPath()
  ctx.moveTo(0, -rv)
  ctx.quadraticCurveTo(c, -c, rh, 0)
  ctx.quadraticCurveTo(c, c, 0, rv)
  ctx.quadraticCurveTo(-c, c, -rh, 0)
  ctx.quadraticCurveTo(-c, -c, 0, -rv)
  ctx.closePath()
}

export default function CursorStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduce) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const sparkles: Sparkle[] = []
    let last: { x: number; y: number } | null = null
    let travelled = 0
    let frame = 0

    const spawn = (x: number, y: number) => {
      if (sparkles.length >= MAX_SPARKLES) sparkles.shift()
      const rv = rand(SIZE_MIN, SIZE_MAX)
      const ang = rand(0, Math.PI * 2)
      const drift = rand(DRIFT_PX * 0.3, DRIFT_PX)
      sparkles.push({
        x: x + rand(-SCATTER_PX, SCATTER_PX),
        y: y + rand(-SCATTER_PX, SCATTER_PX),
        dx: Math.cos(ang) * drift,
        dy: Math.sin(ang) * drift,
        rv,
        rh: rv * rand(0.55, 0.95),   // most are taller than wide, like the reference
        tilt: rand(-0.25, 0.25),
        born: performance.now(),
        life: rand(LIFE_MIN_MS, LIFE_MAX_MS),
      })
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        const t = (now - s.born) / s.life
        if (t >= 1) { sparkles.splice(i, 1); continue }
        // Pop up fast, then shrink linearly to a point
        const scale = t < POP_FRACTION ? t / POP_FRACTION : 1 - (t - POP_FRACTION) / (1 - POP_FRACTION)
        ctx.save()
        ctx.translate(s.x + s.dx * t, s.y + s.dy * t)
        ctx.rotate(s.tilt)
        traceSparkle(ctx, s.rv * scale, s.rh * scale)
        ctx.lineWidth = 1.5
        ctx.strokeStyle = '#FFFFFF'
        ctx.stroke()
        ctx.fillStyle = '#000000'
        ctx.fill()
        ctx.restore()
      }
      frame = sparkles.length ? requestAnimationFrame(draw) : 0
    }

    const onMove = (e: MouseEvent) => {
      const p = { x: e.clientX, y: e.clientY }
      if (last) travelled += Math.hypot(p.x - last.x, p.y - last.y)
      last = p
      while (travelled >= SPAWN_EVERY_PX) {
        travelled -= SPAWN_EVERY_PX
        spawn(p.x, p.y)
      }
      if (!frame && sparkles.length) frame = requestAnimationFrame(draw)
    }
    const onLeave = () => { last = null; travelled = 0 }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}
    />
  )
}
