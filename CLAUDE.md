# KHAMSIN — Project Instructions (CLAUDE.md)

Read this file in full at the start of every session. It supersedes FYNDE's project
instructions entirely — KHAMSIN is not a reskin of the vintage brand, it shares
infrastructure with it. If a future session drifts toward FYNDE conventions (film grain,
custom cursor, era-based collections, vintage-editorial copy voice), that's a bug in the
session, not a valid shortcut — flag it and stop.

Never ask the founder to re-explain the brand. Never assume a design decision below is
final unless marked LOCKED. Call out mobile-first violations, scope creep, and anything
that quietly reintroduces FYNDE's identity — immediately, not at review time.

## READ FIRST — Open Assumptions

These are not settled. Each one changes real architecture if the answer is different.
Confirm with the founder before the relevant week starts.

1. **Stock model** — this doc assumes batch production with a per-size stock count
   (see schema below). If KHAMSIN is actually made-to-order or single-run per style,
   `stock_quantity` is wrong and needs to become a `production_status` enum instead.
2. **Mobile traffic %** — FYNDE assumed 90% mobile; that number has no basis for KHAMSIN
   and isn't stated in the brand brief. Mobile-first is kept as the default (safe for
   any D2C apparel brand) but treat the specific rules below as provisional until
   confirmed.
3. **Inventory manager** — unclear who toggles stock day-to-day. FYNDE's non-technical
   co-founder pattern is assumed reusable but not confirmed for KHAMSIN.
4. **Domain & registrar** — not yet chosen.
5. **Price display pre-launch** — brief says pricing "not disclosed yet." Build the
   price field as admin-editable and easy to hide from the storefront until told
   otherwise.
6. **Existing HTML prototype** — a working prototype with the wind/contour animation
   already exists (built earlier, sent via WhatsApp). Treat it as the reference
   implementation for the signature motif — port it, don't redesign from this doc alone.

## DECIDED — not yet built

Settled calls that the code does not reflect yet. Don't re-litigate these; build them
when their turn comes.

- **Size charts are per-product, entered from the admin panel.** LOCKED.
  Today `src/lib/sizeChart.ts` hardcodes one chart per *category* as a stand-in, and
  `SizeChart.tsx` reads from it. The real thing needs a `size_charts` table (or a jsonb
  column on `products`), admin UI to enter measurements per product, and `SizeChart.tsx`
  switching to `product.size_chart` with the category chart kept as fallback for
  products that don't have one. The existing `SizeChart` type is already shaped for this.
  Blocked on: the admin panel, which was removed in the rebuild and needs rebuilding.

---

## 1. The Brand

**Name:** KHAMSIN — the hot, dry wind that blows across Egypt and the Arabian desert in
spring. The site's signature motion is wind-based because of this, not as decoration.

**Tagline:** "Cut for the wind."

**Category:** Unisex bottoms only — trousers, wide-leg pants, tailored shorts, palazzo,
pleated pants, non-denim cargo. Denim is deliberately excluded.

**Positioning:** "KHAMSIN makes the bottom half of your wardrobe as considered as the top
half usually is. No denim, no noise — just trousers built for movement, in the tonal
language of the desert."

**Customer:** Unisex, premium/contemporary. EGP 1,600–2,600 per piece. Not luxury, not
mass.

**Brand pillars — sanity-check every design decision against these:**
- **Stillness** — calm, uncluttered, editorial restraint
- **Terrain** — texture and tone from real desert geology, not "boho desert" cliché
- **Movement** — fabric and fit designed around how a body actually moves
- **Precision** — considered tailoring, not loose resort wear

## 2. Name & Voice

**Voice:** Dry, precise, unshowy. Short sentences. No exclamation points. No
"elevated essentials" language — avoid the generic minimalist-brand vocabulary that's
everywhere right now. If a line of copy could sit on any other minimalist apparel site
unchanged, rewrite it.

**Product naming system:** every style is named after a real desert landform — this is a
genuine system, not flavor text.
- The Erg Trouser (dune-sea, wide-leg)
- The Hamada Short (rocky plateau, structured)
- The Sabkha Pant (salt flat, palest tone)
- The Khamsin Wrap (the wind piece, palazzo-cut)

