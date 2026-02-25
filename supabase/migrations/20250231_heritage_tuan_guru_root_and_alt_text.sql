-- =============================================================================
-- Golden Thread: Tuan Guru as Root (Level 0), alt-text "great-grandfather Tuan Guru",
-- and Imam Talaboedien anchor post updated to state great-grandson of Tuan Guru.
-- Run after 20250230.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Alt-text: "descendant of the Taliep and Rakiep lineage and of the great-grandfather Tuan Guru"
-- -----------------------------------------------------------------------------
create or replace function public.heritage_majlis_set_seo_alt_text()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  loc_suffix text;
begin
  if (tg_op = 'INSERT' and new.is_approved = true and (new.seo_alt_text is null or new.seo_alt_text = ''))
     or (tg_op = 'UPDATE' and old.is_approved = false and new.is_approved = true and (new.seo_alt_text is null or new.seo_alt_text = ''))
  then
    loc_suffix := public.heritage_majlis_seo_location_suffix(new.resting_place, new.story_text);
    new.seo_alt_text := 'Historical photo of ' || trim(coalesce(new.ancestor_name, 'our ancestor'))
      || loc_suffix
      || ', a descendant of the Taliep and Rakiep lineage and of the great-grandfather Tuan Guru. Shared via the Al-Ameen Heritage Archive.';
  end if;
  return new;
end;
$$;

-- Re-backfill all approved rows with new wording
update public.heritage_majlis
set seo_alt_text = 'Historical photo of ' || trim(coalesce(ancestor_name, 'our ancestor'))
  || public.heritage_majlis_seo_location_suffix(resting_place, story_text)
  || ', a descendant of the Taliep and Rakiep lineage and of the great-grandfather Tuan Guru. Shared via the Al-Ameen Heritage Archive.'
where is_approved = true;

-- -----------------------------------------------------------------------------
-- 2. Family Tree Level Zero: Tuan Guru at top, then Son, Grandson, then Imam Talaboedien
-- -----------------------------------------------------------------------------
-- Insert Tuan Guru (Level 0) if not present
insert into public.heritage_majlis (
  contributor_name,
  ancestor_name,
  story_text,
  lineage_branch,
  is_approved,
  is_verified,
  parent_id,
  consent_photo_shared
)
select
  'Al-Ameen Caps',
  'Tuan Guru',
  'Father of Islam at the Cape (Imam Abdullah ibn Qadi Abdus Salaam). Founding scholar of the Auwal Masjid; spiritual ancestor of the Taliep and Rakiep lineages. Great-grandfather of Imam Talaboedien.',
  null,
  true,
  true,
  null,
  false
where not exists (select 1 from public.heritage_majlis where ancestor_name = 'Tuan Guru' limit 1);

-- Insert "Son of Tuan Guru" (Level 1) if not present
insert into public.heritage_majlis (
  contributor_name,
  ancestor_name,
  story_text,
  lineage_branch,
  is_approved,
  is_verified,
  parent_id,
  consent_photo_shared
)
select
  'Al-Ameen Caps',
  'Son of Tuan Guru',
  'Descendant of Tuan Guru; link in the chain to Imam Talaboedien and the Taliep heritage.',
  null,
  true,
  true,
  (select id from public.heritage_majlis where ancestor_name = 'Tuan Guru' limit 1),
  false
where not exists (select 1 from public.heritage_majlis where ancestor_name = 'Son of Tuan Guru' limit 1);

-- Insert "Grandson of Tuan Guru" (Level 2) if not present
insert into public.heritage_majlis (
  contributor_name,
  ancestor_name,
  story_text,
  lineage_branch,
  is_approved,
  is_verified,
  parent_id,
  consent_photo_shared
)
select
  'Al-Ameen Caps',
  'Grandson of Tuan Guru',
  'Descendant of Tuan Guru; father of Imam Talaboedien, Patriarch of District Six.',
  null,
  true,
  true,
  (select id from public.heritage_majlis where ancestor_name = 'Son of Tuan Guru' limit 1),
  false
where not exists (select 1 from public.heritage_majlis where ancestor_name = 'Grandson of Tuan Guru' limit 1);

-- Link Imam Talaboedien to Grandson of Tuan Guru (Level 3) and update his story for the anchor post
update public.heritage_majlis
set
  parent_id = (select id from public.heritage_majlis where ancestor_name = 'Grandson of Tuan Guru' limit 1),
  story_text = 'Patriarch of District Six with more than 80 grandchildren; great-grandson of Tuan Guru, the father of Islam in the Cape. His legacy reaches through the Taliep family and the preservation of Cape Malay heritage from District Six to Bridgetown.'
where ancestor_name = 'Imam Talaboedien';

-- Backfill seo_alt_text for any new seed rows (Tuan Guru, Son, Grandson) just inserted
update public.heritage_majlis
set seo_alt_text = 'Historical photo of ' || trim(coalesce(ancestor_name, 'our ancestor'))
  || public.heritage_majlis_seo_location_suffix(resting_place, story_text)
  || ', a descendant of the Taliep and Rakiep lineage and of the great-grandfather Tuan Guru. Shared via the Al-Ameen Heritage Archive.'
where is_approved = true and (seo_alt_text is null or seo_alt_text = '');
