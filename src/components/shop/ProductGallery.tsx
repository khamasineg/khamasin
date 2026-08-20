'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import FabricSwatch, { SwatchTone } from './FabricSwatch'
import Overlay from '@/components/ui/Overlay'

/**
 * The product gallery — the surface the garment is actually judged on.
 *
 * Three things carry it:
 *
 *  1. LOUPE. On desktop, hovering the plate raises a circular magnifier that
 *     tracks the cursor at ×2.6 against the full-resolution file. Whole-image
 *     zoom shows you a bigger picture; a loupe shows you the WEAVE — which is
 *     the entire argument for a fabric-led brand. The lens is a real optical
 *     object: Bone rim, soft shadow, Clay crosshair at centre.
 *
 *  2. FULLSCREEN. Clicking opens an immersive Basalt viewer — drag to pan,
 *     arrow keys or the rail to change frame, Escape to leave. This is where
 *     the photograph gets the whole screen with nothing else competing.
 *
 *  3. DRIFT. Left alone, the plate breathes: a 20s Ken Burns push that stops
 *     the instant you engage the loupe. Static product shots read as dead;
 *     this one is always very slightly moving, like everything else here.
 *
 * The loupe pulls from Next's optimiser at w=1920 rather than the raw file —
 * the source photography runs to 3400×6048 / 3.8 MB and fetching that on
 * hover would stall the interaction it's meant to serve.
 */

const LENS = 200
const ZOOM = 2.6

