-- Admin-managed checklist of reasons-for-visit, shown to patients as
-- checkboxes on the booking form instead of a free-text box. Dr. Shilpa can
-- add more from the admin Settings page; new ones are appended after the
-- existing list (sort_order = highest + 1). The always-last "Not listed /
-- Not sure" checkbox is not stored here - it's fixed in the frontend so it
-- can never be pushed out of last place by a newly added option.

create table if not exists reason_options (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create index if not exists reason_options_sort_idx on reason_options (sort_order);

insert into reason_options (label, sort_order) values
  ('Irregular periods', 1),
  ('Heavy / painful periods', 2),
  ('PCOS / PCOD', 3),
  ('Pregnancy care (antenatal checkup)', 4),
  ('Family planning / contraception advice', 5),
  ('Difficulty conceiving (infertility)', 6),
  ('White discharge / vaginal infection', 7),
  ('Menopause-related issues', 8),
  ('Pelvic or abdominal pain', 9),
  ('Post-delivery / postpartum concerns', 10),
  ('General checkup / routine consultation', 11)
on conflict (label) do nothing;

alter table reason_options enable row level security;