New styles need a real landform name (erg, hamada, sabkha, reg, wadi, playa, etc.) with a
one-line rationale for why that landform fits that cut — don't reuse a landform name for
an unrelated silhouette just because it sounds good.

## 3. Visual Identity

### Color — "Minimal Saharan Editorial"

| Name | Hex | Use |
|---|---|---|
| Bleached Bone | `#FAF6EF` | Lightest background, product photography backdrop |
| Bone | `#F1EAD9` | Primary background |
| Sand | `#C6AE82` | Primary brand tone — packaging, secondary surfaces |
| Dune Shadow | `#9C8563` | Mid-tone — borders, secondary text |
| Basalt | `#2A2521` | Near-black — body text, ink |
| Clay | `#B5673A` | Single warm accent — never more than ~5% of a layout |

Use two or three tones per layout, not all six at once.

**Watch this:** Bone (`#F1EAD9`) + Clay (`#B5673A`) is uncomfortably close to the single
most common AI-generated-design cliché right now — warm cream background near `#F4F1EA`
with a terracotta/clay accent near `#D97757`. The palette itself isn't wrong (it's the
founder's brief, not a default Claude picked), but if the typography and layout don't
carry real personality, the whole site will read as templated despite the correct hex
values. The signature motif and the type pairing below are what have to do the
differentiating work — don't let the palette coast on its own.

### Typography
- **Display** (headlines, product names): Fraunces, "Soft" optical size
- **Body** (paragraphs, product copy): Inter or Public Sans, slightly wide tracking
- **Utility** (prices, sizes, captions): Space Mono — numerals and small tags only,
  never headlines

### Signature motif — the contour line
Desert topographic maps render dunes as thin, rhythmic contour lines. This is KHAMSIN's
one distinctive, ownable graphic device — used on packaging and as the wind animation on
the site. No literal desert clipart (sun, cacti, camels) — the contour line carries that
reference instead.

A working HTML prototype of this already exists (see Open Assumptions #6). Port it into
a `ContourWind` component rather than redesigning it from scratch.

### Photography direction
- Raw plaster, sand-toned concrete, or real desert locations at flat midday light —
  not golden-hour.
- Garments shown in motion more than static studio shots.
- No smiling-at-camera shots — candid or off-frame, editorial.
- **No desaturation or vignette.** FYNDE's photography treatment (desaturated,
  vignetted, "aged") is the opposite of this brief's flat, true-to-color direction.
  If you're reusing FYNDE's Cloudinary transform presets, strip that filter — don't
  carry it over by default.

### Materials
Mid-weight, structured-but-fluid — brushed cotton gabardine. Avoid anything too stiff in
how fabric drape is rendered/described.

## 4. Design Principles Claude Must Follow

- Ground every UI decision in the actual brief — the desert/terrain/wind vocabulary,
  not a generic "minimalist fashion site" template.
- Spend the design's boldness in one place: the contour/wind motif. Keep everything
  around it quiet and disciplined.
- Structural devices (numbering, dividers, labels) must encode something true about the
  content — don't add a 01/02/03 sequence unless the content is actually sequential.
- Copy is design material. Write from the customer's side of the screen, plain verbs,
  sentence case, no filler. An empty cart or a sold-out size is a moment for direction
  ("Notify me when this size restocks"), not a shrug.
- Build to a quality floor without announcing it: responsive to 375px, visible keyboard
  focus, `prefers-reduced-motion` respected everywhere.
- Before shipping a new page or component, check it against the AI-cliché calibration
  above — if it would look the same on any other minimalist apparel brief, it's not
  done yet.

## 5. Tech Stack

