'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * PAGE-TO-PAGE — "Strata Wipe".
 *
 * A different mechanic from the first-visit Horizon Split, so the two never
 * read as the same animation replayed.
 *
 * The viewport is banded into horizontal strata — dune layers. They sweep in
 * from alternating edges on a stagger, close over the outgoing page, then keep
 * travelling the SAME direction and exit the opposite side, so the wipe reads
 * as something crossing the screen rather than a curtain dropping and lifting.
 * No text, no logo, no spinner.
 *
 * Timing note: this intercepts the link click and starts covering immediately,
 * rather than waiting on `pathname`. App Router only updates pathname once the
 * next route has been fetched — driving the animation off that leaves a dead
 * ~350ms after the click where nothing moves, which reads as an unresponsive
 * site. Here the strata move on the same frame as the click, and the actual
 * navigation is fired once the screen is already covered.
 */

const BANDS = 9
const BAND_MS = 460
const STAGGER_MS = 32
const PHASE_MS = BAND_MS + STAGGER_MS * BANDS // ~750ms

type Stage = 'idle' | 'covering' | 'revealing'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname.startsWith('/admin')

  const [enabled, setEnabled] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [stage, setStage] = useState<Stage>('idle')

  const enabledRef = useRef(false)
  const pending = useRef<string | null>(null)
  const stageRef = useRef<Stage>('idle')

  useEffect(() => { stageRef.current = stage }, [stage])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const on = window.innerWidth >= 768 && !reduce && !isAdmin
    setEnabled(on)
    enabledRef.current = on
  }, [isAdmin])

  // Keep the rendered children current whenever we're not mid-wipe.
  useEffect(() => {
    if (stage === 'idle') setDisplayChildren(children)
  }, [children, stage])

  // ── Intercept internal navigations so covering starts on the click ──────
  const onDocClick = useCallback(
    (e: MouseEvent) => {
      if (!enabledRef.current) return
      if (stageRef.current !== 'idle') return
      // Respect modified clicks / new-tab intent. NOTE: no defaultPrevented
      // check — we run in the capture phase specifically to get ahead of
      // next/link's own handler, so it is always false here by definition.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as HTMLElement)?.closest?.('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) return // internal only
      if (href.startsWith('/admin')) return
      if (href === pathname) return

      // Capture phase: stop next/link from handling this at all — we fire the
      // navigation ourselves once the strata have closed.
      e.preventDefault()
      e.stopPropagation()
      pending.current = href
      setStage('covering')
    },
    [pathname]
  )

  useEffect(() => {
    if (!enabled) return
    document.addEventListener('click', onDocClick, true)
    return () => document.removeEventListener('click', onDocClick, true)
  }, [enabled, onDocClick])

  // ── Stage machine ───────────────────────────────────────────────────────
  useEffect(() => {
    if (stage === 'covering') {
      const t = setTimeout(() => {
        const href = pending.current
        pending.current = null
        if (href) {
          router.push(href)
          // Reveal is triggered by the pathname effect below once the new
          // route commits, so we never uncover a half-rendered page.
        } else {
          setStage('revealing')
        }
      }, PHASE_MS)
      return () => clearTimeout(t)
    }

    if (stage === 'revealing') {
      const t = setTimeout(() => setStage('idle'), PHASE_MS)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // Route committed while covered → swap content and uncover.
  useEffect(() => {
    if (stageRef.current !== 'covering') return
    setDisplayChildren(children)
    window.scrollTo(0, 0)
    setStage('revealing')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Safety: never let the overlay stick if something stalls mid-navigation.
  useEffect(() => {
    if (stage === 'idle') return
    const bail = setTimeout(() => setStage('idle'), PHASE_MS * 4)
    return () => clearTimeout(bail)
  }, [stage])

  if (!enabled) return <>{children}</>

  return (
    <>
      <div>{displayChildren}</div>

      <div
        aria-hidden="true"
        className="fixed inset-0 z-[200]"
        style={{ pointerEvents: 'none', visibility: stage === 'idle' ? 'hidden' : 'visible' }}
      >
        {Array.from({ length: BANDS }).map((_, i) => {
          const fromLeft = i % 2 === 0
          const entry = fromLeft ? '-101%' : '101%'
          const exit = fromLeft ? '101%' : '-101%'
          const x = stage === 'covering' ? '0%' : stage === 'revealing' ? exit : entry

          // Reveal runs bottom-up so the two phases don't mirror each other.
          const order = stage === 'revealing' ? BANDS - 1 - i : i

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${(i * 100) / BANDS}%`,
                height: `calc(${100 / BANDS}% + 1px)`,
                background: '#F1EAD9',
                boxShadow: 'inset 0 -1px 0 rgba(198,174,130,0.55)',
                transform: `translate3d(${x}, 0, 0)`,
                transition:
                  stage === 'idle'
                    ? 'none'
                    : `transform ${BAND_MS}ms cubic-bezier(.76,0,.24,1) ${order * STAGGER_MS}ms`,
                willChange: 'transform',
              }}
            />
          )
        })}
      </div>
    </>
  )
}
