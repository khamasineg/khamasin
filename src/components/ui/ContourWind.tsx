'use client'

import { useIsMobile } from '@/hooks/useIsMobile'

// KHAMSIN's signature motif (CLAUDE.md §3 + §10): desert topographic maps render
// dunes as thin, rhythmic contour lines — this is that, drifting slowly like wind
// moving across a dune field. It's the one place this site spends its boldness;
// everything else stays quiet, so these lines stay faint and ambient, never a
// focal graphic in their own right.
//
// NOTE: CLAUDE.md Open Assumption #6 says a working prototype of this motif
// already exists and should be ported rather than redesigned from the doc alone.
// That file wasn't available in this session, so this is a from-scratch build off
// the written description — treat it as a first pass to compare against the real
// prototype when it surfaces, not a locked implementation.

const WAVELENGTH = 420
const CYCLES_PER_TILE = 3
const TILE_WIDTH = WAVELENGTH * CYCLES_PER_TILE // one exact repeat unit, for a seamless loop
const SAMPLE_STEP = 14
const VIEW_HEIGHT = 48
const BASE_Y = VIEW_HEIGHT / 2

type ContourLine = {
  top: string // vertical position on the page
  amplitude: number
  amplitude2: number
  freq2: number
  phase: number
  color: string
  opacity: number
  strokeWidth: number
  duration: number // seconds per full drift cycle — varied per line for parallax
  reverse?: boolean
}

// Two harmonics layered together read as an irregular dune ridge instead of a
// mechanical sine wave. Sampled as a polyline (not bezier) — thin enough stroke
// that straight segments at this sample density are indistinguishable from a curve.
function buildPath(line: ContourLine): string {
  const points: string[] = []
  for (let x = 0; x <= TILE_WIDTH * 2; x += SAMPLE_STEP) {
    const y =
      BASE_Y +
      line.amplitude * Math.sin((x / WAVELENGTH) * Math.PI * 2 + line.phase) +
      line.amplitude2 * Math.sin((x / WAVELENGTH) * Math.PI * 2 * line.freq2 + line.phase * 1.7)
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return `M ${points.join(' L ')}`
}

// Sand and Dune Shadow only — Clay is the brief's "never more than ~5%" accent
// and has no place in an ambient background layer.
const LINES: ContourLine[] = [
  { top: '10%', amplitude: 12, amplitude2: 3, freq2: 2.3, phase: 0.4, color: '#C6AE82', opacity: 0.20, strokeWidth: 1,    duration: 70 },
  { top: '24%', amplitude: 17, amplitude2: 5, freq2: 1.7, phase: 1.9, color: '#C6AE82', opacity: 0.14, strokeWidth: 1,    duration: 86, reverse: true },
  { top: '41%', amplitude: 9,  amplitude2: 4, freq2: 2.8, phase: 3.1, color: '#9C8563', opacity: 0.13, strokeWidth: 0.75, duration: 98 },
  { top: '58%', amplitude: 20, amplitude2: 6, freq2: 1.4, phase: 0.8, color: '#9C8563', opacity: 0.09, strokeWidth: 0.75, duration: 122, reverse: true },
  { top: '76%', amplitude: 11, amplitude2: 3, freq2: 2.1, phase: 2.4, color: '#C6AE82', opacity: 0.15, strokeWidth: 1,    duration: 104 },
  { top: '91%', amplitude: 15, amplitude2: 4, freq2: 1.9, phase: 1.1, color: '#9C8563', opacity: 0.10, strokeWidth: 0.75, duration: 90,  reverse: true },
]

// Mobile: "complex animation disabled by default" (CLAUDE.md §7). A couple of
// static lines keep the motif present without the drift or the extra paint cost.
const MOBILE_LINES = LINES.slice(0, 2)

export default function ContourWind() {
  const isMobile = useIsMobile()
  const lines = isMobile ? MOBILE_LINES : LINES

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: line.top,
            left: 0,
            right: 0,
            height: VIEW_HEIGHT,
            // A slow, staggered "gust" breathing under the drift — reads as wind
            // gusting rather than a fixed-intensity texture. Disabled on mobile
            // along with the drift itself (complex animation off by default).
            animation: isMobile
              ? 'none'
              : `contour-breathe ${line.duration * 0.55}s ease-in-out infinite`,
            animationDelay: isMobile ? undefined : `${i * -3.7}s`,
            ['--gust-min' as string]: 0.55,
          }}
        >
          <svg
            viewBox={`0 0 ${TILE_WIDTH * 2} ${VIEW_HEIGHT}`}
            preserveAspectRatio="none"
            style={{
              width: '200%',
              height: VIEW_HEIGHT,
              display: 'block',
              animation: isMobile
                ? 'none'
                : `contour-drift ${line.duration}s linear infinite ${line.reverse ? 'reverse' : ''}`,
            }}
          >
            <path
              d={buildPath(line)}
              fill="none"
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              opacity={line.opacity}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}
