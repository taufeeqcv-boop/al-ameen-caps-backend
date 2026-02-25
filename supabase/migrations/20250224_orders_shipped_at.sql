-- Add shipped_at so we can send review requests exactly 3 days after ship date.
-- send-shipping-notification sets this when marking order SHIPPED.
alter table public.orders
  add column if not exists shipped_at timestamptz;
comment on column public.orders.shipped_at is 'When order was marked SHIPPED (used for 3-day-delay review request automation)';
