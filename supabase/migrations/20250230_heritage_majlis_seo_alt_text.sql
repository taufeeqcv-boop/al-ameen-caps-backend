-- =============================================================================
-- Heritage Majlis: SEO alt-text column + auto-populate when post is approved.
-- Location-aware: if resting_place or story_text contains "District Six" or
-- "Bridgetown", that neighborhood is baked into the alt-text for maximum SEO.
-- Run after 20250229. Used by Majlis Wall <img alt="..."> and accessibility.
-- =============================================================================

alter table public.heritage_majlis
  add column if not exists seo_alt_text text;

comment on column public.heritage_majlis.seo_alt_text is 'Generated alt text: "Historical photo of [ancestor_name] [from District Six|from Bridgetown], a descendant of the [lineage_branch] family and the legacy of Tuan Guru. Shared via Al-Ameen Heritage Archive."';

-- Derive location phrase from resting_place and story_text (District Six preferred over Bridgetown if both appear)
create or replace function public.heritage_majlis_seo_location_suffix(resting_place text, story_text text)
returns text
language sql
immutable
as $$
  select case
    when (coalesce(resting_place, '') || ' ' || coalesce(story_text, '')) ilike '%District Six%' then ' from District Six'
    when (coalesce(resting_place, '') || ' ' || coalesce(story_text, '')) ilike '%Bridgetown%' then ' from Bridgetown'
    else ''
  end;
$$;

-- Set seo_alt_text when a post is approved (INSERT with is_approved true or UPDATE when is_approved flips to true)
create or replace function public.heritage_majlis_set_seo_alt_text()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  loc_suffix text;
begin
  if (tg_op = 'INSERT' and new.is_approved = true and (new.seo_alt_text is null or new.seo_alt_text = ''))
     or (tg_op = 'UPDATE' and old.is_approved = false and new.is_approved = true and (new.seo_alt_text is null or new.seo_alt_text = ''))
  then
    loc_suffix := public.heritage_majlis_seo_location_suffix(new.resting_place, new.story_text);
    new.seo_alt_text := 'Historical photo of ' || trim(coalesce(new.ancestor_name, 'our ancestor'))
      || loc_suffix
      || ', a descendant of the ' || trim(coalesce(new.lineage_branch, 'Taliep'))
      || ' family and the legacy of Tuan Guru. Shared via the Al-Ameen Heritage Archive.';
  end if;
  return new;
end;
$$;

drop trigger if exists heritage_majlis_seo_alt_text_trigger on public.heritage_majlis;
create trigger heritage_majlis_seo_alt_text_trigger
  before insert or update on public.heritage_majlis
  for each row
  execute function public.heritage_majlis_set_seo_alt_text();

-- Backfill all approved rows with location-aware alt-text (including rows that already had old alt-text),
-- so the very first photo (e.g. Asia Taliep, Imam) carries the same high-authority SEO weight as future uploads.
update public.heritage_majlis
set seo_alt_text = 'Historical photo of ' || trim(coalesce(ancestor_name, 'our ancestor'))
  || public.heritage_majlis_seo_location_suffix(resting_place, story_text)
  || ', a descendant of the ' || trim(coalesce(lineage_branch, 'Taliep'))
  || ' family and the legacy of Tuan Guru. Shared via the Al-Ameen Heritage Archive.'
where is_approved = true;
