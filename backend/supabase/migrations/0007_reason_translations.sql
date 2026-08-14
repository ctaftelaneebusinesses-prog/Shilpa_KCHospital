-- Per-language labels for admin-managed reason options, auto-translated
-- from the English label when an option is added (see backend/translate.py).
-- The public booking endpoint falls back to the English label wherever a
-- translation is missing (e.g. rows added before this migration).

alter table reason_options add column if not exists label_te text;
alter table reason_options add column if not exists label_ta text;
alter table reason_options add column if not exists label_kn text;
