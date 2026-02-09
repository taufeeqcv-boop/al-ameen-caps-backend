-- Add status to reservations and allow admins to update
alter table public.reservations
  add column if not exists status text not null default 'pending';

create index if not exists idx_reservations_status on public.reservations (status);

-- Admins can update reservations (e.g. status: pending → contacted → completed)
create policy "Admins can update all reservations"
  on public.reservations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
