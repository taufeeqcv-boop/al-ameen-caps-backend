-- =============================================================================
-- Digital Majlis: heritage_majlis (family stories) + comments. Realtime for wall.
-- Run in Supabase SQL Editor. Create storage bucket "heritage-majlis" if not exists (public read, anon insert).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. heritage_majlis table
-- -----------------------------------------------------------------------------
create table if not exists public.heritage_majlis (
  id uuid primary key default gen_random_uuid(),
  contributor_name text not null,
  ancestor_name text not null,
  approximate_dates text,
  relation text,
  story_text text not null,
  image_url text,
  lineage_branch text,
  is_approved boolean not null default false,
  is_verified boolean not null default false,
  consent_photo_shared boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.heritage_majlis is 'Digital Majlis: family lineage stories and photos. Only is_approved = true shown on wall.';
create index if not exists idx_heritage_majlis_approved_created on public.heritage_majlis(is_approved, created_at desc);

-- RLS
alter table public.heritage_majlis enable row level security;

-- Public can read only approved posts (for the wall)
create policy "Public can read approved majlis"
  on public.heritage_majlis for select
  using (is_approved = true);

-- Anyone can submit (anon or authenticated)
create policy "Anyone can insert majlis"
  on public.heritage_majlis for insert
  with check (true);

-- Admins can read all and update (approve, verify)
create policy "Admins can read all majlis"
  on public.heritage_majlis for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update majlis"
  on public.heritage_majlis for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. heritage_majlis_comments (Share a Memory)
-- -----------------------------------------------------------------------------
create table if not exists public.heritage_majlis_comments (
  id uuid primary key default gen_random_uuid(),
  majlis_id uuid not null references public.heritage_majlis(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

comment on table public.heritage_majlis_comments is 'Replies / Share a Memory on Digital Majlis posts.';
create index if not exists idx_majlis_comments_majlis_id on public.heritage_majlis_comments(majlis_id);

alter table public.heritage_majlis_comments enable row level security;

-- Public can read comments for approved majlis posts only
create policy "Public can read comments for approved majlis"
  on public.heritage_majlis_comments for select
  using (
    exists (
      select 1 from public.heritage_majlis m
      where m.id = majlis_id and m.is_approved = true
    )
  );

-- Anyone can insert a comment (anon or authenticated)
create policy "Anyone can insert majlis comment"
  on public.heritage_majlis_comments for insert
  with check (true);

-- -----------------------------------------------------------------------------
-- 3. Realtime: enable for heritage_majlis so wall updates when post is approved
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.heritage_majlis;

-- -----------------------------------------------------------------------------
-- 4. Storage bucket "heritage-majlis" (historical photo uploads)
-- Create in Dashboard if insert fails: Storage → New bucket → name: heritage-majlis, Public: yes
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('heritage-majlis', 'heritage-majlis', true)
on conflict (id) do update set public = true;

-- Public read for displaying images on the wall
drop policy if exists "Public read heritage-majlis bucket" on storage.objects;
create policy "Public read heritage-majlis bucket"
  on storage.objects for select
  using (bucket_id = 'heritage-majlis');

-- Allow anyone (anon) to upload so form submissions work without login
drop policy if exists "Anyone can upload heritage-majlis" on storage.objects;
create policy "Anyone can upload heritage-majlis"
  on storage.objects for insert
  with check (bucket_id = 'heritage-majlis');

-- Admin: In Supabase Table Editor → heritage_majlis, set is_approved = true to show on wall; set is_verified = true for "Verified" badge. Realtime will push updates to all viewers.
