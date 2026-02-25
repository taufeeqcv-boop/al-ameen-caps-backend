-- Review request: token for email link; timestamp when request was sent
alter table public.orders
  add column if not exists review_token uuid unique,
  add column if not exists review_request_sent_at timestamptz;

comment on column public.orders.review_token is 'Unique token for /review?token= link; set when review request email is sent';
comment on column public.orders.review_request_sent_at is 'When the review request email was sent';

-- Reviews: one per order (customer submits via /review?token=)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id bigint not null references public.orders(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  review_text text,
  customer_name text,
  customer_email text,
  created_at timestamptz not null default now(),
  unique(order_id)
);

comment on table public.reviews is 'Customer reviews submitted via post-purchase review link';
create index if not exists idx_reviews_order_id on public.reviews(order_id);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);

-- RLS: allow public to read reviews (for displaying on site)
alter table public.reviews enable row level security;
create policy "Public can read reviews"
  on public.reviews for select
  using (true);

-- Inserts/updates only via Netlify function (Supabase service role key bypasses RLS).
