-- =============================================================================
-- Fix Reviews Table - Create/Update for Al-Ameen Caps
-- =============================================================================
-- Run this in Supabase SQL Editor to create/update the reviews table
-- This ensures the table exists with correct columns and RLS policies
-- =============================================================================

-- Step 1: Drop existing table if it exists (this will delete any existing reviews)
-- Only uncomment if you're okay with losing existing review data
-- DROP TABLE IF EXISTS public.reviews CASCADE;

-- Step 2: Create reviews table with correct structure
-- Note: order_id must be uuid to match orders.id (uuid), not bigint
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  customer_name text,
  customer_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

-- Step 3: Fix table structure if order_id is wrong type (bigint instead of uuid)
-- This handles the case where the migration created the table with bigint
DO $$
BEGIN
  -- Check if table exists and has wrong order_id type
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'reviews'
  ) AND EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'reviews' 
      AND column_name = 'order_id'
      AND data_type = 'bigint'
  ) THEN
    -- Table exists with wrong order_id type - need to recreate
    -- WARNING: This will delete existing reviews if any exist
    DROP TABLE public.reviews CASCADE;
    
    CREATE TABLE public.reviews (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
      rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_text text,
      customer_name text,
      customer_email text,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(order_id)
    );
  END IF;
END $$;

-- Add table comment
COMMENT ON TABLE public.reviews IS 'Customer reviews submitted via post-purchase review link';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;

-- Create policy to allow public SELECT access (so reviews show on the site)
CREATE POLICY "Public can read reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Note: Inserts/updates are handled via Netlify functions using service role key
-- which bypasses RLS. This is intentional for security.

-- =============================================================================
-- Verification Query (optional - run to check the table was created correctly)
-- =============================================================================
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable,
--   column_default
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name = 'reviews'
-- ORDER BY ordinal_position;
