'use client'

import { useEffect, useState } from 'react'
import { ProductCategory } from '@/types'
import { SIZE_CHARTS, MEASURE_LABELS, toInches } from '@/lib/sizeChart'
import Overlay from '@/components/ui/Overlay'

/**
 * Size chart panel — measurement table plus the explanation that makes the
 * table usable.
 *
 * Two things most size guides get wrong and this one doesn't:
 *  1. It says plainly that these are GARMENT measurements, not body
 *     measurements. A 108cm hip on a wide-leg trouser is not a 108cm body,
 *     and not saying so is how people order the wrong size.
 *  2. Every column has a "how this was measured" line, so the numbers can
 *     actually be compared against a trouser the customer already owns —
 *     which is what people really do.
 *
 * Highlights the size currently selected on the product page, so the chart
 * answers "is the one I picked right?" rather than just listing everything.
 */
export default function SizeChart({
  category,
  selectedSize,
  open,
  onClose,
}: {
  category: ProductCategory
  selectedSize: string | null
  open: boolean
  onClose: () => void
}) {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm')
  const chart = SIZE_CHARTS[category]

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !chart) return null

  const fmt = (v: number) => (unit === 'cm' ? v : toInches(v))

  return (
    <Overlay z={310} label="Size chart">
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{ background: 'rgba(42,37,33,0.42)', backdropFilter: 'blur(3px)', animation: 'veil-in 400ms ease forwards' }}
      />

      <aside
        className="absolute left-1/2 top-1/2 flex flex-col"
        style={{
          background: '#F1EAD9',
          width: 'min(680px, calc(100vw - 2.5rem))',
          maxHeight: 'min(84dvh, 760px)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 30px 90px rgba(42,37,33,0.28)',
          animation: 'modal-in 520ms cubic-bezier(.16,1,.3,1) forwards',
        }}
      >
        {/* Clay hairline across the top edge */}
        <div className="absolute top-0 left-0 right-0" style={{ height: 1, background: '#B5673A' }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 md:px-8 pt-7 pb-5">
          <div>
            <h2 className="font-display text-ink" style={{ fontWeight: 300, fontSize: '1.5rem', lineHeight: 1 }}>
              Size &amp; Fit
            </h2>
            <p className="font-mono mt-2 uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.24em', color: '#9C8563' }}>
              {category.replace('-', ' ')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* cm / in toggle */}
            <div className="flex" style={{ border: '1px solid rgba(156,133,99,0.45)' }}>
              {(['cm', 'in'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  aria-pressed={unit === u}
                  className="font-mono uppercase transition-colors"
                  style={{
                    fontSize: '0.55rem',
                    letterSpacing: '0.18em',
                    padding: '0.45rem 0.7rem',
                    background: unit === u ? '#2A2521' : 'transparent',
                    color: unit === u ? '#FAF6EF' : '#9C8563',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              aria-label="Close size chart"
              className="font-mono uppercase transition-colors hover:text-sienna"
              style={{ fontSize: '0.55rem', letterSpacing: '0.24em', color: '#2A2521', minHeight: 44 }}
            >
              Close
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(156,133,99,0.45)', marginInline: '1.5rem' }} />

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-7">
          {/* Fit note */}
          <p className="font-display italic text-ink leading-relaxed" style={{ fontSize: '1.02rem', maxWidth: '46ch' }}>
            {chart.fitNote}
          </p>

          {/* Table */}
          <div className="mt-8 -mx-2 overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 420 }}>
              <caption className="sr-only">
                Garment measurements in {unit === 'cm' ? 'centimetres' : 'inches'}
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="font-mono uppercase text-left"
                    style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: '#9C8563', padding: '0 0.5rem 0.75rem' }}
                  >
                    Size
                  </th>
                  {MEASURE_LABELS.map((m) => (
                    <th
                      key={m.key}
                      scope="col"
                      className="font-mono uppercase text-right"
                      style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: '#9C8563', padding: '0 0.5rem 0.75rem' }}
                    >
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => {
                  const active = selectedSize === row.size
                  return (
                    <tr
                      key={row.size}
                      style={{
                        borderTop: '1px solid rgba(156,133,99,0.3)',
                        background: active ? 'rgba(181,103,58,0.09)' : undefined,
                      }}
                    >
                      <th
                        scope="row"
                        className="font-mono uppercase text-left"
                        style={{
                          fontSize: '0.68rem',
                          letterSpacing: '0.14em',
                          padding: '0.85rem 0.5rem',
                          color: active ? '#B5673A' : '#2A2521',
                          fontWeight: 400,
                        }}
                      >
                        {row.size}
                        {active && <span className="ml-2" style={{ fontSize: '0.5rem', letterSpacing: '0.18em' }}>SELECTED</span>}
                      </th>
                      {MEASURE_LABELS.map((m) => (
                        <td
                          key={m.key}
                          className="font-mono text-right"
                          style={{ fontSize: '0.72rem', padding: '0.85rem 0.5rem', color: active ? '#2A2521' : '#5c5147' }}
                        >
                          {fmt(row[m.key])}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="font-mono mt-4 uppercase" style={{ fontSize: '0.52rem', letterSpacing: '0.18em', color: '#9C8563' }}>
            All measurements are of the garment, laid flat — not body measurements.
          </p>

          {/* How to measure */}
          <div className="mt-11">
            <h3 className="font-mono uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.26em', color: '#9C8563' }}>
              How we measure
            </h3>
            <p className="mt-4 leading-relaxed" style={{ fontSize: '0.88rem', color: '#5c5147', maxWidth: '52ch' }}>
              The most reliable way to size a trouser is to measure one you already wear and
              compare it to the table above. Lay it flat, don&rsquo;t stretch the waistband, and
              match the numbers rather than the letter on the label.
            </p>

            <dl className="mt-6">
              {MEASURE_LABELS.map((m) => (
                <div key={m.key} className="py-3.5" style={{ borderTop: '1px solid rgba(156,133,99,0.28)' }}>
                  <dt className="font-mono uppercase" style={{ fontSize: '0.56rem', letterSpacing: '0.2em', color: '#2A2521' }}>
                    {m.label}
                  </dt>
                  <dd className="mt-1.5 leading-relaxed" style={{ fontSize: '0.85rem', color: '#9C8563', maxWidth: '48ch' }}>
                    {m.how}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-10 leading-relaxed" style={{ fontSize: '0.85rem', color: '#9C8563', maxWidth: '48ch' }}>
            Between two sizes? On the Erg and the Khamsin, size down — both are cut with volume
            already built in. On everything else, size up.
          </p>
        </div>
      </aside>
    </Overlay>
  )
}
