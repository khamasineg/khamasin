-- KHAMSIN — development seed (FW26)
--
-- Six styles, one per category, each mapped to a real photograph already in
-- /public/images/collections. Landform names follow CLAUDE.md §2: every style
-- is named for real desert terrain, with a stated reason the landform fits the
-- cut — not flavour text.
--
-- Stock is deliberately uneven: some sizes are zero so the sold-out state in
-- VariantSelector is exercised, and khamsin-wrap is fully out of stock so the
-- sold-out card treatment can be seen too.
--
-- Run:  npx supabase db query --linked -f supabase/seed.sql
-- Safe to re-run: it clears its own rows first.

begin;

delete from product_variants
where product_id in (select id from products where collection = 'FW26');
delete from products where collection = 'FW26';

insert into products (name, slug, landform, category, fabric, price, description, story, images, collection, active) values
(
  'The Erg Trouser', 'erg-trouser', 'Erg', 'wide-leg',
  'Mid-weight tencel twill',
  2400,
  'Wide through the leg, tapered at the ankle. Mid-weight tencel twill with a dry hand and a heavy drape.',
  'An erg is a dune-sea — wide, shifting, carved by wind rather than cut by hand. The trouser moves the same way: volume through the thigh that collapses to a clean line at the ankle.',
  array['/images/collections/wide-leg.jpg'],
  'FW26', true
),
(
  'The Hamada Short', 'hamada-short', 'Hamada', 'short',
  'Brushed cotton gabardine',
  1650,
  'Structured, high-rise, tailored short in brushed cotton gabardine. Holds a crease.',
  'A hamada is a rocky plateau — the terrain that holds its shape when everything around it moves. The short is built the same way: structured rise, clean hem, no slouch.',
  array['/images/collections/short.jpg'],
  'FW26', true
),
(
  'The Sabkha Pant', 'sabkha-pant', 'Sabkha', 'pleated',
  'Fluid crepe',
  2150,
  'Tone-on-tone, palest piece in the collection. Fluid crepe with a single pleat at the front.',
  'A sabkha is a salt flat — the palest ground in the desert, and the flattest. The palest tone in the range, and the quietest cut.',
  array['/images/collections/pleated.jpg'],
  'FW26', true
),
(
  'The Khamsin Wrap', 'khamsin-wrap', 'Khamsin', 'palazzo',
  'Washed viscose',
  2600,
  'The wind piece. Palazzo-cut, unstructured, moves with the body rather than against it.',
  'Named for the wind the house is named for. The only cut in the range with no internal structure at all — it takes its shape from movement.',
  array['/images/collections/palazzo.jpg'],
  'FW26', true
),
(
  'The Reg Trouser', 'reg-trouser', 'Reg', 'trouser',
  'Compact cotton twill',
  2200,
  'The core silhouette. Straight through the leg, mid-rise, compact cotton twill.',
  'A reg is a gravel plain — flat, even, unremarkable until you cross it. The everyday trouser: the one you stop noticing because it never asks anything of you.',
  array['/images/collections/trouser.jpg'],
  'FW26', true
),
(
  'The Wadi Cargo', 'wadi-cargo', 'Wadi', 'cargo',
  'Dry-finish cotton canvas',
  2350,
  'Non-denim utility. Two bellows pockets, tonal hardware, dry-finish cotton canvas.',
  'A wadi is a dry riverbed — empty most of the year, and the thing that carries everything when the rain comes. Pockets that hold, in a cut that stays tonal rather than tactical.',
  array['/images/collections/cargo.jpg'],
  'FW26', true
);

-- Variants — SKU pattern KH-FW26-<STYLE>-<SIZE>
insert into product_variants (product_id, size, sku, stock_quantity)
select p.id, v.size, 'KH-FW26-' || upper(v.style) || '-' || v.size, v.stock
from products p
join (values
  ('erg-trouser','ERG','XS',4),  ('erg-trouser','ERG','S',9),  ('erg-trouser','ERG','M',12),
  ('erg-trouser','ERG','L',6),   ('erg-trouser','ERG','XL',0),

  ('hamada-short','HAM','XS',0), ('hamada-short','HAM','S',7),  ('hamada-short','HAM','M',11),
  ('hamada-short','HAM','L',5),  ('hamada-short','HAM','XL',3),

  ('sabkha-pant','SAB','XS',3),  ('sabkha-pant','SAB','S',0),   ('sabkha-pant','SAB','M',8),
  ('sabkha-pant','SAB','L',4),   ('sabkha-pant','SAB','XL',2),

  -- fully sold out, to exercise the sold-out card state
  ('khamsin-wrap','KHW','XS',0), ('khamsin-wrap','KHW','S',0),  ('khamsin-wrap','KHW','M',0),
  ('khamsin-wrap','KHW','L',0),  ('khamsin-wrap','KHW','XL',0),

  ('reg-trouser','REG','XS',6),  ('reg-trouser','REG','S',10),  ('reg-trouser','REG','M',14),
  ('reg-trouser','REG','L',8),   ('reg-trouser','REG','XL',4),

  ('wadi-cargo','WAD','XS',2),   ('wadi-cargo','WAD','S',6),    ('wadi-cargo','WAD','M',9),
  ('wadi-cargo','WAD','L',7),    ('wadi-cargo','WAD','XL',0)
) as v(slug, style, size, stock) on v.slug = p.slug;

commit;