const hiRes = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=85`

export default function ProductGallery({
  images,
  alt,
  tone,
  soldOut = false,
}: {
  images: string[]
  alt: string
  tone: SwatchTone
  soldOut?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [lens, setLens] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [full, setFull] = useState(false)
  const plate = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const touchX = useRef(0)

  const has = images && images.length > 0
  const count = has ? images.length : 0
  const src = has ? images[Math.min(index, count - 1)] : undefined

  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(count, 1)), [count])
  const prev = useCallback(() => setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1)), [count])

  // Mount reveal — the plate wipes up out of its own frame
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from('.pg-plate', { clipPath: 'inset(100% 0 0 0)', duration: 1.35, ease: 'expo.out' })
      gsap.from('.pg-thumb', { opacity: 0, x: -14, duration: 0.8, stagger: 0.08, delay: 0.45, ease: 'power3.out' })
    },
    { scope: root }
  )

  // Fullscreen keyboard control
  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFull(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full, next, prev])

  const onMove = (e: React.MouseEvent) => {
    const el = plate.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (count < 2) return
    const d = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(d) > 44) { if (d > 0) next(); else prev() }
  }

  const plateBox = plate.current?.getBoundingClientRect()

  return (
    <div ref={root} className="flex gap-3">
      {/* ── Vertical thumbnail rail ─────────────────────────────────── */}
      {count > 1 && (
        <div className="hidden md:flex flex-col gap-2 flex-shrink-0" style={{ width: 58 }}>
          {images.map((im, i) => (
            <button
              key={im + i}
              onClick={() => setIndex(i)}
              aria-label={`Frame ${i + 1}`}
              aria-pressed={i === index}
              className="pg-thumb relative overflow-hidden transition-opacity duration-300"
              style={{ aspectRatio: '3 / 4', opacity: i === index ? 1 : 0.45 }}
            >
              <Image src={im} alt="" fill sizes="58px" className="object-cover" />
              <span
                className="absolute left-0 top-0 bottom-0 origin-top transition-transform duration-500"
                style={{ width: 2, background: '#B5673A', transform: i === index ? 'scaleY(1)' : 'scaleY(0)' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Main plate ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div
          ref={plate}
          className="pg-plate relative overflow-hidden bg-taupe-light"
          data-cursor="lens"
          style={{ aspectRatio: '3 / 4', cursor: has ? 'zoom-in' : 'default' }}
          onMouseEnter={() => has && setLens(true)}
          onMouseLeave={() => setLens(false)}
          onMouseMove={onMove}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => has && setFull(true)}
        >
          {has ? (
            images.map((im, i) => (
              <div
                key={im + i}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === index ? 1 : 0 }}
              >
                <Image
                  src={im}
                  alt={`${alt} — frame ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                  style={{
                    filter: soldOut ? 'saturate(0.4)' : undefined,
                    // Idle drift, killed the moment the loupe engages
                    animation: lens ? 'none' : 'plate-drift 22s ease-in-out infinite alternate',
                  }}
                />
              </div>
            ))
          ) : (
            <FabricSwatch tone={tone} />
          )}

          {/* Contrast scrim for the readout only — top 22%, fades to nothing */}
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{ height: '22%', background: 'linear-gradient(180deg, rgba(42,37,33,0.34), rgba(42,37,33,0))' }}
          />

          {/* Survey readout */}
          <div
            className="absolute top-4 left-4 font-mono pointer-events-none select-none z-20 uppercase"
            style={{ fontSize: '0.52rem', letterSpacing: '0.24em', color: '#FAF6EF' }}
          >
            {lens ? `Weave ×${ZOOM}` : has ? `Frame ${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}` : 'No image'}
          </div>

          {has && (
            <div
              className="absolute top-4 right-4 font-mono pointer-events-none select-none z-20 uppercase transition-opacity duration-300"
              style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: '#FAF6EF', opacity: lens ? 0 : 0.9 }}
            >
              Click to expand
            </div>
          )}

          {/* THE LOUPE */}
          {lens && src && plateBox && (
            <div
              aria-hidden="true"
              className="hidden md:block absolute pointer-events-none z-30"
              style={{
                width: LENS,
                height: LENS,
                left: pos.x - LENS / 2,
                top: pos.y - LENS / 2,
                borderRadius: '50%',
                border: '1px solid rgba(250,246,239,0.9)',
                boxShadow: '0 10px 40px rgba(42,37,33,0.35), inset 0 0 0 1px rgba(42,37,33,0.12)',
                backgroundImage: `url(${hiRes(src)})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${plateBox.width * ZOOM}px ${plateBox.height * ZOOM}px`,
                backgroundPosition: `${-(pos.x * ZOOM - LENS / 2)}px ${-(pos.y * ZOOM - LENS / 2)}px`,
              }}
            >
              {/* Clay crosshair — reads as an instrument, not a CSS circle */}
              <span style={{ position: 'absolute', left: '50%', top: '50%', width: 9, height: 1, background: 'rgba(181,103,58,0.8)', transform: 'translate(-50%,-50%)' }} />
              <span style={{ position: 'absolute', left: '50%', top: '50%', width: 1, height: 9, background: 'rgba(181,103,58,0.8)', transform: 'translate(-50%,-50%)' }} />
            </div>
          )}

          {/* Contour hairline, retreats while the loupe is up */}
          <svg
            viewBox="0 0 300 400"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-500"
            style={{ opacity: lens ? 0 : 0.55 }}
            aria-hidden="true"
          >
            <path d="M-10 322 C 46 288, 98 348, 154 314 S 260 272, 314 312" fill="none" stroke="#FAF6EF" strokeWidth="1" strokeLinecap="round" opacity="0.65" />
          </svg>

          {soldOut && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(42,37,33,0.45)' }}>
              <span
                className="font-mono uppercase"
                style={{ fontSize: '0.58rem', letterSpacing: '0.32em', color: '#FAF6EF', borderTop: '1px solid rgba(250,246,239,0.5)', borderBottom: '1px solid rgba(250,246,239,0.5)', padding: '0.5rem 0' }}
              >
                Sold Out
              </span>
            </div>
          )}

          {/* Mobile frame dots */}
          {count > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === index ? 18 : 6,
                    height: 3,
                    background: i === index ? '#B5673A' : 'rgba(250,246,239,0.8)',
                    transition: 'width .3s cubic-bezier(.16,1,.3,1), background .3s',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Fullscreen viewer ───────────────────────────────────────── */}
      {full && src && (
        <FullScreen
          images={images}
          index={index}
          alt={alt}
          onIndex={setIndex}
          onClose={() => setFull(false)}
          onNext={next}
          onPrev={prev}
        />
      )}
    </div>
  )
}

