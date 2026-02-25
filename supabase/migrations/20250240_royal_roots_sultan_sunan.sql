-- =============================================================================
-- Royal roots: Sultan Saifuddin of Tidore and Sunan Gunung Jati (Syarif Hidayatullah).
-- Inserts them above Tuan Guru in the family tree and links Tuan Guru to Sunan Gunung Jati.
-- Run after 20250239. Add images to public/images/heritage/ (see README there).
-- =============================================================================

-- 1. Insert Sultan Saifuddin of Tidore (top of royal lineage)
INSERT INTO public.heritage_majlis (
  contributor_name,
  ancestor_name,
  relation,
  approximate_dates,
  story_text,
  image_url,
  lineage_branch,
  is_approved,
  is_verified,
  parent_id,
  consent_photo_shared
)
SELECT
  'Al-Ameen Caps',
  'Sultan Saifuddin of Tidore',
  'King of Tidore',
  'Historic',
  'Sayfoedin (Saifuddin), King of Tidore. The royal lineage from which Tuan Guru (Imam Abdullah Kadi Abdus Salaam) descends. His portrait and the scholarship of Tidore anchor the Golden Thread to its sovereign roots.',
  '/images/heritage/sultan-saifuddin-tidore.png',
  'Tidore',
  true,
  true,
  null,
  false
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_majlis WHERE ancestor_name = 'Sultan Saifuddin of Tidore' LIMIT 1);

-- 2. Insert Sunan Gunung Jati (Syarif Hidayatullah) — parent = Sultan Saifuddin
INSERT INTO public.heritage_majlis (
  contributor_name,
  ancestor_name,
  relation,
  approximate_dates,
  story_text,
  image_url,
  lineage_branch,
  is_approved,
  is_verified,
  parent_id,
  consent_photo_shared
)
SELECT
  'Al-Ameen Caps',
  'Sunan Gunung Jati (Syarif Hidayatullah)',
  'Wali Songo, Cirebon',
  'Historic',
  'Sunan Gunung Jati (Syarif Hidayatullah). A key ancestor in the lineage of Tuan Guru. The practices and teachings of the Cape''s Master Teacher carry the influence of this noble line.',
  '/images/heritage/sunan-gunung-jati.png',
  'Tidore',
  true,
  true,
  (SELECT id FROM public.heritage_majlis WHERE ancestor_name = 'Sultan Saifuddin of Tidore' LIMIT 1),
  false
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_majlis WHERE ancestor_name LIKE '%Sunan Gunung Jati%' LIMIT 1);

-- 3. Link Tuan Guru (Imam Abdullah Kadi Abdus Salaam) to Sunan Gunung Jati
UPDATE public.heritage_majlis
SET parent_id = (SELECT id FROM public.heritage_majlis WHERE ancestor_name LIKE '%Sunan Gunung Jati%' LIMIT 1)
WHERE (ancestor_name LIKE '%Tuan Guru%' OR ancestor_name LIKE '%Matebe Shah%' OR ancestor_name LIKE '%Abdullah Kadi Abdus Salaam (Tuan Guru)%')
  AND parent_id IS NULL;
