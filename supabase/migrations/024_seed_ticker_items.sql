-- Seeds the platform_config row the new Announcements settings page
-- (/ops/settings/announcements, added by Michael) needs to actually save.
-- The PATCH route at /api/admin/settings/platform does
-- `.update(...).eq("key", "ticker_items")` -- like every other row in this
-- table, that requires the row to already exist; without this seed, Save
-- silently updates zero rows and nothing persists. Value matches the
-- FALLBACK array already hardcoded in src/app/api/marketing/ticker/route.ts
-- and the old Ticker.tsx, so the public ticker's actual content doesn't
-- change on migration.
insert into platform_config (key, value) values (
  'ticker_items',
  '[
    {"text": "New: Certified Nigerian-used vehicles now available", "orange": false},
    {"text": "3 Vehicles Cleared Customs This Week", "orange": true},
    {"text": "🇨🇳 Now Importing from China — New Cars & EVs", "orange": false},
    {"text": "Import Duties Reduced — Save More in 2026", "orange": true},
    {"text": "EVs: 10% Duty, Zero Green Tax — Ask Us How", "orange": false},
    {"text": "Chery Tiggo 7 Pro 2024 — Brand New In Stock", "orange": true},
    {"text": "Financing Available — Pay While Shipping", "orange": false},
    {"text": "DMECH Certified — Verified History, Real Warranty", "orange": true}
  ]'::jsonb
)
on conflict (key) do nothing;
