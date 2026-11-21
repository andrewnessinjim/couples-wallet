/*
 profiles - id, name
 invitations - id (same as the invitation code), wallet_id, partner_name, partner_email
 
 - **Auth**: register, login, logout.
 - **Onboarding**:
 create a wallet - entry in wallet, profile and invitation
 
 accept invitation - registration or login carries the code over partner email and partner name are part of the invitation, stored in invitations. Create a profile and link to wallets table.
 */

create table public.wallets (
    id uuid primary key default gen_random_uuid(),
    name text_1_to_50 not null,
    owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
    partner_id uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at
  before update on public.wallets
  for each row
  execute procedure extensions.moddatetime (updated_at);

alter table public.wallets enable row level security;

create function public.is_wallet_member(p_wallet_id uuid)
returns boolean
language sql
stable
set search_path = ''
as
$$
select exists (
    select 1
    from public.wallets w
    where w.id = p_wallet_id
          and (w.owner_id=auth.uid() or w.partner_id=auth.uid())
)
$$;

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

create policy "Users can read their names and their partner names"
on public.profiles
for select
to authenticated
using (
    profiles.id = (select auth.uid())
    or exists (
        select 1
        from public.wallets w
        where
          (
            w.owner_id = (select auth.uid())
            and profiles.id = w.partner_id 
          )
          or
          (
            w.partner_id = (select auth.uid())
            and w.owner_id = profiles.id 
          )
    )
);

