-- Add review_requested boolean column to orders table
-- This prevents sending duplicate review request emails for the same order
-- Used by scheduled-review-request Netlify function

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS review_requested boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.orders.review_requested IS 'Set to true when review request email has been sent via scheduled automation. Prevents duplicate emails.';

-- Add updated_at column if it doesn't exist (for scheduled review request queries)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create trigger to auto-update updated_at on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_orders_review_requested ON public.orders(review_requested) WHERE review_requested = false;
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON public.orders(updated_at);
