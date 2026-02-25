-- =============================================================================
-- Final Heritage Seed: verified lineage names and Level 4 bridge.
-- Locks the Golden Thread: Imam Mogamat Talaabodien (Ou Bappa), Imam Achmat
-- Talaabodien (Bappa), Tuan Guru metadata, and parent_id hierarchy.
-- Run after 20250235.
-- =============================================================================

-- 1. Level 3: Imam Talaboedien → Imam Mogamat Talaabodien (Ou Bappa)
UPDATE public.heritage_majlis
SET ancestor_name = 'Imam Mogamat Talaabodien (Ou Bappa)',
    story_text = 'The Patriarch of District Six. Great-grandson of Tuan Guru. He served the community for decades and is the root of the 80+ grandchildren who carried our lineage forward.'
WHERE ancestor_name = 'Imam Talaboedien';

-- 2. Level 4: Child of Imam Talaboedien / Discovery Branch → Imam Achmat Talaabodien (Bappa)
UPDATE public.heritage_majlis
SET ancestor_name = 'Imam Achmat Talaabodien (Bappa)',
    lineage_branch = 'Taliep',
    story_text = 'The verified link between the Patriarch of District Six and the modern branches. He married Gadija Rakiep, uniting the Taliep and Rakiep lines. Father of Asia Taliep (Oemie).',
    is_verified = true
WHERE ancestor_name IN ('Child of Imam Talaboedien', 'Discovery Branch');

-- 3. Set Level 4 parent: Imam Achmat (Bappa) → parent_id = Imam Mogamat (Ou Bappa)
UPDATE public.heritage_majlis
SET parent_id = (SELECT id FROM public.heritage_majlis WHERE ancestor_name = 'Imam Mogamat Talaabodien (Ou Bappa)' LIMIT 1)
WHERE ancestor_name = 'Imam Achmat Talaabodien (Bappa)';

-- 4. Set Level 5 parent: Asia Taliep (Oemie) → parent_id = Imam Achmat (Bappa)
UPDATE public.heritage_majlis
SET parent_id = (SELECT id FROM public.heritage_majlis WHERE ancestor_name = 'Imam Achmat Talaabodien (Bappa)' LIMIT 1)
WHERE ancestor_name = 'Asia Taliep (Oemie)';

-- 5. Level 0: Tuan Guru metadata (Sovereign Tidore roots)
UPDATE public.heritage_majlis
SET story_text = 'Imam Abdullah Kadi Abdus Salaam (Master Teacher). Prince of Tidore and descendant of Sultan Saifuddin. Established the first Mosque in SA and wrote the first Malay-Arabic manuscript on Robben Island. Buried at Tana Baru.'
WHERE ancestor_name = 'Tuan Guru';

-- 6. Tuan Guru SEO alt-text: include Prince of Tidore for authority
UPDATE public.heritage_majlis
SET seo_alt_text = 'Historical photo of Imam Abdullah Kadi Abdus Salaam (Tuan Guru), Prince of Tidore, father of Islam at the Cape. Buried at Tana Baru. Al-Ameen Heritage Archive.'
WHERE ancestor_name = 'Tuan Guru';

-- 7. Trigger: when ancestor is Tuan Guru, alt-text includes Prince of Tidore
CREATE OR REPLACE FUNCTION public.heritage_majlis_set_seo_alt_text()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  loc_suffix text;
BEGIN
  IF (tg_op = 'INSERT' AND new.is_approved = true AND (new.seo_alt_text IS NULL OR new.seo_alt_text = ''))
     OR (tg_op = 'UPDATE' AND old.is_approved = false AND new.is_approved = true AND (new.seo_alt_text IS NULL OR new.seo_alt_text = ''))
  THEN
    IF trim(COALESCE(new.ancestor_name, '')) = 'Tuan Guru' THEN
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
