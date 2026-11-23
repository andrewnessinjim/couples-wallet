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
);
---------------------------------------------------

select plan(3);

-- Blocked deletes raise no error, they just affect 0 rows,
-- so each one is checked afterwards as service_role (which bypasses RLS).

-- Outsider tries to delete a Home transaction
select tests.authenticate_as('outsider');

delete from public.transactions
where id = tests.to_id('transactions', 'dinner');

select tests.authenticate_as_service_role();
select isnt_empty(
    $$ select 1 from public.transactions where id = tests.to_id('transactions', 'dinner') $$,
    'An outsider cannot delete a transaction of a wallet they don''t belong to'
);

-- Partner deletes a transaction the owner added
select tests.authenticate_as('partner');

delete from public.transactions
where id = tests.to_id('transactions', 'dinner');

select tests.authenticate_as_service_role();
select is_empty(
    $$ select 1 from public.transactions where id = tests.to_id('transactions', 'dinner') $$,
    'The partner can delete a transaction the owner added'
);

-- Owner deletes a transaction the partner added
select tests.authenticate_as('owner');

delete from public.transactions
where id = tests.to_id('transactions', 'groceries');

select tests.authenticate_as_service_role();
select is_empty(
    $$ select 1 from public.transactions where id = tests.to_id('transactions', 'groceries') $$,
    'The owner can delete a transaction the partner added'
);

select * from finish();

rollback;
