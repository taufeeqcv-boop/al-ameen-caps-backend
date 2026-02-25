-- =============================================================================
-- Final Golden Thread Verification: Sovereign Root and six-generation bridge.
-- Run after 20250237. Resolves lineage names and establishes parent-child integrity.
-- =============================================================================

-- Step 1: Establish the Sovereign Root (Level 0)
UPDATE public.heritage_majlis
SET ancestor_name = 'Imam Abdullah Kadi Abdus Salaam (Tuan Guru)',
    story_text = 'The "Master Teacher" and Prince of Tidore. Descendant of Sultan Saifuddin of Tidore and Sunan Gunung Jati. He established the Auwal Masjid and authored foundational manuscripts while imprisoned on Robben Island. Buried at Tana Baru Cemetery.',
    lineage_branch = 'Tuan Guru',
    is_verified = true
WHERE ancestor_name LIKE '%Tuan Guru%' OR ancestor_name LIKE '%Matebe Shah%';

-- Step 2: Formalize Level 3 (The Patriarch of District Six)
UPDATE public.heritage_majlis
SET ancestor_name = 'Imam Mogamat Talaabodien (Ou Bappa)',
    story_text = 'Patriarch of District Six and the soul of the community. Great-grandson of Tuan Guru. His legacy spans more than 80 grandchildren across the Taliep and Rakiep lines.'
WHERE ancestor_name LIKE '%Talaabodien%' AND ancestor_name LIKE '%Ou Bappa%';

-- Step 3: Bridge the Lineage at Level 4 (The Verified Bridge)
UPDATE public.heritage_majlis
SET ancestor_name = 'Imam Achmat Talaabodien (Bappa)',
    lineage_branch = 'Taliep',
    story_text = 'The verified link between District Six and the modern family. Son of Ou Bappa and father of Asia Taliep (Oemie). He married Gadija Rakiep, granddaughter of Imam Abdul Ra''uf, uniting the two noble lines.',
    is_verified = true
WHERE ancestor_name LIKE '%Achmat%' OR ancestor_name = 'Child of Imam Talaboedien';

-- Step 4: Finalize the Oemie Anchor (Level 5)
UPDATE public.heritage_majlis
SET ancestor_name = 'Asia Taliep (Oemie)',
    story_text = 'The heart of the Al-Ameen legacy. Daughter of Imam Achmat (Bappa) and granddaughter of Imam Mogamat (Ou Bappa). Her memory is the light that guides this archive.'
WHERE ancestor_name LIKE '%Asia Taliep%';