/**
 * Expanded view — a light plate room, not a dark lightbox.
 *
 * The previous version was a Basalt slab with a thumbnail strip bolted to the
 * bottom, which fought the site's light palette and read as a different
 * application. This one stays in the brand's material: a Bleached Bone field,
 * the photograph floated with real margin, and chrome reduced to three mono
 * readouts and a hairline frame rail. Nothing is boxed, bordered or buttoned.
 *
 * Interaction: click the field to dismiss, click the plate to toggle ×2 with
 * drag-to-pan, arrows or ←/→ to change frame, Escape to leave.
 */
function FullScreen({
  images,
  index,
  alt,
  onIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: string[]
  index: number
  alt: string
  onIndex: (i: number) => void
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const [zoomed, setZoomed] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const reset = () => { setZoomed(false); setPan({ x: 0, y: 0 }) }

  return (
    <Overlay z={300} label={`${alt} — expanded view`}>
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #FAF6EF 0%, #F1EAD9 60%, #EADFC8 100%)',
        animation: 'veil-in 320ms ease forwards',
      }}
      onClick={onClose}
    >
      {/* Top rail */}
      <div
        className="flex items-center justify-between px-6 md:px-10 py-6 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.26em', color: '#9C8563' }}>
          {alt}
        </span>
        <span className="font-mono uppercase hidden md:block" style={{ fontSize: '0.52rem', letterSpacing: '0.24em', color: '#B5673A' }}>
          {zoomed ? 'Drag to pan — click to fit' : 'Click image to magnify'}
        </span>
        <button
          onClick={onClose}
          aria-label="Close expanded view"
          className="font-mono uppercase transition-colors hover:text-sienna"
          style={{ fontSize: '0.55rem', letterSpacing: '0.24em', color: '#2A2521', minHeight: 44 }}
        >
          Close
        </button>
      </div>

      {/* Stage — the photograph floats, with margin on every side */}
      <div className="flex-1 relative flex items-center justify-center px-6 md:px-16 pb-4 min-h-0">
        <div
          className="relative h-full"
          style={{
            aspectRatio: '3 / 4',
            maxHeight: '100%',
            cursor: zoomed ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
            overflow: 'hidden',
            boxShadow: '0 30px 90px rgba(42,37,33,0.22)',
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (zoomed) reset()
            else setZoomed(true)
          }}
          onMouseDown={(e) => {
            if (!zoomed) return
            drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
            setDragging(true)
          }}
          onMouseMove={(e) => {
            if (zoomed && drag.current) setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })
          }}
          onMouseUp={() => { drag.current = null; setDragging(false) }}
          onMouseLeave={() => { drag.current = null; setDragging(false) }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: zoomed ? `translate(${pan.x}px, ${pan.y}px) scale(2)` : 'none',
              transition: dragging ? 'none' : 'transform 620ms cubic-bezier(.16,1,.3,1)',
            }}
          >
            <Image src={images[index]} alt={alt} fill sizes="100vw" className="object-cover" priority />
          </div>
        </div>

        {/* Frame arrows — hairline glyphs, not buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); onPrev() }}
              aria-label="Previous frame"
              className="absolute left-2 md:left-5 top-1/2 -translate-y-1/2 font-mono transition-colors hover:text-ink"
              style={{ color: '#9C8563', fontSize: '1rem', width: 44, height: 44 }}
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); onNext() }}
              aria-label="Next frame"
              className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 font-mono transition-colors hover:text-ink"
              style={{ color: '#9C8563', fontSize: '1rem', width: 44, height: 44 }}
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Bottom rail — frame ticks, not thumbnails */}
      <div
        className="flex items-center justify-center gap-4 px-6 py-7 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 &&
          images.map((_, i) => (
            <button
              key={i}
              onClick={() => { reset(); onIndex(i) }}
              aria-label={`Frame ${i + 1}`}
              aria-pressed={i === index}
              className="relative"
              style={{ width: 46, height: 22 }}
            >
              <span
                className="absolute left-0 right-0 top-1/2 transition-all duration-500"
                style={{
                  height: 1,
                  background: i === index ? '#B5673A' : 'rgba(156,133,99,0.45)',
                  transform: i === index ? 'scaleY(2)' : 'scaleY(1)',
                }}
              />
            </button>
          ))}
        <span className="font-mono uppercase ml-3" style={{ fontSize: '0.52rem', letterSpacing: '0.24em', color: '#9C8563' }}>
          {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </span>
      </div>
    </div>
    </Overlay>
  )
}
