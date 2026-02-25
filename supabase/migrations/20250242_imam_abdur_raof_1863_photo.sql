-- =============================================================================
-- Imam Abdur-Raof (d.1864): the only known photo — with his son Imam Abdur-Rakieb
-- (Ta Tuan) at the welcome of Shaykh Abu-Bakr Effendi to Cape Town, 1863.
-- Level 1 (Abdurauf) and ancestor of the Abdurauf and Rakiep families.
-- Add the image as public/images/heritage/imam-abdur-raof-1863.png
-- Run after 20250241.
-- =============================================================================

UPDATE public.heritage_majlis
SET
  image_url = '/images/heritage/imam-abdur-raof-1863.png',
  story_text = 'Imam Abdur-Raof (d.1864), noble Prince and son of Tuan Guru. Ancestor of the Abdurauf and Rakiep families; he followed his father as Imam of the Auwal Mosque. This is most probably the only picture we have of him: standing with his son Imam Abdur-Rakieb (Ta Tuan) at the welcome of Shaykh Abu-Bakr Effendi to Cape Town in 1863, with other Imams. The bridge between the father of Islam at the Cape and the Patriarch of District Six.'
WHERE ancestor_name = 'Imam Abdurauf';
