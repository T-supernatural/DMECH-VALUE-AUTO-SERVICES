-- Phase 2: online-payment foundation.
--
-- This is an immutable provider-facing ledger.  It deliberately sits beside
-- the existing staff-recorded `payments` table: a Paystack callback is not a
-- substitute for a verified financial record, and a staff payment must remain
-- visible and auditable.

create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  target_type text not null check (target_type in ('instalment_payment', 'pre_order_deposit', 'pre_order_balance', 'invoice')),
  target_id uuid not null,
  provider text not null default 'paystack' check (provider = 'paystack'),
  reference text not null unique,
  currency text not null check (currency in ('NGN', 'USD')),
  amount_subunit bigint not null check (amount_subunit > 0),
  status text not null default 'initialized' check (status in ('initialized', 'pending', 'succeeded', 'failed', 'abandoned')),
  provider_transaction_id text unique,
  provider_response jsonb,
  receipt_id uuid references invoices(id),
  initiated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_transactions_customer_idx on payment_transactions(customer_id, created_at desc);
create index if not exists payment_transactions_target_idx on payment_transactions(target_type, target_id);

create table if not exists payment_allocations (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references payment_transactions(id),
  target_type text not null check (target_type in ('instalment_payment', 'pre_order_deposit', 'pre_order_balance', 'invoice')),
  target_id uuid not null,
  amount_subunit bigint not null check (amount_subunit > 0),
  currency text not null check (currency in ('NGN', 'USD')),
  created_at timestamptz not null default now()
);

create table if not exists payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'paystack'),
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  unique(provider, provider_event_id, event_type)
);

-- The old pre-order booleans cannot represent partial payments.  Keep them
-- for compatibility with existing screens; the amounts are authoritative.
alter table pre_orders add column if not exists deposit_amount_paid_kobo bigint not null default 0;
alter table pre_orders add column if not exists balance_amount_paid_kobo bigint not null default 0;

alter table payment_transactions enable row level security;
alter table payment_allocations enable row level security;
alter table payment_webhook_events enable row level security;

create policy "staff read payment transactions" on payment_transactions for select using (dmech_is_staff());
create policy "customer read own payment transactions" on payment_transactions for select using (customer_id = dmech_customer_id());
create policy "staff read payment allocations" on payment_allocations for select using (dmech_is_staff());
create policy "customer read own payment allocations" on payment_allocations for select using (
  exists (select 1 from payment_transactions t where t.id = payment_allocations.transaction_id and t.customer_id = dmech_customer_id())
);
create policy "staff read payment webhook events" on payment_webhook_events for select using (dmech_is_staff());

