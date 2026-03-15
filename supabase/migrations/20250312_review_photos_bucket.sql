-- Create review-photos storage bucket for customer review photos
-- This enables the Heritage Gallery feature where customers can upload photos with their reviews

-- Create bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read for displaying review photos on the site
DROP POLICY IF EXISTS "Public read review-photos bucket" ON storage.objects;
CREATE POLICY "Public read review-photos bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-photos');

-- Allow anyone (anon) to upload so review submissions work without login
DROP POLICY IF EXISTS "Anyone can upload review-photos" ON storage.objects;
CREATE POLICY "Anyone can upload review-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-photos');

-- Add photo_url column to reviews table
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS photo_url text;

COMMENT ON COLUMN public.reviews.photo_url IS 'Public URL of photo uploaded with review (stored in review-photos bucket)';

-- Create index for efficient querying of reviews with photos
CREATE INDEX IF NOT EXISTS idx_reviews_photo_url ON public.reviews(photo_url) WHERE photo_url IS NOT NULL;
