-- Delivery / patient records, entered by the admin from the "Patient
-- Details" page. Independent of appointments: a record describes a mother,
-- her delivery and the baby, whether or not she ever booked online.
-- Allowed values for delivery_type, gender and blood groups are enforced
-- in the backend (admin.py) rather than as CHECK constraints, so a new
-- option can be added without another migration.

create table if not exists patient_records (
  id uuid primary key default gen_random_uuid(),

  mother_name text not null,
  mother_age integer not null check (mother_age between 10 and 70),
  mother_occupation text not null,
  mother_blood_group text not null,
  father_name text not null,
  father_occupation text not null,
  contact_phone text not null,
  alternate_phone text,

  address text not null,
  district text not null,
  state text not null,
  pincode text,

  delivery_date date not null,
  delivery_type text not null,
  gestational_age_weeks integer check (gestational_age_weeks between 20 and 45),

  baby_birth_date date not null,
  baby_birth_time time,
  baby_gender text not null,
  baby_weight_kg numeric(4, 2) not null check (baby_weight_kg > 0 and baby_weight_kg < 10),
  baby_blood_group text not null,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Soft delete, same as appointments - a misclick never loses a record.
  deleted_at timestamptz
);

create index if not exists patient_records_delivery_date_idx on patient_records (delivery_date desc);
create index if not exists patient_records_deleted_at_idx on patient_records (deleted_at);

create or replace function patient_records_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patient_records_touch_updated_at on patient_records;
create trigger patient_records_touch_updated_at
  before update on patient_records
  for each row execute function patient_records_touch_updated_at();

-- Only the backend's service-role key reads/writes this table.
alter table patient_records enable row level security;