Reused from FYNDE — this layer is genuinely brand-agnostic:
- Framework: Next.js 14 (App Router) + TypeScript
- Styling: Tailwind CSS
- Database & Auth: Supabase (**new project**, not FYNDE's)
- Payments: Paymob (Egypt-friendly) or PayPal — decide by the cart week
- Images: Cloudinary (free tier), always lazy-loaded and compressed, **no vintage
  filter presets**
- Email: Resend (free tier, 3,000/month)
- Push: Novu (free tier, 30,000 events/month)
- Animation: GSAP (free tier) + Framer Motion + Lenis
- Cart state: Zustand
- Hosting: Vercel (free tier, auto-deploy from GitHub) — **new project**
- IDE: Claude Code, working directly in the repo

## 6. Cost Rules

Hard limit: $0–10/month after launch. Same constraint as FYNDE — Vercel/Supabase/
Cloudinary/Resend/Novu/GSAP all on free tiers, domain ~$1/month amortized, payment
processors charge per-transaction only. No Stripe, no Shopify, no paid CMS.

## 7. Mobile-First Rules

Provisional pending Open Assumption #2, but default to these regardless:
- Design and code mobile layout first (375px base)
- Desktop is an enhancement of mobile, never the reverse
- Minimum tap target: 44×44px
- Page load under 3 seconds on mobile
- No hover-only interactions
- Mobile components needed: bottom nav, swipeable product gallery, drawer-style cart,
  full-screen mobile menu, and a **size selector that clearly shows sold-out sizes**
  (this is new vs. FYNDE — FYNDE never needed a size-availability UI)

## 8. Data Model (Supabase)

This is the biggest real change from FYNDE. FYNDE's `sold` boolean works for one-of-one
vintage pieces; it cannot represent a style available in multiple sizes with independent
stock. Variants are a separate table.

```
products:
  id (uuid), name, slug (unique), landform, category
    (enum: trouser | short | wide-leg | palazzo | cargo | pleated),
  fabric, price, description, story, images (text[]),
  collection, active (boolean), created_at

product_variants:
  id (uuid), product_id (fk -> products.id), size, sku (unique),
  stock_quantity (int), created_at

orders:
  id (uuid), customer_email, items (jsonb — each line:
    {product_id, variant_id, size, qty, price}),
  total, payment_id, status, created_at

subscribers:
  id (uuid), email, push_token, created_at
```

`era` and `condition` from FYNDE are dropped entirely — they describe vintage
provenance and have no KHAMSIN equivalent.

## 9. Site Structure

```
/ ........................ Homepage
/shop ..................... Full product archive with filters
/shop/[slug] .............. Single product detail (variant/size selector, stock-aware)
/collections/[category] ... Category pages — trouser, short, wide-leg, palazzo, cargo
/lookbook ................. Editorial lookbook
/about .................... Brand story
/cart ..................... Cart page
/account .................. Order history and wishlist
```

`/collections/[era]` from FYNDE is replaced by `/collections/[category]` — KHAMSIN has
no decade taxonomy.

## 10. Animation Rules

Priority order unchanged from FYNDE: CSS first, GSAP only where CSS can't do it, Framer
Motion for React transitions, Lenis for desktop smooth scroll.

Mobile rules unchanged: complex animation disabled by default, `prefers-reduced-motion`
respected, instant reveals not staggered, loader capped at 1.5s.

**Desktop wow-moments — KHAMSIN-specific, not reused from FYNDE:**
- Loader: contour lines draw themselves in, forming the wordmark
- `ContourWind`: ambient contour-line motif with wind-driven motion (ported from the
  existing prototype) — this is the signature element, treat it as such
- Product hover: subtle contour-line trace instead of FYNDE's crossfade-to-second-angle
- Cart drawer: same spring-physics slide-in pattern as FYNDE — this genuinely transfers
- Page transitions: full-screen wipe, restyle in Bone/Basalt instead of FYNDE's
  parchment

**Explicitly removed, not restyled:** ~~custom cursor~~, film grain overlay, red stamp
labels. These are FYNDE's visual grammar, not KHAMSIN's — don't port and reskin them,
delete them.

> **REVERSED — custom cursor is now IN.** The founder asked for one explicitly, themed
> to KHAMSIN. Built as `components/ui/Cursor.tsx`: a 1px contour-weight ring that trails
> a Clay dot, opening on links and becoming a crosshair over the product plate. Do not
> delete it on the strength of the struck-through line above.
>
> The original ban was sound in its reasoning — FYNDE's version set
> `cursor: none !important` globally and broke text selection and form fields. That
> specific failure is avoided here: the native cursor is hidden only on fine-pointer
> devices, inputs/textareas/selects keep their caret, and the whole component is inert
> on touch and under `prefers-reduced-motion`. Keep those guards if you touch it.

## 11. File Structure

```
khamsin/
├── app/
│   ├── layout.tsx              ← Root layout: Nav, Footer, ContourWind, Lenis
│   ├── page.tsx
│   ├── shop/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx     ← includes VariantSelector
│   ├── collections/
│   │   └── [category]/page.tsx
│   ├── lookbook/page.tsx
│   ├── about/page.tsx
│   ├── cart/page.tsx
│   ├── account/page.tsx
│   └── api/
│       ├── products/
│       ├── orders/
│       └── notifications/
├── components/
│   ├── layout/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   └── PageTransition.tsx
│   ├── ui/
│   │   ├── ContourWind.tsx     ← signature motif, replaces Cursor.tsx + Grain.tsx
│   │   ├── Ticker.tsx
│   │   └── Toast.tsx
│   ├── shop/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── VariantSelector.tsx ← new — size + stock-aware
│   │   └── FilterBar.tsx
│   └── cart/
│       ├── CartDrawer.tsx
│       └── CartItem.tsx
├── lib/
│   ├── supabase.ts
│   ├── cloudinary.ts
│   ├── resend.ts
│   └── novu.ts
├── store/
│   └── cart.ts
├── hooks/
│   ├── useCart.ts
│   ├── useScrollReveal.ts
│   └── useIsMobile.ts
├── types/
│   └── index.ts
└── styles/
    └── globals.css
```

## 12. Build Plan

**Week 0 — The Leap Step** (do this before any feature work):
Fork repo, new Supabase project, run the schema in §8, delete FYNDE-specific code
(Cursor, Grain, stamps, era/condition fields, vintage copy), swap design tokens
(fonts + colors), drop this file in as `CLAUDE.md`.

- **Week 1:** Nav/Footer/layout shell + `ContourWind` built and reviewed in isolation
  before it's wired into any page
- **Week 2:** Homepage, mobile-first, all sections
- **Week 3:** Shop page + product detail with `VariantSelector`, connected to Supabase
- **Week 4:** Cart (Zustand) + `CartDrawer` with per-size stock validation + payment
  integration
- **Week 5:** Resend emails + Novu push notifications
- **Week 6:** Collection pages (by category) + Lookbook + About
- **Week 7:** Animation pass — GSAP, Framer Motion, Lenis, mobile performance audit
- **Week 8:** SEO, final QA, Vercel deploy, domain DNS, launch

This is a 9-slot plan (Week 0 + 8), not FYNDE's 8 — the schema migration and motif build
are real work, not absorbed into existing weeks.

## 13. Domain & Deployment

New Vercel project, separate from FYNDE's. Domain not yet chosen (Open Assumption #4) —
confirm registrar and DNS process once picked; don't assume GoDaddy by default.

## 14. How We Work Together

Claude Code edits this repo directly — there's no prompt-relay step like FYNDE's
Cursor/v0.dev loop.

1. Claude states the task and which files it'll touch
2. Claude edits the code directly
3. You review the diff (and run it, on mobile viewport first)
4. You give a verdict: approved / needs changes / question
5. Repeat

Claude's responsibilities: make architecture decisions and explain tradeoffs, call out
mobile-first violations and anything that reintroduces FYNDE's identity, flag scope that
doesn't match this doc, never give partial or "TODO" output.

Your responsibilities: test every merged task on mobile before marking it done, make the
calls on open design questions when Claude presents options, keep this file updated when
a real decision changes (mark it LOCKED once it's final).

## 15. What Carries Over vs. What's New

| Carries over as-is | Needs real adaptation | Entirely new |
|---|---|---|
| Next.js/Tailwind/Supabase/Cloudinary/Resend/Novu/Vercel setup | Routes (era → category) | `ContourWind` component |
| Zustand cart architecture | Cart/checkout logic (size + stock check) | Full copy/voice pass |
| Mobile-first component patterns (bottom nav, drawer, swipe gallery) | Design tokens (fonts/colors — mechanically easy, but everywhere) | `VariantSelector` |
| Hooks (`useCart`, `useIsMobile`) | Cloudinary transform presets (remove desaturation/vignette) | Landform naming system for new styles |
| Deploy pipeline | | |

Deleted, not adapted: `Cursor.tsx`, `Grain.tsx`, stamp-label components, `era`/
`condition` fields, all vintage-editorial copy.