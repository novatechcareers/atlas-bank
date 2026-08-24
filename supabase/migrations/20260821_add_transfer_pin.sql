alter table public.customers
  add column if not exists transfer_pin text;

alter table public.customers
  drop constraint if exists customers_transfer_pin_format;

alter table public.customers
  add constraint customers_transfer_pin_format
  check (transfer_pin is null or transfer_pin ~ '^[0-9]{4}$');