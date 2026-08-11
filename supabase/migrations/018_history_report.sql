-- 018_history_report.sql
-- Add history_report JSONB column to vehicles to persist vehicle history data
-- Backfill instructions: if you have historical records elsewhere (logs, temp storage), run an UPDATE to populate vehicles.history_report using that source after this migration.

BEGIN;

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS history_report JSONB NULL;

COMMENT ON COLUMN public.vehicles.history_report IS
  'Structured vehicle history report. Example shape: {"has_accident_history": true, "accident_status": "repaired", "repair_status": "repaired_and_inspected", "front_damage_level": "minor", "rear_damage_level": "none", "left_side_damage_level": "none", "right_side_damage_level": "none", "accident_summary": "Minor front bumper damage repaired", "inspection_notes": "Repaired and inspected by DMECH", "before_after_photo_urls": ["https://...", "https://..."] }';

COMMIT;
