import { ProductCategory } from '@/types'

/**
 * Garment measurements, in centimetres, taken flat and doubled where relevant.
 *
 * These are GARMENT measurements, not body measurements — the distinction
 * matters and is stated to the customer, because a wide-leg trouser measuring
 * 108cm at the hip is not for a 108cm body. Every cut carries its own intended
 * ease, so the chart is per-category rather than one table for the whole range.
 *
 * ⚠ TEMPORARY — DECIDED, NOT YET BUILT.
 * The founder has confirmed size charts belong PER PRODUCT, entered through
 * the admin panel — not hardcoded per category as they are here. This file is
 * a stand-in until that exists. Migrating means:
 *   1. a `size_charts` table (product_id FK, or a jsonb column on `products`),
 *   2. admin UI to enter rows per product,
 *   3. `SizeChart.tsx` reading `product.size_chart` with THIS as the fallback
 *      for products that don't have one yet.
 * The `SizeChart` type below is deliberately shaped to drop straight into that
 * column, so the swap is a data-source change and not a rewrite.
 * Note: the admin panel was removed in the rebuild and needs rebuilding first.
 */

export type SizeRow = {
  size: string
  waist: number
  hip: number
  rise: number
  inseam: number
  legOpening: number
}

export type SizeChart = {
  /** How this cut is meant to sit — the thing a table alone can't tell you. */
  fitNote: string
  rows: SizeRow[]
}

export const MEASURE_LABELS: { key: keyof Omit<SizeRow, 'size'>; label: string; how: string }[] = [
  { key: 'waist', label: 'Waist', how: 'Measured flat across the top of the waistband, then doubled.' },
  { key: 'hip', label: 'Hip', how: 'Measured flat at the widest point below the rise, then doubled.' },
  { key: 'rise', label: 'Rise', how: 'From the top of the waistband to the base of the crotch seam, front.' },
  { key: 'inseam', label: 'Inseam', how: 'From the crotch seam to the hem, along the inside leg.' },
  { key: 'legOpening', label: 'Leg opening', how: 'Measured flat across the hem, then doubled.' },
]

export const SIZE_CHARTS: Record<ProductCategory, SizeChart> = {
  trouser: {
    fitNote: 'Sits at the natural waist and falls straight. True to size — take your usual waist.',
    rows: [
      { size: 'XS', waist: 70, hip: 96, rise: 28, inseam: 76, legOpening: 19 },
      { size: 'S', waist: 74, hip: 100, rise: 28.5, inseam: 77, legOpening: 19.5 },
      { size: 'M', waist: 78, hip: 104, rise: 29, inseam: 78, legOpening: 20 },
      { size: 'L', waist: 82, hip: 108, rise: 29.5, inseam: 79, legOpening: 20.5 },
      { size: 'XL', waist: 86, hip: 112, rise: 30, inseam: 80, legOpening: 21 },
    ],
  },
  'wide-leg': {
    fitNote: 'High-set waist with deliberate volume through the thigh, collapsing at the ankle. Size down if you want the volume closer to the body.',
    rows: [
      { size: 'XS', waist: 70, hip: 100, rise: 30, inseam: 77, legOpening: 26 },
      { size: 'S', waist: 74, hip: 104, rise: 30.5, inseam: 78, legOpening: 26.5 },
      { size: 'M', waist: 78, hip: 108, rise: 31, inseam: 79, legOpening: 27 },
      { size: 'L', waist: 82, hip: 112, rise: 31.5, inseam: 80, legOpening: 27.5 },
      { size: 'XL', waist: 86, hip: 116, rise: 32, inseam: 81, legOpening: 28 },
    ],
  },
  short: {
    fitNote: 'Structured and high-rise. Holds its shape rather than draping — take your usual waist, no ease needed.',
    rows: [
      { size: 'XS', waist: 70, hip: 98, rise: 30, inseam: 15, legOpening: 24 },
      { size: 'S', waist: 74, hip: 102, rise: 30.5, inseam: 15.5, legOpening: 24.5 },
      { size: 'M', waist: 78, hip: 106, rise: 31, inseam: 16, legOpening: 25 },
      { size: 'L', waist: 82, hip: 110, rise: 31.5, inseam: 16.5, legOpening: 25.5 },
      { size: 'XL', waist: 86, hip: 114, rise: 32, inseam: 17, legOpening: 26 },
    ],
  },
  palazzo: {
    fitNote: 'Unstructured and full — takes its shape from movement. Generous through the leg; size down for a narrower fall.',
    rows: [
      { size: 'XS', waist: 68, hip: 104, rise: 31, inseam: 78, legOpening: 33 },
      { size: 'S', waist: 72, hip: 108, rise: 31.5, inseam: 79, legOpening: 34 },
      { size: 'M', waist: 76, hip: 112, rise: 32, inseam: 80, legOpening: 35 },
      { size: 'L', waist: 80, hip: 116, rise: 32.5, inseam: 81, legOpening: 36 },
      { size: 'XL', waist: 84, hip: 120, rise: 33, inseam: 82, legOpening: 37 },
    ],
  },
  cargo: {
    fitNote: 'Relaxed through the hip with a straight leg. Cut roomier than the Reg — take your usual size.',
    rows: [
      { size: 'XS', waist: 72, hip: 100, rise: 29, inseam: 76, legOpening: 20 },
      { size: 'S', waist: 76, hip: 104, rise: 29.5, inseam: 77, legOpening: 20.5 },
      { size: 'M', waist: 80, hip: 108, rise: 30, inseam: 78, legOpening: 21 },
      { size: 'L', waist: 84, hip: 112, rise: 30.5, inseam: 79, legOpening: 21.5 },
      { size: 'XL', waist: 88, hip: 116, rise: 31, inseam: 80, legOpening: 22 },
    ],
  },
  pleated: {
    fitNote: 'Single front pleat with a fluid fall. The pleat adds room through the hip — take your usual waist.',
    rows: [
      { size: 'XS', waist: 70, hip: 100, rise: 30, inseam: 77, legOpening: 22 },
      { size: 'S', waist: 74, hip: 104, rise: 30.5, inseam: 78, legOpening: 22.5 },
      { size: 'M', waist: 78, hip: 108, rise: 31, inseam: 79, legOpening: 23 },
      { size: 'L', waist: 82, hip: 112, rise: 31.5, inseam: 80, legOpening: 23.5 },
      { size: 'XL', waist: 86, hip: 116, rise: 32, inseam: 81, legOpening: 24 },
    ],
  },
}

export const toInches = (cm: number) => Math.round((cm / 2.54) * 10) / 10
