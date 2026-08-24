-- A customer may already exist because staff created their sale, instalment,
-- or pre-order before that customer created a website login.  This function
-- attaches that existing record only after the route handler has verified a
-- WhatsApp OTP for the same phone number.

create or replace function dmech_claim_customer_portal(
  p_auth_user_id uuid,
  p_email text,
  p_phone text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_customer customers%rowtype;
  portal_user users%rowtype;
begin
  select * into existing_customer from customers
    where phone = p_phone and deleted_at is null
    for update;
  if not found then
    raise exception 'No existing DMECH customer record matches this phone number';
  end if;
  if exists (select 1 from customers where phone = p_phone and deleted_at is null offset 1) then
    raise exception 'Multiple customer records match this phone number; contact DMECH support';
  end if;

  select * into portal_user from users where auth_user_id = p_auth_user_id for update;
  if found and portal_user.role <> 'customer' then
    raise exception 'This website login is not a customer account';
  end if;
  if not found then
    insert into users (auth_user_id, email, phone, full_name, role, is_active)
      values (p_auth_user_id, p_email, p_phone, existing_customer.full_name, 'customer', true)
      returning * into portal_user;
  end if;

  if existing_customer.user_id is not null and existing_customer.user_id <> portal_user.id then
    raise exception 'This customer record is already linked to another portal account';
  end if;
  update customers set user_id = portal_user.id,
    email = coalesce(email, p_email),
    whatsapp_verified = true,
    whatsapp_verified_at = coalesce(whatsapp_verified_at, now()),
    updated_at = now()
    where id = existing_customer.id;
  return existing_customer.id;
end;
$$;
