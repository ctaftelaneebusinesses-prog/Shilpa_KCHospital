-- Booking, payments and admin schema for the single-doctor appointment system.
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  patient_phone text not null,
  patient_email text,
  appointment_date date not null,
  appointment_time time not null,
  reason text,
  language text default 'en',
  status text not null default 'payment_pending'
    check (status in ('payment_pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  hold_expires_at timestamptz,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only one non-cancelled row (held or confirmed) may exist per date+time.
-- This is the DB-level guarantee against double booking; because there is
-- only one doctor, the doctor id is intentionally not part of this key.
create unique index if not exists one_active_appointment_per_slot
  on appointments (appointment_date, appointment_time)
  where status in ('payment_pending', 'confirmed');

create index if not exists appointments_date_idx on appointments (appointment_date);
create index if not exists appointments_status_idx on appointments (status);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  status text not null default 'pending'
    check (status in ('pending', 'successful', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_appointment_idx on payments (appointment_id);

create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: enabled with no policies for anon/authenticated roles,
-- i.e. deny-all from the browser. All reads/writes go through the Flask
-- backend using the service_role key, which bypasses RLS. The frontend only
-- ever holds the public anon key (used solely for Supabase Auth login on the
-- admin side), so a patient's browser can never read or write any
-- appointment/payment row directly.
alter table appointments enable row level security;
alter table payments enable row level security;
alter table admin_users enable row level security;

-- keep updated_at current on every row change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();

drop trigger if exists payments_set_updated_at on payments;
create trigger payments_set_updated_at
  before update on payments
  for each row execute function set_updated_at();

-- After creating your admin login in Supabase Studio -> Authentication,
-- run this once (with that user's id) to grant admin dashboard access:
--   insert into admin_users (id, email) values ('<user-uuid>', '<email>');
