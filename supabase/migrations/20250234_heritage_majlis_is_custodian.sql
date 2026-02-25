-- =============================================================================
-- Digital Majlis: "Custodian of the Thread" badge.
-- When true, contributor is honored for providing verified links to the Tuan Guru lineage
-- (e.g. the first to verify the Level 4 / Discovery Branch name).
-- Run after 20250233.
-- =============================================================================

alter table public.heritage_majlis
  add column if not exists is_custodian boolean not null default false;

comment on column public.heritage_majlis.is_custodian is 'Custodian of the Thread: contributor has provided verified links to the Tuan Guru lineage. Display badge on Majlis Wall; award via admin toggle.';

create index if not exists idx_heritage_majlis_is_custodian on public.heritage_majlis(is_custodian) where is_custodian = true;
