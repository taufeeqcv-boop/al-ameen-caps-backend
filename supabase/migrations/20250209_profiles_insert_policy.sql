-- Allow authenticated users to insert their own profile row (fixes 403 on upsert when trigger didn't run or OAuth).
-- Safe to run: drops first so it's idempotent.

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);
