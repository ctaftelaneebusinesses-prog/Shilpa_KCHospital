-- Admin-editable clinic settings (currently just the consultation fee).
-- Single-row table: id is always 1. Setting consultation_fee_inr to 0 makes
-- booking free (the backend skips the payment step entirely when it is 0).

create table if not exists clinic_settings (
  id smallint primary key default 1,
  consultation_fee_inr numeric(10, 2) not null default 500,
  updated_at timestamptz not null default now(),
  constraint clinic_settings_singleton check (id = 1)
);

insert into clinic_settings (id, consultation_fee_inr)
values (1, 500)
on conflict (id) do nothing;

alter table clinic_settings enable row level security;

drop trigger if exists clinic_settings_set_updated_at on clinic_settings;
create trigger clinic_settings_set_updated_at
  before update on clinic_settings
  for each row execute function set_updated_at();
