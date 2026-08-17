-- Each UPI transaction reference a patient submits must be unique across all
-- manual-UPI payments, so the same payment can never be claimed against two
-- different bookings (accidentally or otherwise).
create unique index if not exists payments_unique_manual_upi_reference
  on payments (upi_reference)
  where payment_method = 'manual_upi';
