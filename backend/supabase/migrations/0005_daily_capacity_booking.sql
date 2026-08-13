-- Switches booking from fixed time slots to a per-day capacity cap. Dr.
-- Shilpa can't commit to specific appointment times (she's frequently pulled
-- into emergencies), so patients now only pick a date; the clinic can see up
-- to DAILY_CAPACITY (10, kept in sync with backend/slots.py) patients a day,
-- in the order they arrive.

-- appointment_time is no longer collected from patients. The column is kept
-- (nullable) so historical rows and any manual admin-assigned time survive.
alter table appointments alter column appointment_time drop not null;

-- The old unique index enforced "one booking per date+time". That concept no
-- longer exists - capacity is enforced per-date instead, inside
-- book_appointment() below.
drop index if exists one_active_appointment_per_slot;

-- Atomically checks the day's capacity and inserts the appointment in one
-- transaction, using an advisory lock keyed on the date so two concurrent
-- bookings can never both slip in as the 11th patient for the same day.
create or replace function book_appointment(
  p_name text,
  p_phone text,
  p_email text,
  p_date date,
  p_reason text,
  p_language text,
  p_status text,
  p_hold_expires_at timestamptz,
  p_capacity int
) returns appointments
language plpgsql
as $$
declare
  v_active_count int;
  v_row appointments;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text));

  select count(*) into v_active_count
  from appointments
  where appointment_date = p_date
    and status in ('payment_pending', 'confirmed', 'completed')
    and deleted_at is null;

  if v_active_count >= p_capacity then
    raise exception 'DATE_FULL' using errcode = 'P0001';
  end if;

  insert into appointments (
    patient_name, patient_phone, patient_email, appointment_date,
    reason, language, status, hold_expires_at
  ) values (
    p_name, p_phone, p_email, p_date, p_reason, p_language, p_status, p_hold_expires_at
  )
  returning * into v_row;

  return v_row;
end;
$$;
