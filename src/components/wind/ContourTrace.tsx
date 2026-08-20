'use client'

// The contour-line motif as a reusable primitive (CLAUDE.md §3): a hand-tuned
// wavy path that draws itself in via the stroke-dasharray/-dashoffset trick.
// `dashLength` just needs to comfortably exceed the path's real length — no
// getTotalLength() measurement needed, so this works identically on the
// server-rendered first paint.
export default function ContourTrace({
  d,
  viewBox = '0 0 600 40',
  color = '#C6AE82',
  strokeWidth = 1.25,
  dashLength = 1000,
  duration = 0.9,
  delay = 0,
  className = '',
  trigger = 'mount',
}: {
  d: string
  viewBox?: string
  color?: string
  strokeWidth?: number
  dashLength?: number
  duration?: number
  delay?: number
  className?: string
  trigger?: 'mount' | 'group-hover' | 'group-active'
}) {
  const hoverClass =
    trigger === 'group-hover'
      ? `[stroke-dashoffset:${dashLength}] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-out`
      : trigger === 'group-active'
      ? `[stroke-dashoffset:${dashLength}] group-active:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-500 ease-out`
      : ''

  return (
    <svg viewBox={viewBox} preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={hoverClass}
        style={
          trigger === 'mount'
            ? {
                strokeDasharray: dashLength,
                strokeDashoffset: dashLength,
                animation: `contour-trace ${duration}s cubic-bezier(0.65,0,0.35,1) ${delay}s forwards`,
              }
            : { strokeDasharray: dashLength }
        }
      />
    </svg>
  )
}
