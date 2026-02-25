-- =============================================================================
-- Digital Majlis & Taliep Lineage Archive: column renames for existing DBs that
-- ran 20250225 before it used contributor_name, lineage_branch, is_verified.
-- =============================================================================

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'heritage_majlis' and column_name = 'user_name') then
    alter table public.heritage_majlis rename column user_name to contributor_name;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'heritage_majlis' and column_name = 'family_branch') then
    alter table public.heritage_majlis rename column family_branch to lineage_branch;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'heritage_majlis' and column_name = 'is_verified_lineage') then
    alter table public.heritage_majlis rename column is_verified_lineage to is_verified;
  end if;
end $$;
