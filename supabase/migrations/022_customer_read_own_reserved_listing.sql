-- Bug found during an end-to-end test of the pre-order flow: a customer who
-- reserves a sourcing listing immediately loses the ability to see that
-- listing's own details (make/model/year via the sourcing_listings(...)
-- embed on their pre_orders query) the moment it flips to 'reserved' --
-- 020's "public read available sourcing listings" policy only covers
-- status='available', and PostgREST embeds enforce RLS on the embedded
-- table too. The customer's portal dashboard silently fell back to the
-- generic "Vehicle" placeholder instead of showing what they actually
-- reserved. This adds the missing case: a customer can always read a
-- sourcing_listings row that their own pre_order points at, regardless of
-- its current status.
create policy "customer read own reserved sourcing listing" on sourcing_listings
  for select using (
    id in (select sourcing_listing_id from pre_orders where customer_id = dmech_customer_id())
  );
