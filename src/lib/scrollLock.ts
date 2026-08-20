/**
 * Shared scroll lock for every overlay on the site.
 *
 * Two things a naive `document.body.style.overflow = 'hidden'` gets wrong here:
 *
 *  1. LENIS. Smooth scroll runs its own virtual scroll loop and keeps moving
 *     the page even when body overflow is hidden — which is why content still
 *     travelled behind the expanded image. The instance has to be stopped, not
 *     just the native scroller.
 *
 *  2. NESTING. Two overlays can be open at once (bag drawer → size chart).
 *     Whichever closed first would previously release the lock and let the page
 *     scroll behind the one still open. Locks are reference-counted so the page
 *     only frees when the last overlay closes.
 */

type LenisLike = { stop: () => void; start: () => void }

let lenis: LenisLike | null = null
let locks = 0
let savedOverflow = ''

export function registerLenis(instance: LenisLike | null) {
  lenis = instance
}

export function lockScroll() {
  locks += 1
  if (locks > 1) return
  savedOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  lenis?.stop()
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks > 0) return
  document.body.style.overflow = savedOverflow
  lenis?.start()
}
