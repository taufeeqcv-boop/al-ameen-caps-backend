-- Orders: customer email (snapshot at order time) and admin-only notes for ops
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists admin_notes text;
comment on column public.orders.customer_email is 'Customer email at time of order (for admin/CSV without auth lookup)';
comment on column public.orders.admin_notes is 'Internal notes for staff (packing, requests, etc.)';
