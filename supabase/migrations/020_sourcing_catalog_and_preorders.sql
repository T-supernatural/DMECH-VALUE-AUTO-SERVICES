-- Pre-Order system: customers can commit to a SPECIFIC real vehicle DMECH
-- has spotted abroad (Copart/IAAI in the US, equivalent sources in Europe,
-- EV sources in China) but does not yet own. Two new entities, deliberately
-- not folded into `vehicles`:
--
--   sourcing_listings — a staff-curated candidate vehicle DMECH doesn't own
--   yet. Carries auction-specific fields (lot number, title status, damage,
--   run-and-drive) that a normal DMECH-owned vehicle never has, and has no
--   VIN-confirmed record since DMECH hasn't bought it. `source_type`
--   defaults to 'manual' (staff typing in what they found on Copart/IAAI/
--   China sources themselves) but the column exists so a future automated
--   feed importer can write into this same table without a schema change —
--   that integration needs real Copart/IAAI dealer API access/licensing,
--   which is a business decision, not something buildable today.
--
--   pre_orders — a customer's commitment against one sourcing_listing.
--   Deliberately does NOT lock in a final price: the estimate is a
--   snapshot for reference, but the real total is only known once DMECH
--   actually wins the auction, so the deposit is a reservation fee, not a
--   downpayment against a fixed number. Graduates into a real `vehicles`
--   row (fulfilled_vehicle_id) once DMECH actually purchases it, the same
--   "intent -> real record" shape leads already use to become customers.
--
-- User action needed: run this in the Supabase SQL editor. Cannot execute
-- DDL directly (no Postgres connection, only the Data API via anon/
-- service-role keys).

create table sourcing_listings (
  id uuid primary key default gen_random_uuid(),
  source_platform text not null check (source_platform in ('copart', 'iaai', 'europe_other', 'china_ev', 'other')),
  source_type text not null default 'manual' check (source_type in ('manual', 'api_feed')),
  make text not null,
  model text not null,
  year int not null,
  trim text,
  vin text,
  lot_number text,
  title_status text check (title_status in ('clean', 'salvage', 'rebuilt', 'certificate_of_destruction', 'unknown')),
  primary_damage text,
  secondary_damage text,
  odometer_km int,
  run_and_drive boolean,
  fuel_type text check (fuel_type in ('petrol', 'diesel', 'hybrid', 'electric')),
  condition_notes text,
  location_country text not null,
  location_city text,
  auction_date date,
  estimated_price_usd_cents bigint not null,
  estimated_shipping_usd_cents bigint,
  photos jsonb not null default '[]'::jsonb, -- [{url, sort_order}] — simpler than vehicles.photos, no internal/tag concept needed for a public candidate listing
  status text not null default 'available' check (status in ('available', 'reserved', 'purchased', 'delisted')),
  fulfilled_vehicle_id uuid references vehicles(id),
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sourcing_listings_status_idx on sourcing_listings(status);
create index sourcing_listings_source_idx on sourcing_listings(source_platform);

create table pre_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  sourcing_listing_id uuid not null references sourcing_listings(id),
  estimated_total_usd_cents bigint not null, -- snapshot at commit time, for reference only — not a locked price
  deposit_pct numeric(5,2) not null, -- snapshot of preorder_deposit_pct at commit time
  deposit_amount_kobo bigint not null,
  deposit_paid boolean not null default false,
  deposit_paid_at timestamptz,
  deposit_payment_method text check (deposit_payment_method in ('bank_transfer', 'paystack', 'pos', 'cash')),
  status text not null default 'pending_deposit' check (status in (
    'pending_deposit', 'deposit_paid', 'sourcing', 'purchased', 'cancelled', 'refunded'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pre_orders_customer_idx on pre_orders(customer_id);
create index pre_orders_listing_idx on pre_orders(sourcing_listing_id);
create index pre_orders_status_idx on pre_orders(status);

alter table sourcing_listings enable row level security;
alter table pre_orders enable row level security;

-- sourcing_listings: public sees only 'available' ones (the actual browse
-- catalog); staff see everything (including reserved/purchased/delisted,
-- needed to manage the pipeline). Writes go through service-role route
-- handlers only, matching every other staff-curated table's convention.
create policy "public read available sourcing listings" on sourcing_listings
  for select to anon, authenticated
  using (status = 'available');
create policy "staff full read sourcing listings" on sourcing_listings for select using (dmech_is_staff());

-- pre_orders: a customer sees only their own; staff see all.
create policy "customer read own pre orders" on pre_orders for select using (customer_id = dmech_customer_id());
create policy "staff read pre orders" on pre_orders for select using (dmech_is_staff());

insert into platform_config (key, value) values
  ('preorder_deposit_pct', '20')
on conflict (key) do nothing;
