create table public.transactions(
    id uuid primary key default gen_random_uuid(),
    wallet_id uuid not null references public.wallets(id) on delete cascade,
    occurred_on date not null,
    description text not null check(
        length(trim(description)) between 1
        and 100
    ),
    category_id uuid not null,
    amount_minor bigint not null check(amount_minor > 0),
    created_by uuid references public.profiles(id) on delete set null default auth.uid(),
    created_at timestamptz not null default now(),
    foreign key (wallet_id, category_id) references public.categories(wallet_id, id) on delete restrict
);

alter table public.transactions enable row level security;

create policy "Wallet members can add transactions to their wallet"
on public.transactions
for insert
to authenticated
with check(
    public.is_wallet_member(wallet_id)
    and created_by = (select auth.uid())
);

revoke insert on public.transactions from authenticated;
grant insert (wallet_id, occurred_on, description, category_id, amount_minor, created_by)
on public.transactions to authenticated;

create policy "Wallet members can read transactions from their wallet"
on public.transactions
for select
to authenticated
using (public.is_wallet_member(wallet_id));

create policy "Wallet members can delete transactions from their wallet"
on public.transactions
for delete
to authenticated
using (public.is_wallet_member(wallet_id));

create policy "Wallet members can update transactions in their wallet"
on public.transactions
for update
to authenticated
using (public.is_wallet_member(wallet_id));

revoke update on public.transactions from authenticated;
grant update (occurred_on, description, category_id, amount_minor) on public.transactions to authenticated;
