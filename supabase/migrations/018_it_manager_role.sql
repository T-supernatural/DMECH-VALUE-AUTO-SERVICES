-- Adds an it_manager role, scoped to Platform Settings, the Audit Log, and
-- staff account provisioning (create/deactivate/reset password) -- but it
-- can never grant or hold super_admin. That's enforced in application code
-- (src/app/api/admin/staff/route.ts and [id]/route.ts), not by RLS, since
-- role assignment already goes through those service-role route handlers
-- per 003's "mutations go through route handlers" convention. This
-- migration only needs to widen the CHECK constraint so the value is legal.
--
-- User action needed: run this in the Supabase SQL editor. Cannot execute
-- DDL directly (no Postgres connection, only the Data API via anon/
-- service-role keys).

-- users_role_check is Postgres's default auto-generated name for the
-- unnamed inline CHECK on users.role from 001_schema.sql (confirmed working
-- under this name by 004_super_admin_role.sql). If this DROP errors because
-- the real name differs, look it up (\d users in the SQL editor) and
-- adjust -- don't guess further.
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in (
  'super_admin','managing_partner','sales_manager','ops_manager','workshop_lead',
  'sales_rep','accountant','it_manager','customer'
));
