-- =============================================================================
-- Tana Baru Spotlight: use .png image (white domed kramat in garden).
-- Run after 20250245. Updates image_url from .jpg to .png.
-- =============================================================================

UPDATE public.heritage_majlis
SET image_url = '/images/heritage/tana-baru-spotlight.png'
WHERE is_admin_post = true
  AND ancestor_name LIKE '%Tana Baru%';
