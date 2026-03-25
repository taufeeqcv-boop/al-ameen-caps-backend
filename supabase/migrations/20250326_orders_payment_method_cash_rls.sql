-- Payment method for orders (online vs in-person cash). Admins can insert cash orders from dashboard.

alter table public.orders
  add column if not exists payment_method text not null default 'online';

comment on column public.orders.payment_method is 'online (PayFast/Yoco) or cash (manual POS / walk-in)';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_method_check'
  ) then
    alter table public.orders
      add constraint orders_payment_method_check
      check (payment_method in ('online', 'cash'));
  end if;
end $$;

-- RLS: admins can create orders and line items (for cash logging from Admin)
drop policy if exists "Admins can insert orders" on public.orders;
create policy "Admins can insert orders"
  on public.orders for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can insert order items" on public.order_items;
create policy "Admins can insert order items"
  on public.order_items for insert
  to authenticated
  with check (public.is_admin());
