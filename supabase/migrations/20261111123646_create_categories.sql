create domain transaction_type as text check (
    value = 'income'
    or value = 'expense'
);

create table public.categories(
    id uuid primary key default gen_random_uuid(),
    wallet_id uuid not null references public.wallets(id) on delete cascade,
    name text_1_to_50 not null,
    type transaction_type not null,
    unique(wallet_id, id)
);

alter table public.categories enable row level security;

create policy "Only wallet members can create categories"
on public.categories
for insert
to authenticated
with check (public.is_wallet_member(wallet_id));

create policy "Wallet members can see only their own categories"
on public.categories
for select
to authenticated
using (public.is_wallet_member(wallet_id));

create policy "Wallet member can delete their categories"
on public.categories
for delete
to authenticated
using (public.is_wallet_member(wallet_id));

create policy "Wallet members can update their categories"
on public.categories
for update
to authenticated
using (public.is_wallet_member(wallet_id));

create unique index categories_name_unique on public.categories (wallet_id, trim(lower(name)), type);
