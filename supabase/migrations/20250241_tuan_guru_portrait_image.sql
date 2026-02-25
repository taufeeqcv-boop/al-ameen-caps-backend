-- =============================================================================
-- Tuan Guru portrait: set image_url for the Sovereign Root so his portrait
-- appears in The Living Tree. Add the image file as public/images/heritage/tuan-guru-portrait.png
-- Run after 20250240.
-- =============================================================================

UPDATE public.heritage_majlis
SET image_url = '/images/heritage/tuan-guru-portrait.png'
WHERE ancestor_name = 'Imam Abdullah Kadi Abdus Salaam (Tuan Guru)';
