-- KHAMSIN — initial schema (CLAUDE.md §8)
--
-- Run this against a NEW Supabase project (not FYNDE's). Once the project
-- exists: `supabase link --project-ref <ref>` then `supabase db push`, or
-- paste this file into the Supabase SQL editor.
--
-- NOTE — Open Assumption #1 (CLAUDE.md): this assumes batch production with
-- a per-size stock count (`product_variants.stock_quantity`). If KHAMSIN is
-- actually made-to-order / single-run per style, replace stock_quantity with
-- a `production_status` enum instead — confirm with the founder first.

create extension if not exists "pgcrypto";

-- ─── products ────────────────────────────────────────────────────────────
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  landform    text not null, -- e.g. erg, hamada, sabkha, reg, wadi, playa — see CLAUDE.md §2
  category    text not null check (category in ('trouser', 'short', 'wide-leg', 'palazzo', 'cargo', 'pleated')),
  fabric      text,
  price       numeric(10, 2) not null check (price >= 0),
  description text,
  story       text,
  images      text[] not null default '{}',
  collection  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_collection_idx on products (collection);
create index if not exists products_active_idx on products (active);

-- ─── product_variants ───────────────────────────────────────────────────
create table if not exists product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products (id) on delete cascade,
  size           text not null,
  sku            text not null unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at     timestamptz not null default now(),
  unique (product_id, size)
);

create index if not exists product_variants_product_id_idx on product_variants (product_id);

-- ─── orders ──────────────────────────────────────────────────────────────
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  customer_email text not null,
  items          jsonb not null, -- [{product_id, variant_id, size, qty, price}, ...]
  total          numeric(10, 2) not null check (total >= 0),
  payment_id     text,
  status         text not null default 'pending',
  created_at     timestamptz not null default now()
);

create index if not exists orders_customer_email_idx on orders (customer_email);
create index if not exists orders_status_idx on orders (status);

-- ─── subscribers ────────────────────────────────────────────────────────
create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  push_token text,
  created_at timestamptz not null default now()
);

-- ─── Row Level Security ─────────────────────────────────────────────────
-- Public storefront reads active products/variants via the anon key.
-- Writes (orders, subscribers, admin product management) go through the
-- service role key on the server — no public write policies here.

alter table products enable row level security;
alter table product_variants enable row level security;
alter table orders enable row level security;
alter table subscribers enable row level security;

create policy "Public can read active products"
  on products for select
  using (active = true);

create policy "Public can read variants of active products"
  on product_variants for select
  using (
    exists (
      select 1 from products
      where products.id = product_variants.product_id
      and products.active = true
    )
  );

-- No public select/insert/update/delete policies on orders or subscribers —
-- all access to those tables goes through the service role key server-side.
