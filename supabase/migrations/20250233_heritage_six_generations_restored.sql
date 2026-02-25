-- =============================================================================
-- Restored Golden Thread: 6 generations with historically grounded names.
-- Level 0 Tuan Guru, 1 Imam Abdurauf, 2 Imam Rakiep, 3 Imam Talaboedien,
-- 4 The Discovery Branch, 5 Asia Taliep (Oemie). Alt-text "through five generations."
-- Run after 20250232.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Level 0: Tuan Guru — ensure historical context (Imam Abdurahman Matebe Shah)
-- -----------------------------------------------------------------------------
update public.heritage_majlis
set story_text = 'The Root: Imam Abdurahman Matebe Shah. Father of Islam at the Cape; founding scholar of the Auwal Mosque. Spiritual ancestor of the Taliep and Rakiep lineages; great-great-great-grandfather of Asia Taliep (Oemie).'
where ancestor_name = 'Tuan Guru';

-- -----------------------------------------------------------------------------
-- Level 1: Imam Abdurauf — The Son (followed his father as Imam of the Auwal Mosque)
-- -----------------------------------------------------------------------------
update public.heritage_majlis
set
  ancestor_name = 'Imam Abdurauf',
  relation = 'Son of Tuan Guru (The Bridge)',
  story_text = 'Imam Abdurauf, son of Tuan Guru. The Son: who followed his father as Imam of the Auwal Mosque. The bridge between the father of Islam at the Cape and the Patriarch of District Six.'
where ancestor_name = 'Abdurauf';

-- -----------------------------------------------------------------------------
-- Level 2: Imam Rakiep — The Grandson (19th-century Cape ulema)
-- -----------------------------------------------------------------------------
update public.heritage_majlis
set
  ancestor_name = 'Imam Rakiep',
  relation = 'Grandson of Tuan Guru (The Guardian)',
  story_text = 'Imam Rakiep, grandson of Tuan Guru. The Grandson: an influential figure in the 19th-century Cape ulema. Guardian of the lineage that led to Imam Talaboedien and the soul of District Six.'
where ancestor_name = 'Grandson of Tuan Guru';

-- Level 2 parent_id: points to Imam Abdurauf (same row as former Abdurauf). No change.

-- -----------------------------------------------------------------------------
-- Level 4: The Discovery Branch — Child of Imam Talaboedien (parent of Asia)
-- -----------------------------------------------------------------------------
update public.heritage_majlis
set
  relation = 'The Discovery Branch (Parent of Asia Taliep)',
  story_text = 'The Discovery Branch: the child of Imam Talaboedien who moved the lineage forward. Parent of Asia Taliep (Oemie). This open branch invites the family to add the name—when an elder says "That was Boeta [Name]!", we will add it with gratitude.'
where ancestor_name = 'Child of Imam Talaboedien';

-- -----------------------------------------------------------------------------
-- Alt-text: "through five generations" (span from Tuan Guru to present)
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
      || ', a descendant of Imam Talaboedien and the Tuan Guru lineage through five generations. Shared via the Al-Ameen Heritage Archive.';
  end if;
  return new;
end;
$$;

-- Re-backfill all approved rows
update public.heritage_majlis
set seo_alt_text = 'Historical photo of ' || trim(coalesce(ancestor_name, 'our ancestor'))
  || public.heritage_majlis_seo_location_suffix(resting_place, story_text)
  || ', a descendant of Imam Talaboedien and the Tuan Guru lineage through five generations. Shared via the Al-Ameen Heritage Archive.'
where is_approved = true;
