'use client'

import { useEffect, useRef } from 'react'

/**
 * WindField — KHAMSIN's signature element.
 *
 * Ported from the founder's prototype (14 phase-shifted sine ridges drifting
 * on canvas) and extended in six ways, each aimed at making it read as real
 * moving air rather than an obvious looping sine wave:
 *
 *  1. Multi-harmonic ridges — each contour is the sum of three sine harmonics
 *     at unrelated frequencies, so the crest pattern never visibly repeats.
 *  2. Atmospheric depth — ridges near the top of the frame are thinner, paler
 *     and slower (far away); ridges near the bottom are heavier and faster
 *     (close). This is what stops it reading as flat line-art.
 *  3. Gusts — travelling envelopes sweep left→right at irregular intervals,
 *     locally swelling amplitude and speed. The field breathes instead of
 *     looping, which is the single biggest contributor to "this is wind".
 *  4. Sand carried on the gust — fine elongated streaks, spawned denser and
 *     faster while a gust passes over them.
 *  5. Pointer wake — air curls slightly around the cursor (desktop only).
 *  6. Scroll coupling — the whole field drifts against page scroll.
 *
 * Performance tiers: desktop full; mobile drops particles and halves ridges;
 * prefers-reduced-motion paints one static frame and never starts a loop.
 */

const BLEACHED = '#FAF6EF'
const BONE = '#F1EAD9'
const SAND = '#C6AE82'
const DUNE = '#9C8563'
const CLAY = '#B5673A'

type Harmonic = { freq: number; amp: number; phase: number; speed: number }

type Ridge = {
  yBase: number
  depth: number // 0 = far/top, 1 = near/bottom
  harmonics: Harmonic[]
  color: string
  opacity: number
  width: number
  drift: number
}

