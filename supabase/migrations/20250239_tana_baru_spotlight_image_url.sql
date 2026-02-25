-- =============================================================================
-- Tana Baru Spotlight: set image_url to static path so the card shows the
-- heritage image once the file is placed in public/images/heritage/.
-- Run after 20250238.
-- =============================================================================

UPDATE public.heritage_majlis
SET image_url = '/images/heritage/tana-baru-spotlight.jpg'
WHERE is_admin_post = true
  AND (image_url IS NULL OR image_url = '');
