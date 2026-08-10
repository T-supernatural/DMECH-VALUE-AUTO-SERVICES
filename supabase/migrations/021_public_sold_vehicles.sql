-- Reverses part of migration 006's "public visibility... stops short of
-- 'sold'/'delivered'" decision, per explicit request: sold vehicles should
-- stay visible on the marketing site with a "Sold" badge instead of
-- silently vanishing from the marketplace. 'delivered' still stays private
-- (a delivered vehicle has left DMECH's marketing story entirely and is
-- purely the customer's property day-to-day) -- 'sold' is the one moment
-- worth showing off as social proof.
drop policy if exists "public read pipeline vehicles" on vehicles;
create policy "public read pipeline vehicles" on vehicles
  for select to anon, authenticated
  using (
    lifecycle_stage in ('shipped', 'in_transit', 'at_port', 'customs', 'cleared', 'available', 'reserved', 'sold')
    and is_published = true
    and deleted_at is null
  );
