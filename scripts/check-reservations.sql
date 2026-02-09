-- Run this in Supabase Dashboard → SQL Editor (same project as SUPABASE_URL in Netlify)
-- Checks that public.reservations exists and shows row count + latest rows.

SELECT count(*) AS reservation_count FROM public.reservations;

SELECT id, created_at, customer_name, customer_email, customer_phone, total_amount, status
FROM public.reservations
ORDER BY id DESC
LIMIT 20;
