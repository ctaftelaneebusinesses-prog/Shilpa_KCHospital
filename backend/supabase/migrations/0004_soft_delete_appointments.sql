-- Soft-delete support for appointments. The admin "Delete" action archives
-- a resolved (completed/cancelled/no_show) appointment out of the normal
-- lists/counts instead of hard-deleting it, so payment/revenue history is
-- never lost. The row stays in the table; only deleted_at gets set.

alter table appointments add column if not exists deleted_at timestamptz;

create index if not exists appointments_deleted_at_idx on appointments (deleted_at);
