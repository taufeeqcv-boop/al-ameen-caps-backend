-- =============================================================================
-- Digital Majlis: Admin Post — Tana Baru Spotlight.
-- First card on the Wall: tribute to the burial site of Tuan Guru. Sets the
-- bar for dignity and reverence for all future submissions.
-- Run after 20250234.
-- =============================================================================

alter table public.heritage_majlis
  add column if not exists is_admin_post boolean not null default false;

comment on column public.heritage_majlis.is_admin_post is 'Admin-authored spotlight (e.g. Tana Baru). Always shown first on the Wall.';

create index if not exists idx_heritage_majlis_is_admin_post on public.heritage_majlis(is_admin_post) where is_admin_post = true;

-- Seed: Tana Baru Spotlight — the very first Admin Post
insert into public.heritage_majlis (
  contributor_name,
  ancestor_name,
  relation,
  approximate_dates,
  story_text,
  lineage_branch,
  is_approved,
  is_verified,
  is_admin_post,
  image_url,
  parent_id
)
select
  'Al-Ameen Caps',
  'Tana Baru — Resting Place of Tuan Guru',
  'In Remembrance',
  'Historic Muslim cemetery, Cape Town',
  'Here lies the Master Teacher—Tuan Guru, Imam Abdullah Kadi Abdus Salaam—who brought the light of Islam to the Cape and gave dignity to the oppressed. Tana Baru, one of the oldest Muslim cemeteries in South Africa, holds his earthly remains and the legacy of the scholars who followed.

We open the Digital Majlis with this place of reverence, so every submission that follows may carry the same respect and honour for our ancestors.',
  null,
  true,
  true,
  true,
  null,
  null
where not exists (select 1 from public.heritage_majlis where is_admin_post = true limit 1);
