create table public.wallets (
    id uuid primary key default gen_random_uuid(),
    name text not null constraint wallets_name_length check (length(trim(name)) <= 50 and length(trim(name)) >= 1),
    owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    partner_id uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at
  before update on public.wallets
  for each row
  execute procedure extensions.moddatetime (updated_at);

alter table public.wallets enable row level security;

create policy "Partners can view their wallet"
on public.wallets
for select
to authenticated
using ((select auth.uid()) = owner_id or (select auth.uid()) = partner_id);

create policy "Users can create wallets"
on public.wallets
for insert
to authenticated
with check ((select auth.uid()) = owner_id and partner_id is null);

create policy "Partners can update their wallet"
on public.wallets
for update
to authenticated
using ((select auth.uid()) = owner_id or (select auth.uid()) = partner_id);
-- No "with check": Postgres reuses the "using" condition for the after check.

create policy "Owners can delete their wallet"
on public.wallets
for delete
to authenticated
using ((select auth.uid()) = owner_id);

revoke update on public.wallets from authenticated;
grant update(name) on public.wallets to authenticated;
