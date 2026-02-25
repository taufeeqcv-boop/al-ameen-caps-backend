-- =============================================================================
-- Digital Majlis: contributor_email for "Thank You" notification when post is approved.
-- Required for new submissions (enforced in app); existing rows can be null.
-- =============================================================================

alter table public.heritage_majlis
  add column if not exists contributor_email text;

comment on column public.heritage_majlis.contributor_email is 'Email to notify when the submission is approved and added to the archive.';
