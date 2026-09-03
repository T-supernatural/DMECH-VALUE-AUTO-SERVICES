-- Dedicated workshop bookings separate from generic marketing leads.
create table workshop_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  job_card_id uuid references job_cards(id),
  name text not null,
  phone text not null,
  vehicle_make text,
  vehicle_model text,
  vehicle_year text,
  plate_number text,
  powertrain text check (powertrain in ('petrol', 'diesel', 'hybrid', 'electric', 'not_sure')),
  enquiry_type text check (enquiry_type in ('diagnostic', 'service', 'repair', 'inspection', 'fleet', 'academy')),
  services text[] not null default '{}',
  complaint text,
  urgency text check (urgency in ('Today', 'This Week', 'Flexible')),
  preferred_date date,
  preferred_time time,
  status text not null default 'new' check (status in ('new', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  staff_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workshop_bookings_status_idx on workshop_bookings(status);
create index workshop_bookings_date_idx on workshop_bookings(preferred_date);
create index workshop_bookings_customer_idx on workshop_bookings(customer_id);
create index workshop_bookings_job_card_idx on workshop_bookings(job_card_id);

alter table workshop_bookings enable row level security;
grant insert on workshop_bookings to anon, authenticated;
create policy "anyone can submit workshop booking" on workshop_bookings
  for insert to anon, authenticated with check (true);
create policy "staff read workshop bookings" on workshop_bookings
  for select using (dmech_is_staff());

-- Staff mutations are performed through protected service-role route handlers.
