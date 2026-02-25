-- =============================================================================
-- Heritage Majlis: resting place (Kramats/Qabristans) and maiden name for genealogical accuracy.
-- Elders often remember these; supports "Call to Elders" and Cape cultural markers.
-- =============================================================================

alter table public.heritage_majlis
  add column if not exists resting_place text,
  add column if not exists maiden_name text;

comment on column public.heritage_majlis.resting_place is 'Burial/resting place: e.g. Mowbray Qabristan, Tuan Guru Kramat.';
comment on column public.heritage_majlis.maiden_name is 'Maiden name for maternal line tracking.';
