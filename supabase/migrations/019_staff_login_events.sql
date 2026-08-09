-- Login/device visibility (the security-review follow-up that was scoped
-- but never built): every staff login attempt, success or failure, gets a
-- real row here -- who, from what IP/device, and whether this device has
-- been seen for that user before. This is what makes "do we have a
-- breach" an answerable question instead of a guess.
--
-- User action needed: run this in the Supabase SQL editor. Cannot execute
-- DDL directly (no Postgres connection, only the Data API via anon/
-- service-role keys).
create table staff_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  email text not null,
  success boolean not null,
  device_id text,
  is_new_device boolean not null default false,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index staff_login_events_user_idx on staff_login_events(user_id);
create index staff_login_events_created_idx on staff_login_events(created_at desc);

alter table staff_login_events enable row level security;

-- Same shape as audit_log (003_rls_policies.sql): broad staff read via
-- dmech_is_staff(), no client-side insert policy at all -- every row is
-- written by the service-role client from the login-event route handler.
-- The Settings page itself narrows who conveniently sees this to
-- super_admin/managing_partner/it_manager at the application layer, same
-- as Audit Log already does.
create policy "staff read login events" on staff_login_events for select using (dmech_is_staff());
