import { TONES, SwatchTone } from '@/components/shop/FabricSwatch'
import { ProductCategory } from '@/types'

/**
 * The canonical FW26 styles — names, copy, pricing and landform rationale are
 * the founder's, taken verbatim from khamsin-website-prototype.html.
 *
 * Single source of truth so the homepage grid, the shop archive and the
 * lookbook can't drift apart. These render only while the Supabase catalog is
 * empty; every surface that uses them swaps to live rows the moment products
 * are seeded (see `isLive` handling in the consumers).
 */
export type PreviewStyle = {
  slug: string
  name: string
  landform: string
  category: ProductCategory
  desc: string
  /** Editorial one-liner used by the lookbook spreads. */
  line: string
  /** Why this landform fits this cut — CLAUDE.md §2 requires the rationale. */
  why: string
  price: number
  tone: SwatchTone
}

export const FW26: PreviewStyle[] = [
  {
    slug: 'erg-trouser',
    name: 'The Erg Trouser',
    landform: 'Erg',
    category: 'wide-leg',
    desc: 'Wide through the leg, tapered at the ankle. Mid-weight tencel twill.',
    line: 'Dune-sea cut. Wide through the leg, settled at the ankle.',
    why: 'A dune-sea is wide, shifting, wind-carved — the wide-leg cut moves the same way.',
    price: 2400,
    tone: TONES.erg,
  },
  {
    slug: 'hamada-short',
    name: 'The Hamada Short',
    landform: 'Hamada',
    category: 'short',
    desc: 'Structured, high-rise, tailored short in brushed cotton gabardine.',
    line: 'Rocky plateau. Structured rise, clean hem.',
    why: 'A rocky plateau holds its shape under pressure — the structured short does too.',
    price: 1650,
    tone: TONES.hamada,
  },
  {
    slug: 'sabkha-pant',
    name: 'The Sabkha Pant',
    landform: 'Sabkha',
    category: 'pleated',
    desc: 'Tone-on-tone, palest piece in the collection. Fluid crepe, pleated front.',
    line: 'Salt flat. The palest tone — fluid, pleated.',
    why: 'A salt flat is the palest terrain in the desert — the palest tone in the range.',
    price: 2150,
    tone: TONES.sabkha,
  },
  {
    slug: 'khamsin-wrap',
    name: 'The Khamsin Wrap',
    landform: 'Khamsin',
    category: 'palazzo',
    desc: 'The wind piece. Palazzo-cut, unstructured, moves with the body.',
    line: 'The wind piece. Palazzo-cut, unstructured, in motion.',
    why: 'Named for the wind itself — the palazzo cut, full and moving.',
    price: 2600,
    tone: TONES.khamsin,
  },
]

export const TONE_CYCLE: SwatchTone[] = [TONES.erg, TONES.hamada, TONES.sabkha, TONES.khamsin]
