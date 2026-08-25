insert into platform_config (key, value) values
  ('financing_config', '{"defaultDepositPct":40,"defaultTenorMonths":6,"tenors":[{"months":3,"interestPct":15},{"months":6,"interestPct":20},{"months":9,"interestPct":25},{"months":12,"interestPct":30}]}')
on conflict (key) do nothing;