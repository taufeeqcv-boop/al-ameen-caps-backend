-- Store Yoco payment id for webhook reconciliation (distinct from PayFast pf_payment_id)
alter table public.orders
  add column if not exists yoco_payment_id text;

comment on column public.orders.yoco_payment_id is 'Yoco payment object id when checkout completed via Yoco';

create unique index if not exists idx_orders_yoco_payment_id
  on public.orders (yoco_payment_id)
  where yoco_payment_id is not null;
