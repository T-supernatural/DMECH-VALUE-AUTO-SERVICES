-- 020_rollback_history_report.sql
-- Rollback for 018_history_report: remove history_report column if needed

BEGIN;

ALTER TABLE public.vehicles
  DROP COLUMN IF EXISTS history_report;

COMMIT;
