-- =============================================================================
-- Heritage Majlis: parent-child tree (parent_id) + birth_year, death_year for timeline.
-- Run after 20250227_heritage_majlis_contributor_email. Seeds Imam Talaboedien and Asia Taliep (Oemie) as tree roots.
-- =============================================================================

-- Tree and timeline columns
alter table public.heritage_majlis
  add column if not exists parent_id uuid references public.heritage_majlis(id) on delete set null,
  add column if not exists birth_year smallint,
  add column if not exists death_year smallint;

comment on column public.heritage_majlis.parent_id is 'Parent in the family tree (self-reference). Null = root (e.g. Imam Talaboedien).';
comment on column public.heritage_majlis.birth_year is 'Optional birth year for tree timeline.';
comment on column public.heritage_majlis.death_year is 'Optional death year for tree timeline.';

create index if not exists idx_heritage_majlis_parent_id on public.heritage_majlis(parent_id);

-- Seed rows for tree roots and dropdown (only if not already present)
insert into public.heritage_majlis (
  contributor_name,
  ancestor_name,
  story_text,
  lineage_branch,
  is_approved,
  is_verified,
  parent_id,
  birth_year,
  death_year
)
select
  'Al-Ameen Caps',
  'Imam Talaboedien',
  'Patriarch of District Six with more than 80 grandchildren. His legacy reaches through the Taliep family and the preservation of Cape Malay heritage from District Six to Bridgetown.',
  'Taliep',
  true,
  true,
  null,
  null,
  null
where not exists (select 1 from public.heritage_majlis where ancestor_name = 'Imam Talaboedien' limit 1);

-- Asia Taliep (Oemie) — child of Imam Talaboedien (use his id as parent_id)
insert into public.heritage_majlis (
  contributor_name,
  ancestor_name,
  relation,
  story_text,
  lineage_branch,
  is_approved,
  is_verified,
  parent_id,
  birth_year,
  death_year
)
select
  'Al-Ameen Caps',
  'Asia Taliep (Oemie)',
  'Granddaughter of Imam Talaboedien (Patriarch of District Six with 80+ grandchildren)',
  'I remember the stories of District Six—the vibrancy and dignity that remained even when the landscape changed. My grandmother, Asia Taliep (Oemie), was our link to the scholarship of Tuan Guru. She was the granddaughter of the esteemed Imam Talaboedien, whose legacy reached through more than 80 grandchildren. She carried that spirit from District Six to Bridgetown.',
  'Taliep',
  true,
  true,
  (select id from public.heritage_majlis where ancestor_name = 'Imam Talaboedien' limit 1),
  null,
  null
where not exists (select 1 from public.heritage_majlis where ancestor_name = 'Asia Taliep (Oemie)' limit 1);
