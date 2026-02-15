-- =============================================================================
-- Product Variants: table + initial products and variants
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- 1. Add category to products if not exists
alter table public.products
  add column if not exists category text;

-- 2. Create product_variants table
create table if not exists public.product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  sku text not null unique,
  size text,
  color text,
  stock_quantity integer default 0,
  price decimal(10, 2),
  created_at timestamptz default now()
);

-- RLS for product_variants: same as products (everyone read, admins write)
alter table public.product_variants enable row level security;

create policy "Product variants are viewable by everyone"
  on public.product_variants for select
  using (true);

create policy "Admins can insert product variants"
  on public.product_variants for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update product variants"
  on public.product_variants for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete product variants"
  on public.product_variants for delete
  to authenticated
  using (public.is_admin());

-- 3. Insert or update products (base entries)
-- Uses ON CONFLICT (sku) so re-running is safe
insert into public.products (sku, name, description, price, stock_quantity, category, image_url) values
  ('NALAIN', 'Na''lain Cap Premium', 'Premium stiffened cap with blessed Sandal embroidery.', 145.00, 0, 'Caps', '/collection/nalain-cap.png'),
  ('AFGANI', 'Afgani Star Cap', 'Premium quality Afgani style cap.', 135.00, 0, 'Caps', '/collection/afgani-star-cap.png'),
  ('ALHASSAN', 'Al Hassan Perfume', 'Alcohol-free premium attar.', 135.00, 0, 'Perfumes', '/collection/al-hassan-perfume.png'),
  ('AZHARI', 'Azhari Hard Cap', 'Traditional Azhari style hard cap. Pre-order only — reserve yours.', 600.00, 0, 'Caps', '/collection/azhari-hard-cap.png'),
  ('FEZ', 'Royal Ottoman Fez', 'Authentic Ottoman style Fez.', 550.00, 0, 'Caps', '/collection/royal-ottoman-fez.png'),
  ('NAQSHBANDI', 'Naqshbandi Taj', 'Distinctive Naqshbandi Sufi Taj.', 990.00, 0, 'Caps', '/collection/naqshbandi-taj.png'),
  ('SAQIB', 'Saqib Shami Cap', 'Premium Saqib Shami style cap.', 660.00, 0, 'Caps', '/collection/saqib-shami-cap.png'),
  ('ASHRAFI', 'Special Ashrafi Taj', 'Exclusive Ashrafi Taj.', 1600.00, 0, 'Caps', '/collection/special-ashrafi-taj.png'),
  ('RUMAL', 'Luxury Arabic Rumal', 'High-quality Arabic Rumal.', 250.00, 0, 'Accessories', '/collection/luxury-arabic-rumal.png'),
  ('EMERALD-SULTAN', 'Emerald Sultan Crown', 'A symbol of dignity and refined tradition. Deep emerald-green velvet top with elegant white radial stitching and classic central button. Crisp white structured base. Perfect for Jumu''ah, Eid, and formal occasions.', 1200.00, 1, 'Caps', '/collection/emerald-sultan-crown.png'),
  ('TURKISH-NAQSHBANDI', 'Turkish Naqshbandi Taj', 'Meticulously wrapped with precision-folded layers. Available in deep black, pure white, and rich emerald green. Ideal for Jumu''ah, Eid, nikah, dhikr, and formal spiritual occasions.', 950.00, 6, 'Taj', '/collection/turkish-naqshbandi-taj.png')
on conflict (sku) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  image_url = excluded.image_url;

-- 4. Insert variants (example: Na'lain Cap sizes/colors, Al Hassan Perfume size)
do $$
declare
  p_id bigint;
begin
  -- Na'lain Cap Variants
  select id into p_id from public.products where sku = 'NALAIN';
  if p_id is not null then
    insert into public.product_variants (product_id, sku, size, color, stock_quantity) values
      (p_id, 'NAL-BLK-56', '56cm', 'Black', 5),
      (p_id, 'NAL-BLK-57', '57cm', 'Black', 5),
      (p_id, 'NAL-BLK-58', '58cm', 'Black', 5),
      (p_id, 'NAL-WHT-56', '56cm', 'White', 5),
      (p_id, 'NAL-WHT-57', '57cm', 'White', 5),
      (p_id, 'NAL-GRN-56', '56cm', 'Green', 5)
    on conflict (sku) do nothing;
  end if;

  -- Al Hassan Perfume Variants
  select id into p_id from public.products where sku = 'ALHASSAN';
  if p_id is not null then
    insert into public.product_variants (product_id, sku, size, color, stock_quantity) values
      (p_id, 'PERF-AH-12ML', '12ml', null, 12)
    on conflict (sku) do nothing;
  end if;

  -- Turkish Naqshbandi Taj color variants
  select id into p_id from public.products where sku = 'TURKISH-NAQSHBANDI';
  if p_id is not null then
    insert into public.product_variants (product_id, sku, size, color, stock_quantity) values
      (p_id, 'TNT-BLK', null, 'Black', 2),
      (p_id, 'TNT-WHT', null, 'White', 2),
      (p_id, 'TNT-GRN', null, 'Emerald Green', 2)
    on conflict (sku) do nothing;
  end if;
end $$;
