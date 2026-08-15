-- Balance-before-delivery for Reserve From Abroad pre-orders. Today a
-- pre-order only ever tracks a deposit -- nothing records what the customer
-- still owes once DMECH actually buys the vehicle, and nothing stops it
-- reaching lifecycle_stage 'delivered' before that balance is paid. This
-- adds the balance fields; the vehicles PATCH route enforces the actual
-- gate (see src/app/api/vehicles/[id]/route.ts).

alter table pre_orders
  add column if not exists balance_amount_kobo bigint,
  add column if not exists balance_paid boolean not null default false,
  add column if not exists balance_paid_at timestamptz,
  add column if not exists balance_payment_method text check (
    balance_payment_method in ('bank_transfer', 'paystack', 'pos', 'cash')
  );
