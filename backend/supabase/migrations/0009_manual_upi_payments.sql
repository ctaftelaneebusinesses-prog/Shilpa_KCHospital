-- Manual UPI QR payments: a patient can pay by scanning the clinic's own
-- UPI QR (no payment gateway, no fee) and submitting the UPI transaction
-- reference themselves. An admin then manually verifies it against the
-- bank/UPI statement and confirms the appointment from Payment History.

-- razorpay_order_id no longer applies to a manual_upi payment row.
alter table payments alter column razorpay_order_id drop not null;

alter table payments
  add column if not exists payment_method text not null default 'razorpay'
    check (payment_method in ('razorpay', 'manual_upi'));

alter table payments add column if not exists upi_reference text;

-- Drop whatever the status check constraint happens to be named (it was
-- auto-named by Postgres back in migration 0001) and replace it, rather than
-- guessing the exact name.
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'payments'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%status%'
  loop
    execute format('alter table payments drop constraint %I', con.conname);
  end loop;
end $$;

alter table payments add constraint payments_status_check
  check (status in ('pending', 'pending_verification', 'successful', 'failed', 'refunded'));
