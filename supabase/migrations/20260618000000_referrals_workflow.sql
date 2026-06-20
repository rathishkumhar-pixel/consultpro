alter table public.bookings
add column if not exists referred_by_mobile text;

create table if not exists public.referrals (
  id bigint generated always as identity primary key,
  created_at timestamp default now()
);

alter table public.referrals
add column if not exists booking_id bigint references public.bookings(id) on delete cascade,
add column if not exists customer_name text,
add column if not exists referred_phone text,
add column if not exists referrer_phone text,
add column if not exists service_requested text,
add column if not exists booking_date date,
add column if not exists slot text,
add column if not exists status text not null default 'Pending',
add column if not exists fraud_notes text,
add column if not exists updated_at timestamp default now(),
add column if not exists completed_at timestamp;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'referrals_status_check'
      and conrelid = 'public.referrals'::regclass
  ) then
    alter table public.referrals
    add constraint referrals_status_check
    check (status in ('Pending','Completed'));
  end if;
end;
$$;

create unique index if not exists referrals_referred_phone_unique
on public.referrals (referred_phone);

create index if not exists referrals_referrer_phone_index
on public.referrals (referrer_phone);

create index if not exists referrals_status_index
on public.referrals (status);

alter table public.referrals enable row level security;

drop policy if exists "public_select_referrals" on public.referrals;
create policy "public_select_referrals"
on public.referrals
for select
to public
using (true);

create or replace function public.normalize_indian_mobile(value text)
returns text
language plpgsql
immutable
as $$
declare
  digits text;
begin
  digits := regexp_replace(coalesce(value,''), '\D', '', 'g');

  if length(digits) = 12 and left(digits,2) = '91' then
    digits := right(digits,10);
  end if;

  return digits;
end;
$$;

create or replace function public.create_booking_with_referral(
  p_name text,
  p_phone text,
  p_category text,
  p_booking_date date,
  p_slot text,
  p_referrer_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_phone text;
  v_referrer_phone text;
  v_booking_id bigint;
  v_referral_id bigint;
  v_referrer_exists boolean;
  v_referral_exists boolean;
begin
  v_customer_phone := public.normalize_indian_mobile(p_phone);
  v_referrer_phone := public.normalize_indian_mobile(p_referrer_phone);

  if nullif(trim(coalesce(p_name,'')),'') is null
    or nullif(trim(coalesce(p_category,'')),'') is null
    or p_booking_date is null
    or nullif(trim(coalesce(p_slot,'')),'') is null then
    raise exception 'Please fill all required fields.';
  end if;

  if v_customer_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'Customer mobile number must be a valid Indian number.';
  end if;

  if p_booking_date <= current_date then
    raise exception 'Please select a future date.';
  end if;

  if nullif(trim(coalesce(p_referrer_phone,'')),'') is null then
    insert into public.bookings (
      name,
      phone,
      category,
      booking_date,
      slot
    )
    values (
      trim(p_name),
      v_customer_phone,
      trim(p_category),
      p_booking_date,
      trim(p_slot)
    )
    returning id into v_booking_id;

    return jsonb_build_object(
      'booking_id', v_booking_id,
      'referral_id', null,
      'referral_status', null
    );
  end if;

  if v_referrer_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'Referrer mobile number must be a valid Indian number.';
  end if;

  if v_referrer_phone = v_customer_phone then
    raise exception 'Referrer mobile number cannot be the same as customer mobile number.';
  end if;

  select exists (
    select 1
    from public.bookings
    where completed = true
      and public.normalize_indian_mobile(phone) = v_referrer_phone
  ) into v_referrer_exists;

  if not v_referrer_exists then
    raise exception 'Referrer mobile number must exist in a completed consultation.';
  end if;

  select exists (
    select 1
    from public.referrals
    where referrals.referred_phone = v_customer_phone
  ) into v_referral_exists;

  if v_referral_exists then
    raise exception 'This customer has already been referred previously.';
  end if;

  insert into public.bookings (
    name,
    phone,
    category,
    booking_date,
    slot,
    referred_by_mobile
  )
  values (
    trim(p_name),
    v_customer_phone,
    trim(p_category),
    p_booking_date,
    trim(p_slot),
    v_referrer_phone
  )
  returning id into v_booking_id;

  insert into public.referrals (
    v_booking_id,
    customer_name,
    referred_phone,
    referrer_phone,
    service_requested,
    booking_date,
    slot,
    status
  )
  values (
    booking_id,
    trim(p_name),
    v_customer_phone,
    v_referrer_phone,
    trim(p_category),
    p_booking_date,
    trim(p_slot),
    'Pending'
  )
  returning id into v_referral_id;

  return jsonb_build_object(
    'booking_id', v_booking_id,
    'referral_id', v_referral_id,
    'referral_status', 'Pending'
  );
exception
  when unique_violation then
    raise exception 'This customer has already been referred previously.';
end;
$$;

create or replace function public.update_referral_status(
  p_referral_id bigint,
  p_status text
)
returns public.referrals
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_referral public.referrals;
begin
  if p_status not in ('Pending','Completed') then
    raise exception 'Invalid referral status.';
  end if;

  update public.referrals
  set
    status = p_status,
    updated_at = now(),
    completed_at = case when p_status = 'Completed' then now() else null end
  where id = p_referral_id
  returning * into updated_referral;

  if updated_referral.id is null then
    raise exception 'Referral not found.';
  end if;

  return updated_referral;
end;
$$;

grant execute on function public.create_booking_with_referral(
  text,
  text,
  text,
  date,
  text,
  text
) to public;

grant execute on function public.update_referral_status(
  bigint,
  text
) to public;
