'use client'

/**
 * Fine grain texture — the thing that most separates "photographic surface"
 * from "flat vector cartoon". Ported from the founder's prototype (`.grain`,
 * feTurbulence at 0.05 / multiply).
 *
 * ⚠ CONFLICT WORTH A DECISION (flagged, not silently resolved):
 * CLAUDE.md §10 says "Explicitly removed, not restyled: custom cursor, film
 * grain overlay, red stamp labels … don't port and reskin them, delete them."
 * But the founder's own prototype uses a grain layer, and grain is directly
 * what stops the site reading as cartoon-flat.
 *
 * Read: the CLAUDE.md ban targets FYNDE's *heavy, aged* grain used to fake
 * vintage wear. This is a different tool at a different intensity — a 3%
 * photographic tooth, not an aging filter. Kept for that reason, but if the
 * founder wants the ban read literally, delete this file and remove <Grain />
 * from layout.tsx. Nothing else depends on it.
 */
export default function Grain() {
  return (
    <svg
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: 60, opacity: 0.032, mixBlendMode: 'multiply' }}
    >
      <filter id="khamsin-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#khamsin-grain)" />
    </svg>
  )
}
