-- One-time backfill: before this fix, expire_stale_holds() cancelled the
-- appointment on hold expiry but never updated the matching payments row,
-- so "pending" payments could outlive their appointment and drift out of
-- sync with the admin dashboard's pending-appointment count. Run this once
-- in the Supabase SQL editor to reconcile any rows left over from that bug.

update payments
set status = 'failed'
where status = 'pending'
  and appointment_id in (
    select id from appointments where status != 'payment_pending'
  );
