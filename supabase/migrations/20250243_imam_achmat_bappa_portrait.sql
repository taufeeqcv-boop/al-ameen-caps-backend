-- =============================================================================
-- Imam Achmat Talaabodien (Bappa) — portrait and biography.
-- Run after 20250242. Sets image and story for Level 4 (Bappa) in the Living Tree.
-- =============================================================================

UPDATE public.heritage_majlis
SET image_url = '/images/heritage/imam-achmat-talaabodien-bappa.png',
    story_text = 'Imam Taliep as he was better known lived in Bishop Lavis in 1966. He was the oldest Imam of that year and spoke seven languages fluently. He died at the age of 91 on 16 August 1966; 800 people attended his funeral at the Muir Street Mosque, conducted by Sheikh Abubakr Najaar. Son of Ou Bappa and father of Asia Taliep (Oemie). He married Gadija Rakiep, granddaughter of Imam Abdul Ra''uf, uniting the Taliep and Rakiep lines.'
WHERE ancestor_name = 'Imam Achmat Talaabodien (Bappa)';
