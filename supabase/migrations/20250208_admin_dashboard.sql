-- =============================================================================
-- Admin Dashboard: is_admin, Storage bucket, RLS for admins
-- Run this in Supabase SQL Editor, then set your profile is_admin = true in Table Editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add is_admin to profiles
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- -----------------------------------------------------------------------------
-- 2. Optional: add image_url to products, created_at to orders (for admin UI)
-- -----------------------------------------------------------------------------
alter table public.products
  add column if not exists image_url text;

alter table public.orders
  add column if not exists created_at timestamptz default now();
update public.orders set created_at = now() where created_at is null;

-- -----------------------------------------------------------------------------
-- 3. Storage bucket "products" (for product images)
-- Create via Dashboard if preferred: Storage → New bucket → name: products, Public: yes
-- -----------------------------------------------------------------------------
-- Create bucket (minimal columns for compatibility). If this fails, create bucket in Dashboard: Storage → New bucket → name: products, Public: yes
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- Storage: allow public read for product images
drop policy if exists "Public read products bucket" on storage.objects;
create policy "Public read products bucket"
  on storage.objects for select
  using (bucket_id = 'products');

-- Storage: admins can upload/update/delete in products bucket
drop policy if exists "Admins upload products" on storage.objects;
create policy "Admins upload products"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'products'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins update products storage" on storage.objects;
create policy "Admins update products storage"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'products'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins delete products storage" on storage.objects;
create policy "Admins delete products storage"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'products'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- -----------------------------------------------------------------------------
-- 4. Helper: admin check (used in RLS)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- -----------------------------------------------------------------------------
-- 5. RLS: Admins can SELECT, UPDATE, DELETE all rows on orders
-- -----------------------------------------------------------------------------
create policy "Admins can view all orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all orders"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. RLS: Admins can SELECT, UPDATE, DELETE all rows on order_items
-- -----------------------------------------------------------------------------
create policy "Admins can view all order items"
  on public.order_items for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all order items"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all order items"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. RLS: Admins can SELECT, UPDATE, DELETE all rows on profiles
-- -----------------------------------------------------------------------------
create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all profiles"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 8. RLS: Admins can INSERT, UPDATE, DELETE on products (others keep select only)
-- -----------------------------------------------------------------------------
create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());
