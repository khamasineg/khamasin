'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Custom cursor — a survey instrument, not a novelty.
 *
 * ⚠ This overrides CLAUDE.md §10, which bans a custom cursor as FYNDE's visual
 * grammar. The founder reversed that call directly; the doc has been updated to
 * match. The ban existed because FYNDE's version set `cursor: none !important`
 * globally, which broke text selection and form fields. This one does not:
 * native cursors are preserved on inputs, textareas and anything with real text
 * selection, and the whole thing is inert on touch devices.
 *
 * Design — reuses the language already established elsewhere on the site:
 *   · a 1px ring, the same hairline weight as the contour motif
 *   · a small Clay dot at true pointer position
 *   · the ring LAGS the dot on a spring, so movement reads as drift — the same
 *     easing idea as the wind field
 *   · over a link or button the ring opens up and turns Clay
 *   · over the product plate it becomes a crosshair, echoing the loupe
 *
 * Opt-in per element via `data-cursor="lens" | "hide"`.
 */

const RING_BASE = 26
const RING_LINK = 44
const RING_LENS = 58

export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<'default' | 'link' | 'lens' | 'hide'>('default')
  const [down, setDown] = useState(false)

  useEffect(() => {
    // Fine pointer with hover only — never on touch, never under reduced motion
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const eased = { ...target }
    let raf = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!visible) {
        visible = true
        eased.x = target.x
        eased.y = target.y
        if (ring.current) ring.current.style.opacity = '1'
        if (dot.current) dot.current.style.opacity = '1'
      }

      const el = e.target as HTMLElement | null
      const flagged = el?.closest?.('[data-cursor]') as HTMLElement | null
      const flag = flagged?.dataset.cursor

      if (flag === 'lens') setMode('lens')
      else if (flag === 'hide') setMode('hide')
      else if (el?.closest?.('a, button, [role="button"], input, textarea, select, label')) {
        // Text fields keep the native caret — the custom ring would only get in the way
        const isField = el.closest('input, textarea, select')
        setMode(isField ? 'hide' : 'link')
      } else setMode('default')
    }

    const onLeave = () => {
      visible = false
      if (ring.current) ring.current.style.opacity = '0'
      if (dot.current) dot.current.style.opacity = '0'
    }

    const onDown = () => setDown(true)
    const onUp = () => setDown(false)

    const loop = () => {
      // Ring trails the pointer; dot stays exact
      eased.x += (target.x - eased.x) * 0.16
      eased.y += (target.y - eased.y) * 0.16
      if (ring.current) ring.current.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0) translate(-50%, -50%)`
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(loop)

    document.documentElement.classList.add('has-custom-cursor')

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  const size = mode === 'lens' ? RING_LENS : mode === 'link' ? RING_LINK : RING_BASE
  const hidden = mode === 'hide'
  const clay = mode === 'link' || mode === 'lens'

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1px solid ${clay ? 'rgba(181,103,58,0.9)' : 'rgba(42,37,33,0.55)'}`,
          background: mode === 'link' ? 'rgba(181,103,58,0.07)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0,
          transition: 'width 380ms cubic-bezier(.16,1,.3,1), height 380ms cubic-bezier(.16,1,.3,1), border-color 300ms, background 300ms, opacity 250ms',
          mixBlendMode: 'normal',
          scale: down ? '0.85' : '1',
          visibility: hidden ? 'hidden' : 'visible',
        }}
      >
        {mode === 'lens' && (
          <>
            <span style={{ position: 'absolute', left: '50%', top: '50%', width: 10, height: 1, background: 'rgba(181,103,58,0.9)', transform: 'translate(-50%,-50%)' }} />
            <span style={{ position: 'absolute', left: '50%', top: '50%', width: 1, height: 10, background: 'rgba(181,103,58,0.9)', transform: 'translate(-50%,-50%)' }} />
          </>
        )}
      </div>

      <div
        ref={dot}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: '#B5673A',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0,
          transition: 'opacity 250ms',
          visibility: hidden || mode === 'lens' ? 'hidden' : 'visible',
        }}
      />
    </>
  )
}
