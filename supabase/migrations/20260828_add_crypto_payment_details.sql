alter table public.customers
  add column if not exists crypto_name text,
  add column if not exists crypto_address text,
  add column if not exists crypto_payment_time text;