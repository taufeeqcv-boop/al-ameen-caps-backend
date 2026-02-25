-- =============================================================================
-- Golden Thread hierarchy correction: Level 1 = Abdurauf, Level 4 = Child of Imam,
-- Asia at Level 5. Alt-text refined to "descendant of the Tuan Guru lineage."
-- Run after 20250231.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Rename "Son of Tuan Guru" to Abdurauf (Level 1 - The Bridge)
-- -----------------------------------------------------------------------------
update public.heritage_majlis
set
  ancestor_name = 'Abdurauf',
  relation = 'Son of Tuan Guru (The Bridge)',
  story_text = 'Abdurauf, son of Tuan Guru. The bridge between the father of Islam at the Cape and the Patriarch of District Six.'
where ancestor_name = 'Son of Tuan Guru';

-- Grandson of Tuan Guru's parent_id points to the same row (now Abdurauf); no change needed.

-- -----------------------------------------------------------------------------
-- 2. Insert Level 4: Child of Imam Talaboedien (The Missing Link) — parent of Asia Taliep
-- -----------------------------------------------------------------------------
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
  'Child of Imam Talaboedien',
  'Child of Imam Talaboedien (Patriarch of District Six); parent of Asia Taliep (Oemie). The missing link in the Golden Thread from Tuan Guru to the Founder''s grandmother.',
  'Taliep',
  true,
  true,
  (select id from public.heritage_majlis where ancestor_name = 'Imam Talaboedien' limit 1),
  false
where not exists (select 1 from public.heritage_majlis where ancestor_name = 'Child of Imam Talaboedien' limit 1);

-- -----------------------------------------------------------------------------
-- 3. Asia Taliep (Oemie) now Level 5: parent_id = Child of Imam Talaboedien
-- -----------------------------------------------------------------------------
update public.heritage_majlis
set parent_id = (select id from public.heritage_majlis where ancestor_name = 'Child of Imam Talaboedien' limit 1)
where ancestor_name = 'Asia Taliep (Oemie)'
  and exists (select 1 from public.heritage_majlis where ancestor_name = 'Child of Imam Talaboedien' limit 1);

-- -----------------------------------------------------------------------------
-- 4. Alt-text: "a descendant of the Tuan Guru lineage" (generational clarity)
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
      || ', a descendant of the Tuan Guru lineage. Shared via the Al-Ameen Heritage Archive.';
  end if;
  return new;
end;
$$;

-- Re-backfill all approved rows with new alt-text wording
update public.heritage_majlis
set seo_alt_text = 'Historical photo of ' || trim(coalesce(ancestor_name, 'our ancestor'))
  || public.heritage_majlis_seo_location_suffix(resting_place, story_text)
  || ', a descendant of the Tuan Guru lineage. Shared via the Al-Ameen Heritage Archive.'
where is_approved = true;
