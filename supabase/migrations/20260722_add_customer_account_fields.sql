alter table public.customers
  add column if not exists account_number text,
  add column if not exists password text;

create unique index if not exists customers_account_number_key
  on public.customers (account_number)
  where account_number is not null;