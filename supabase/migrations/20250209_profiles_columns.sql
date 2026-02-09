-- =============================================================================
-- Profiles: add missing columns (safe to run multiple times)
-- Fixes 400 Bad Request when app upserts to public.profiles during checkout/sign-up.
-- =============================================================================

-- Standard e-commerce profile columns
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists shipping_address jsonb;
alter table public.profiles add column if not exists billing_address jsonb;

-- Columns used by frontend upsertProfile (AuthContext / sign-in)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists name_first text;
alter table public.profiles add column if not exists name_last text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists marketing_opt_in boolean default false;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Admin flag (if not already added by admin dashboard migration)
alter table public.profiles add column if not exists is_admin boolean not null default false;
