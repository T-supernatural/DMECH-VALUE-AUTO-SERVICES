-- "Can't find what you want? Tell us" -- a visitor describes a specific
-- vehicle they're after (not necessarily one already in `vehicles` or
-- `sourcing_listings`) and staff triage it. Deliberately its own table
-- rather than folded into `leads`: leads is a one-way "captured, then maybe
-- converted to a customer" record, but a vehicle request has a real
-- multi-state staff workflow (new -> contacted -> sourcing -> fulfilled/
-- closed) independent of whether it ever becomes a registered customer.
create table vehicle_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  make text,
  model text,
  year_min int,
  year_max int,
  budget_max_kobo bigint,
  fuel_type text check (fuel_type in ('petrol', 'diesel', 'hybrid', 'electric')),
  source_region_preference text check (source_region_preference in ('usa', 'europe', 'china', 'nigeria')),
  condition_preference text check (condition_preference in ('used', 'new')),
  timeline text check (timeline in ('immediately', 'within_1_month', 'within_3_months', 'just_browsing')),
  notes text,
  -- Where on the site the request came from -- the dedicated page, or an
  -- empty-state CTA on a page that just showed the visitor nothing matching.
  source text not null default 'dedicated_page' check (source in ('dedicated_page', 'vehicles_empty', 'sourcing_empty')),
  status text not null default 'new' check (status in ('new', 'contacted', 'sourcing', 'fulfilled', 'closed')),
  staff_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vehicle_requests_status_idx on vehicle_requests(status);
create index vehicle_requests_phone_idx on vehicle_requests(phone);

alter table vehicle_requests enable row level security;

-- Same shape as leads' "anyone can create a lead" policy: a public capture
-- form needs no auth to insert, but only staff can ever read the list back.
-- No client-side UPDATE policy -- status/staff_notes changes go through a
-- service-role route handler, matching every other staff-triaged table here.
grant insert on vehicle_requests to anon, authenticated;
create policy "anyone can submit a vehicle request" on vehicle_requests
  for insert to anon, authenticated
  with check (true);
create policy "staff read vehicle requests" on vehicle_requests for select using (dmech_is_staff());
