create table invitations(
    id uuid primary key default gen_random_uuid(),
    wallet_id uuid unique references wallets(id) on delete cascade,
    partner_name text_1_to_50 not null,
    partner_email text_1_to_50 not null
);

alter table public.invitations enable row level security;

create function public.is_wallet_owner(p_wallet_id uuid)
returns boolean
language sql
stable
set search_path = ''
as
$$
select exists(
    select 1
    from public.wallets w
    where w.id = p_wallet_id and
          w.owner_id = auth.uid()
);
$$;

create policy "owners can see their invitations"
on public.invitations
for select
to authenticated
using (public.is_wallet_owner(wallet_id));


create policy "owners can create invitations"
on public.invitations
for insert
to authenticated 
with check (public.is_wallet_owner(wallet_id));


revoke insert on public.invitations from authenticated;
grant insert(wallet_id, partner_name, partner_email) on public.invitations to authenticated;

create policy "owner can delete an invitation"
on public.invitations
for delete
to authenticated
using (public.is_wallet_owner(wallet_id));

create policy "owner can update his invitation"
on public.invitations
for update
to authenticated
using (public.is_wallet_owner(wallet_id));

revoke update on public.invitations from authenticated;

-- grant(wallet_id) enables upserting a row. The update RLS still protects the column
grant update (wallet_id, partner_name, partner_email) on public.invitations to authenticated;
/*

*/