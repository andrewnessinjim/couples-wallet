begin;
create extension if not exists pgtap with schema extensions;

----------------- Test Data Setup -----------------
select tests.create_supabase_user('owner');
select tests.create_supabase_user('partner');
select tests.create_supabase_user('outsider');

select tests.insert_wallet('home', 'owner');
select tests.add_partner('home', 'partner');
select tests.insert_wallet('other', 'outsider');

select tests.insert_category('home', 'restaurant', 'Restaurant', 'expense');
select tests.insert_category('home', 'food', 'Food', 'expense');
select tests.insert_category('other', 'space_travel', 'Space Travel', 'expense');

insert into public.transactions
(
    id,
    wallet_id,
    occurred_on,
    description,
    category_id,
    amount_minor,
    created_by
) values
(
    tests.to_id('transactions', 'dinner'),
    tests.to_id('wallets', 'home'),
    '2026-11-20',
    'Dinner',
    tests.to_id('categories', 'restaurant'),
    50000,
    tests.get_supabase_uid('owner')
),
(
    tests.to_id('transactions', 'groceries'),
    tests.to_id('wallets', 'home'),
    '2026-11-21',
    'Groceries',
    tests.to_id('categories', 'food'),
    12000,
    tests.get_supabase_uid('partner')
),
(
    tests.to_id('transactions', 'rocket'),
    tests.to_id('wallets', 'other'),
    '2026-11-21',
    'Rocket fuel',
    tests.to_id('categories', 'space_travel'),
    9900000,
    tests.get_supabase_uid('outsider')
);
---------------------------------------------------

select plan(5);

select is(
    (select count(*) from public.transactions
     where wallet_id in (tests.to_id('wallets', 'home'), tests.to_id('wallets', 'other'))),
    3::bigint,
    'Guard: the test wallets have 3 transactions'
);

select tests.authenticate_as('owner');
select bag_eq(
    $$
        select description from public.transactions
        where wallet_id in (tests.to_id('wallets', 'home'), tests.to_id('wallets', 'other'))
    $$,
    $$ values ('Dinner'), ('Groceries') $$,
    'The owner sees every transaction in their wallet, including the partner''s'
);

select tests.authenticate_as('partner');
select bag_eq(
    $$
        select description from public.transactions
        where wallet_id in (tests.to_id('wallets', 'home'), tests.to_id('wallets', 'other'))
    $$,
    $$ values ('Dinner'), ('Groceries') $$,
    'The partner sees every transaction in their wallet, including the owner''s'
);

select tests.authenticate_as('outsider');
select bag_eq(
    $$
        select description from public.transactions
        where wallet_id in (tests.to_id('wallets', 'home'), tests.to_id('wallets', 'other'))
    $$,
    $$ values ('Rocket fuel') $$,
    'An outsider sees only their own wallet''s transactions'
);

select tests.clear_authentication();
select is_empty(
    $$ select 1 from public.transactions $$,
    'Logged-out users see no transactions'
);

select * from finish();

rollback;
