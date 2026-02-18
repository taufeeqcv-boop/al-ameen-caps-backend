-- Site-wide settings (admin-editable). Keys: low_stock_threshold, store_notice.
create table if not exists public.site_settings (
  key text primary key,
  value text
);

alter table public.site_settings enable row level security;

-- Anyone can read (so storefront can show store_notice)
create policy "Site settings are readable by everyone"
  on public.site_settings for select
  using (true);

-- Only admins can insert/update/delete
create policy "Admins can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed defaults (optional)
insert into public.site_settings (key, value) values
  ('low_stock_threshold', '5'),
  ('store_notice', '')
on conflict (key) do nothing;