type Grain = {
  x: number
  y: number
  len: number
  speed: number
  opacity: number
  thickness: number
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

export default function WindField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const canvas: HTMLCanvasElement = el
    const c = canvas.getContext('2d')
    if (!c) return
    const ctx: CanvasRenderingContext2D = c

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const RIDGE_COUNT = isMobile ? 11 : 22
    const GRAIN_COUNT = isMobile ? 0 : 190

    let ridges: Ridge[] = []
    let grains: Grain[] = []
    // Set only in the reduced-motion path, so resize can re-paint the single
    // static frame instead of leaving a blank canvas.
    let staticRepaint: (() => void) | null = null

    function buildRidges() {
      ridges = Array.from({ length: RIDGE_COUNT }, (_, i) => {
        const depth = i / (RIDGE_COUNT - 1)
        // Ridges crowd slightly toward the lower half, the way a dune field
        // reads when you're standing in it rather than above it.
        const yBase = 0.06 + Math.pow(depth, 0.85) * 0.92
        const ampScale = 0.45 + depth * 1.15

        // Clay is the single warm accent and must stay ~5% of the layout
        // (CLAUDE.md §3) — so at most one or two ridges ever carry it.
        const isAccent = i % 11 === 5
        const color = isAccent ? CLAY : i % 3 === 0 ? SAND : DUNE

        return {
          yBase,
          depth,
          harmonics: [
            { freq: rand(0.5, 1.0), amp: rand(16, 30) * ampScale, phase: rand(0, Math.PI * 2), speed: rand(0.05, 0.11) },
            { freq: rand(1.7, 2.7), amp: rand(5, 11) * ampScale, phase: rand(0, Math.PI * 2), speed: rand(0.09, 0.17) },
            { freq: rand(3.4, 5.2), amp: rand(1.5, 4) * ampScale, phase: rand(0, Math.PI * 2), speed: rand(0.14, 0.26) },
          ],
          color,
          opacity: (isAccent ? 0.07 : 0.06) + depth * 0.17,
          width: 0.5 + depth * 1.15,
          drift: rand(0.4, 1.0),
        }
      })
    }

    function buildGrains() {
      grains = Array.from({ length: GRAIN_COUNT }, () => ({
        x: rand(0, 1),
        y: rand(0, 1),
        len: rand(6, 26),
        speed: rand(0.014, 0.055),
        opacity: rand(0.05, 0.2),
        thickness: rand(0.4, 0.9),
      }))
    }

    function resize() {
      const nw = window.innerWidth
      const nh = window.innerHeight
      // A tab that mounts while hidden/prerendered reports 0×0. Bail rather
      // than baking a zero-size canvas we'd never recover from — the
      // ResizeObserver below fires again once the tab has real dimensions.
      if (nw === 0 || nh === 0) return
      if (nw === w && nh === h) return

      w = nw
      h = nh
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      staticRepaint?.()
    }

    buildRidges()
    buildGrains()
    resize()

    window.addEventListener('resize', resize)
    // Catches the hidden-tab / restored-tab case that a resize event misses.
    const ro = new ResizeObserver(() => resize())
    ro.observe(document.documentElement)
    document.addEventListener('visibilitychange', resize)

    // ── Gusts ────────────────────────────────────────────────────────────
    // Each gust is a travelling gaussian envelope. `pos` runs past both edges
    // so the swell enters and leaves the frame instead of popping.
    type Gust = { pos: number; speed: number; strength: number; sigma: number }
    let gusts: Gust[] = []
    let nextGustAt = 1.5

    function spawnGust() {
      gusts.push({
        pos: -0.35,
        speed: rand(0.10, 0.22),
        strength: rand(0.5, 1.5),
        sigma: rand(0.10, 0.26),
      })
    }

    // ── Pointer wake ─────────────────────────────────────────────────────
    const pointer = { x: -1, y: -1, active: false }
    function onPointerMove(e: PointerEvent) {
      pointer.x = e.clientX / window.innerWidth
      pointer.y = e.clientY / window.innerHeight
      pointer.active = true
    }
    function onPointerLeave() {
      pointer.active = false
    }
    if (!isMobile && !reduceMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave)
    }

    // ── Scroll coupling ──────────────────────────────────────────────────
    let scrollOffset = 0
    function onScroll() {
      scrollOffset = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    function gustAt(nx: number) {
      let swell = 0
      for (const g of gusts) {
        const d = nx - g.pos
        swell += g.strength * Math.exp(-(d * d) / (2 * g.sigma * g.sigma))
      }
      return swell
    }

    function paintBackdrop() {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, BLEACHED)
      g.addColorStop(0.55, BONE)
      g.addColorStop(1, '#EADFC8')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    const STEP = 7

    function drawRidges(t: number) {
      const parallax = scrollOffset * 0.045

      for (const ridge of ridges) {
        ctx.beginPath()
        // Nearer ridges parallax more than distant ones.
        const yC = ridge.yBase * h - parallax * (0.35 + ridge.depth * 1.1)

        // Cheap cull — skip ridges scrolled well clear of the viewport.
        if (yC < -140 || yC > h + 140) continue

        for (let x = 0; x <= w + STEP; x += STEP) {
          const nx = x / w
          const swell = 1 + gustAt(nx) * (0.35 + ridge.depth * 0.5)

          let y = yC
          for (const harm of ridge.harmonics) {
            y += Math.sin(nx * Math.PI * 2 * harm.freq + t * harm.speed * ridge.drift + harm.phase) * harm.amp * swell
          }

          // Air curls around the pointer — falls off fast so it stays a hint.
          if (pointer.active) {
            const dx = nx - pointer.x
            const dy = yC / h - pointer.y
            const dist2 = dx * dx + dy * dy
            y -= Math.exp(-dist2 / 0.012) * 26 * (0.4 + ridge.depth)
          }

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.strokeStyle = ridge.color
        ctx.globalAlpha = ridge.opacity
        ctx.lineWidth = ridge.width
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    function drawGrains(dt: number) {
      ctx.lineCap = 'round'
      for (const grain of grains) {
        const swell = gustAt(grain.x)
        const vel = grain.speed * (1 + swell * 2.4)
        grain.x += vel * dt

        if (grain.x > 1.05) {
          grain.x = -0.05
          grain.y = Math.random()
        }

        const px = grain.x * w
        const py = grain.y * h - scrollOffset * 0.06
        if (py < -20 || py > h + 20) continue

        const len = grain.len * (1 + swell * 1.6)
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px - len, py + len * 0.06)
        ctx.strokeStyle = SAND
        ctx.globalAlpha = Math.min(0.42, grain.opacity * (1 + swell * 1.5))
        ctx.lineWidth = grain.thickness
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    let raf = 0
    let last = performance.now()
    let t = 0

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // Nothing to paint until the tab has real dimensions.
      if (w === 0 || h === 0) {
        raf = requestAnimationFrame(frame)
        return
      }

      t += dt * 60

      // Gust lifecycle
      nextGustAt -= dt
      if (nextGustAt <= 0) {
        spawnGust()
        nextGustAt = rand(2.6, 7.0)
      }
      for (const g of gusts) g.pos += g.speed * dt
      gusts = gusts.filter((g) => g.pos < 1.4)

      paintBackdrop()
      drawRidges(t)
      drawGrains(dt)

      raf = requestAnimationFrame(frame)
    }

    function paintStatic() {
      if (w === 0 || h === 0) return
      paintBackdrop()
      drawRidges(0)
    }

    if (reduceMotion) {
      paintStatic()
      // Re-paint on resize so the static frame survives a hidden-tab mount
      // and stays correct through rotation / window resizing.
      staticRepaint = paintStatic
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', resize)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