-- All financial effects happen in one locked database transaction.  The
-- caller has already verified Paystack's signed event and independently
-- verified the transaction with Paystack; this function makes retries safe.
create or replace function dmech_confirm_online_payment(
  p_transaction_id uuid,
  p_provider_transaction_id text,
  p_confirmed_at timestamptz default now()
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  t payment_transactions%rowtype;
  remaining bigint;
  paid_total bigint;
  receipt uuid;
  target_payment payments%rowtype;
  target_preorder pre_orders%rowtype;
  target_invoice invoices%rowtype;
  receipt_description text;
begin
  select * into t from payment_transactions where id = p_transaction_id for update;
  if not found then raise exception 'Payment transaction not found'; end if;
  if t.status = 'succeeded' then return t.receipt_id; end if;
  if t.currency <> 'NGN' then raise exception 'No settled USD customer quote is configured'; end if;

  if t.target_type = 'instalment_payment' then
    select * into target_payment from payments where id = t.target_id for update;
    if not found or target_payment.customer_id <> t.customer_id then raise exception 'Invalid instalment payment target'; end if;
    remaining := target_payment.amount_kobo - coalesce(target_payment.amount_paid_kobo, 0);
    if t.amount_subunit > remaining then raise exception 'Payment exceeds outstanding balance'; end if;
    paid_total := coalesce(target_payment.amount_paid_kobo, 0) + t.amount_subunit;
    update payments set amount_paid_kobo = paid_total, paid_date = current_date,
      payment_method = 'paystack', status = case when paid_total >= amount_kobo then 'paid' else 'partial' end
      where id = target_payment.id;
    receipt_description := 'Online instalment payment #' || coalesce(target_payment.payment_number::text, '');
  elsif t.target_type = 'pre_order_deposit' then
    select * into target_preorder from pre_orders where id = t.target_id for update;
    if not found or target_preorder.customer_id <> t.customer_id then raise exception 'Invalid pre-order deposit target'; end if;
    remaining := target_preorder.deposit_amount_kobo - coalesce(target_preorder.deposit_amount_paid_kobo, 0);
    if t.amount_subunit > remaining then raise exception 'Payment exceeds outstanding balance'; end if;
    paid_total := coalesce(target_preorder.deposit_amount_paid_kobo, 0) + t.amount_subunit;
    update pre_orders set deposit_amount_paid_kobo = paid_total, deposit_paid = paid_total >= deposit_amount_kobo,
      deposit_paid_at = case when paid_total >= deposit_amount_kobo then now() else deposit_paid_at end,
      deposit_payment_method = 'paystack', status = case when paid_total >= deposit_amount_kobo and status = 'pending_deposit' then 'deposit_paid' else status end
      where id = target_preorder.id;
    receipt_description := 'Online pre-order deposit';
  elsif t.target_type = 'pre_order_balance' then
    select * into target_preorder from pre_orders where id = t.target_id for update;
    if not found or target_preorder.customer_id <> t.customer_id or target_preorder.balance_amount_kobo is null then raise exception 'Invalid pre-order balance target'; end if;
    remaining := target_preorder.balance_amount_kobo - coalesce(target_preorder.balance_amount_paid_kobo, 0);
    if t.amount_subunit > remaining then raise exception 'Payment exceeds outstanding balance'; end if;
    paid_total := coalesce(target_preorder.balance_amount_paid_kobo, 0) + t.amount_subunit;
    update pre_orders set balance_amount_paid_kobo = paid_total, balance_paid = paid_total >= balance_amount_kobo,
      balance_paid_at = case when paid_total >= balance_amount_kobo then now() else balance_paid_at end,
      balance_payment_method = 'paystack' where id = target_preorder.id;
    receipt_description := 'Online pre-order balance payment';
  else
    select * into target_invoice from invoices where id = t.target_id and doc_type = 'invoice' and voided_at is null for update;
    if not found or target_invoice.customer_id <> t.customer_id then raise exception 'Invalid invoice target'; end if;
    select target_invoice.total_kobo - coalesce(sum(total_kobo), 0) into remaining from invoices
      where doc_type = 'receipt' and related_invoice_id = target_invoice.id;
    if t.amount_subunit > remaining then raise exception 'Payment exceeds outstanding balance'; end if;
    receipt_description := 'Online payment for invoice ' || target_invoice.invoice_number;
  end if;

  insert into invoices (doc_type, vehicle_id, customer_id, instalment_id, payment_id, related_invoice_id, line_items,
    subtotal_kobo, vat_exempt, vat_amount_kobo, total_kobo, payment_method, paid_date)
  values ('receipt', coalesce(target_invoice.vehicle_id, null), t.customer_id,
    case when t.target_type = 'instalment_payment' then target_payment.instalment_id else null end,
    case when t.target_type = 'instalment_payment' then target_payment.id else null end,
    case when t.target_type = 'invoice' then target_invoice.id else null end,
    jsonb_build_array(jsonb_build_object('description', receipt_description, 'quantity', 1, 'unit_price_kobo', t.amount_subunit, 'amount_kobo', t.amount_subunit)),
    t.amount_subunit, true, 0, t.amount_subunit, 'paystack', current_date)
  returning id into receipt;

  insert into payment_allocations (transaction_id, target_type, target_id, amount_subunit, currency)
    values (t.id, t.target_type, t.target_id, t.amount_subunit, t.currency);
  update payment_transactions set status = 'succeeded', provider_transaction_id = p_provider_transaction_id,
    receipt_id = receipt, confirmed_at = p_confirmed_at, updated_at = now() where id = t.id;
  return receipt;
end;
$$;
