-- =============================================================================
-- Lineage Verification Handover: Level 0 royal name + Tana Baru; Level 3/4 story.
-- Run after 20250236. Aligns with Tuan Guru Family records and Tidore Royal lineage.
-- =============================================================================

-- Step 1: Root (Level 0) — full royal name and lineage_branch
UPDATE public.heritage_majlis
SET ancestor_name = 'Imam Abdullah Kadi Abdus Salaam (Tuan Guru)',
    story_text = 'Master Teacher and Prince of Tidore. Descendant of Sultan Saifuddin. He established the first Masjid in SA and wrote the first Malay-Arabic manuscript on Robben Island. Buried at Tana Baru Cemetery.',
    lineage_branch = 'Tuan Guru'
WHERE ancestor_name IN ('Tuan Guru', 'Imam Abdurahman Matebe Shah');

-- Step 2: Level 3 — refine story to "Taliep and Rakiep lines"
UPDATE public.heritage_majlis
SET story_text = 'The Patriarch of District Six. Great-grandson of Tuan Guru. He served the community for decades and is the root of the 80+ grandchildren of the Taliep and Rakiep lines.'
WHERE ancestor_name = 'Imam Mogamat Talaabodien (Ou Bappa)';

-- Step 3: Level 4 — add Gadija Rakiep (granddaughter of Imam Abdul Ra'uf)
UPDATE public.heritage_majlis
SET story_text = 'The verified link between the Patriarch of District Six and the modern branches. He married Gadija Rakiep (granddaughter of Imam Abdul Ra''uf), uniting the Taliep and Rakiep lines. Father of Asia Taliep (Oemie).'
WHERE ancestor_name = 'Imam Achmat Talaabodien (Bappa)';

-- Step 4: Root row alt-text (row may now have new ancestor_name)
UPDATE public.heritage_majlis
SET seo_alt_text = 'Historical photo of Imam Abdullah Kadi Abdus Salaam (Tuan Guru), Prince of Tidore, father of Islam at the Cape. Buried at Tana Baru. Al-Ameen Heritage Archive.'
WHERE ancestor_name = 'Imam Abdullah Kadi Abdus Salaam (Tuan Guru)';

-- Step 5: Trigger — recognize both root names for Prince of Tidore alt-text
CREATE OR REPLACE FUNCTION public.heritage_majlis_set_seo_alt_text()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  loc_suffix text;
  is_root boolean;
BEGIN
  is_root := trim(COALESCE(new.ancestor_name, '')) IN ('Tuan Guru', 'Imam Abdullah Kadi Abdus Salaam (Tuan Guru)', 'Imam Abdurahman Matebe Shah');

  IF (tg_op = 'INSERT' AND new.is_approved = true AND (new.seo_alt_text IS NULL OR new.seo_alt_text = ''))
     OR (tg_op = 'UPDATE' AND old.is_approved = false AND new.is_approved = true AND (new.seo_alt_text IS NULL OR new.seo_alt_text = ''))
  THEN
    IF is_root THEN
      new.seo_alt_text := 'Historical photo of Imam Abdullah Kadi Abdus Salaam (Tuan Guru), Prince of Tidore, father of Islam at the Cape. Buried at Tana Baru. Al-Ameen Heritage Archive.';
    ELSE
      loc_suffix := public.heritage_majlis_seo_location_suffix(new.resting_place, new.story_text);
      new.seo_alt_text := 'Historical photo of ' || trim(COALESCE(new.ancestor_name, 'our ancestor'))
        || loc_suffix
        || ', a descendant of the Taliep and Rakiep lineage and of the great-grandfather Tuan Guru. Shared via the Al-Ameen Heritage Archive.';
    END IF;
  END IF;
  RETURN new;
END;
$$;
