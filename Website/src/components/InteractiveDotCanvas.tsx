'use client'
import { useEffect, useRef, useCallback } from 'react'
import { currentAccent } from './theme'

const DOT_SPACING = 12
const DOT_RADIUS = 2
const MAX_RADIUS = 5.5
const MAX_DISPLACEMENT = 20
const INFLUENCE_RADIUS = 120
const LERP_SPEED = 0.12
const DOT_ALPHA = 0.35 // dots are the theme accent at this opacity

type Dot = { ox: number; oy: number; cx: number; cy: number; r: number }

export default function InteractiveDotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef<number>()
  const dotsRef = useRef<Dot[]>([])

  const buildGrid = useCallback((w: number, h: number) => {
    const dots: Dot[] = []
    for (let y = 0; y < h + DOT_SPACING; y += DOT_SPACING)
      for (let x = 0; x < w + DOT_SPACING; x += DOT_SPACING)
        dots.push({ ox: x, oy: y, cx: x, cy: y, r: DOT_RADIUS })
    dotsRef.current = dots
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      buildGrid(window.innerWidth, window.innerHeight)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const handleLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = DOT_ALPHA
      ctx.fillStyle = currentAccent()
      ctx.beginPath()

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const dot of dotsRef.current) {
        const dx = dot.ox - mx
        const dy = dot.oy - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        let targetX = dot.ox
        let targetY = dot.oy
        let targetR = DOT_RADIUS

        if (dist < INFLUENCE_RADIUS && dist > 0.5) {
          const t = Math.max(0, 1 - dist / INFLUENCE_RADIUS)
          const tt = t * t

          targetR = DOT_RADIUS + (MAX_RADIUS - DOT_RADIUS) * tt

          const nx = dx / dist
          const ny = dy / dist
          targetX = dot.ox + nx * MAX_DISPLACEMENT * tt
          targetY = dot.oy + ny * MAX_DISPLACEMENT * tt
        }

        dot.cx += (targetX - dot.cx) * LERP_SPEED
        dot.cy += (targetY - dot.cy) * LERP_SPEED
        dot.r  += (targetR  - dot.r)  * LERP_SPEED

        ctx.moveTo(dot.cx + dot.r, dot.cy)
        ctx.arc(dot.cx, dot.cy, dot.r, 0, Math.PI * 2)
      }

      ctx.fill()
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [buildGrid])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
