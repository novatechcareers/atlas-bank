alter table public.customers
  add column if not exists suspended boolean not null default false,
  add column if not exists suspension_reason text,
  add column if not exists review_request text,
  add column if not exists review_requested_at timestamptz,
  add column if not exists account_details text,
  add column if not exists account_details_sent_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'customers'
  ) then
    alter publication supabase_realtime add table public.customers;
  end if;
end
$$;
