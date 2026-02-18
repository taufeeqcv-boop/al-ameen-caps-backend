-- =============================================================================
-- Product Variants: full size/color matrix (industry-standard shelves)
-- Adapted for Al-Ameen schema: products.id is BIGINT (not UUID).
-- Prerequisite: run 20250210_product_variants.sql first (creates product_variants).
-- Run in Supabase: Dashboard → SQL Editor → paste and Run.
-- =============================================================================

-- Optional: add price_adjustment for size-based pricing later
alter table public.product_variants
  add column if not exists price_adjustment decimal(10,2) default 0.00;

-- 1. Caps: sizes 55–60cm × colors (Black, White, Dark Green, Maroon, Navy Blue, Sand)
do $$
declare
  p_rec record;
  sizes text[] := array['55cm', '56cm', '57cm', '58cm', '59cm', '60cm'];
  colors text[] := array['Black', 'White', 'Dark Green', 'Maroon', 'Navy Blue', 'Sand'];
  color_codes text[] := array['BLK', 'WHT', 'GRN', 'MAR', 'NAV', 'SAN'];
  s text; i int; c text;
  v_sku text;
begin
  for p_rec in select id, sku from public.products where category = 'Caps' loop
    for i in 1..array_length(colors, 1) loop
      c := colors[i];
      foreach s in array sizes loop
        v_sku := p_rec.sku || '-' || color_codes[i] || '-' || s;
        insert into public.product_variants (product_id, sku, size, color, stock_quantity)
        values (p_rec.id, v_sku, s, c, 0)
        on conflict (sku) do nothing;
      end loop;
    end loop;
  end loop;
end $$;

-- 2. Rumal / Turban: 3m, 5m, 7m × White, Black, Green
do $$
declare
  p_rec record;
  sizes text[] := array['3 Meters', '5 Meters', '7 Meters'];
  colors text[] := array['White', 'Black', 'Green'];
  s text; c text;
  v_sku text;
begin
  for p_rec in select id, sku from public.products
  where name ilike '%Rumal%' or name ilike '%Turban%' loop
    foreach s in array sizes loop
      foreach c in array colors loop
        v_sku := p_rec.sku || '-' || upper(substring(c, 1, 3)) || '-' || replace(s, ' ', '');
        insert into public.product_variants (product_id, sku, size, color, stock_quantity)
        values (p_rec.id, v_sku, s, c, 0)
        on conflict (sku) do nothing;
      end loop;
    end loop;
  end loop;
end $$;

-- 3. Perfumes: 3ml, 6ml, 12ml (color 'Standard')
do $$
declare
  p_rec record;
  sizes text[] := array['3ml', '6ml', '12ml'];
  s text;
  v_sku text;
begin
  for p_rec in select id, sku from public.products where category = 'Perfumes' loop
    foreach s in array sizes loop
      v_sku := p_rec.sku || '-' || s;
      insert into public.product_variants (product_id, sku, size, color, stock_quantity)
      values (p_rec.id, v_sku, s, 'Standard', 0)
      on conflict (sku) do nothing;
    end loop;
  end loop;
end $$;
