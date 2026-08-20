'use client'

// A drifting contour line used as a section divider — reads as a horizon line
// carried by wind rather than a hard rule. Tile is built so the SVG can be
// duplicated edge-to-edge and looped via CSS translateX(-50%) (see
// contour-drift keyframe in globals.css).
export default function WindDivider({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const color = tone === 'dark' ? 'rgba(198,174,130,0.35)' : 'rgba(156,133,99,0.4)'
  return (
    <div className="relative h-px w-full overflow-hidden">
      <svg
        viewBox="0 0 1600 12"
        preserveAspectRatio="none"
        className="w-[200%] h-3 block motion-safe:animate-[contour-drift_150s_linear_infinite]"
      >
        <path
          d="M0 6 C 60 1, 120 11, 180 5 S 300 -1, 360 6 S 480 12, 540 4 S 660 -2, 720 6 L 800 5 C 860 0, 920 10, 980 5 S 1100 -1, 1160 6 S 1280 12, 1340 4 S 1460 -2, 1520 6 L 1600 5"
          fill="none"
          stroke={color}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
