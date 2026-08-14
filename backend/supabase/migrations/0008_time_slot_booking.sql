-- Reintroduces time-slot booking: patients pick a specific 10-minute slot
-- (10:00 AM - 3:00 PM, see backend/slots.py TIME_SLOTS) instead of just a
-- date. Capacity is now enforced per date+time (one patient per slot)
-- rather than per date (migration 0005's DAILY_CAPACITY-per-day model).

-- Guards against two concurrent requests both slipping into the same slot;
-- matches the CAPACITY_STATUSES used everywhere else (a completed visit
-- still occupied the slot, so it must block a new booking there too).
drop index if exists one_active_appointment_per_slot;
create unique index one_active_appointment_per_slot
  on appointments (appointment_date, appointment_time)
  where status in ('payment_pending', 'confirmed', 'completed');

-- The date-only signature from migration 0005 (p_capacity, no p_time) is
-- being replaced by the p_time signature below - drop it explicitly so it
-- doesn't linger as an unused overload.
drop function if exists book_appointment(text, text, text, date, text, text, text, timestamptz, int);

-- Atomically checks the slot is free and inserts the appointment in one
-- transaction, using an advisory lock keyed on date+time so two concurrent
-- bookings can never both slip into the same slot.
create or replace function book_appointment(
  p_name text,
  p_phone text,
  p_email text,
  p_date date,
  p_time time,
  p_reason text,
  p_language text,
  p_status text,
  p_hold_expires_at timestamptz
) returns appointments
language plpgsql
as $$
declare
  v_active_count int;
  v_row appointments;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text || p_time::text));

  select count(*) into v_active_count
  from appointments
  where appointment_date = p_date
    and appointment_time = p_time
    and status in ('payment_pending', 'confirmed', 'completed')
    and deleted_at is null;

  if v_active_count >= 1 then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end if;

  insert into appointments (
    patient_name, patient_phone, patient_email, appointment_date, appointment_time,
    reason, language, status, hold_expires_at
  ) values (
    p_name, p_phone, p_email, p_date, p_time, p_reason, p_language, p_status, p_hold_expires_at
  )
  returning * into v_row;

  return v_row;
end;
$$;
