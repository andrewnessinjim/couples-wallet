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

-- Each test inserts its own transaction as service_role (which bypasses RLS),
-- so no test sees another test's changes.
---------------------------------------------------

select plan(9);

----------------- Test 1: Outsider cannot update -----------------
select tests.authenticate_as_service_role();
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
    tests.to_id('transactions', 'coffee'),
    tests.to_id('wallets', 'home'),
    '2026-11-21',
    'Coffee',
    tests.to_id('categories', 'food'),
    12000,
    tests.get_supabase_uid('partner')
);

select tests.authenticate_as('outsider');
update public.transactions
set amount_minor = 11000
where id = tests.to_id('transactions','coffee');

select tests.authenticate_as('partner');
select is(
    (
        select amount_minor
        from public.transactions
        where id=tests.to_id('transactions','coffee')
    ),
    12000::bigint,
    'Outsider cannot update a transaction'
);

----------------- Test 2: Partner updates the owner's transaction -----------------
select tests.authenticate_as_service_role();
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
);

select tests.authenticate_as('partner');
update public.transactions
set amount_minor = 60000
where id = tests.to_id('transactions','dinner');

select is(
    (
        select amount_minor
        from public.transactions
        where id=tests.to_id('transactions','dinner')
    ),
    60000::bigint,
    'Partner can update the owner''s transactions'
);

----------------- Test 3: Partner updates their own transaction -----------------
select tests.authenticate_as_service_role();
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
    tests.to_id('transactions', 'groceries'),
    tests.to_id('wallets', 'home'),
    '2026-11-21',
    'Groceries',
    tests.to_id('categories', 'food'),
    12000,
    tests.get_supabase_uid('partner')
);

select tests.authenticate_as('partner');
update public.transactions
set amount_minor = 11000
where id = tests.to_id('transactions','groceries');

select is(
    (
        select amount_minor
        from public.transactions
        where id=tests.to_id('transactions','groceries')
    ),
    11000::bigint,
    'Partner can update their own transactions'
);

----------------- Test 4: created_by is locked -----------------
select tests.authenticate_as_service_role();
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
    tests.to_id('transactions', 'taxi'),
    tests.to_id('wallets', 'home'),
    '2026-11-21',
    'Taxi',
    tests.to_id('categories', 'food'),
    30000,
    tests.get_supabase_uid('partner')
);

select tests.authenticate_as('owner');
select throws_ok(
    $$
        update public.transactions
        set created_by = tests.get_supabase_uid('owner')
        where id = tests.to_id('transactions','taxi')
    $$,
    42501,
    null,
    'created_by cannot be spoofed'
);

----------------- Test 5: created_at is locked -----------------
select tests.authenticate_as_service_role();
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
    tests.to_id('transactions', 'movie'),
    tests.to_id('wallets', 'home'),
    '2026-11-21',
    'Movie',
    tests.to_id('categories', 'food'),
    40000,
    tests.get_supabase_uid('partner')
);

select tests.authenticate_as('owner');
select throws_ok(
    $$
        update public.transactions
        set created_at= now()
        where id = tests.to_id('transactions','movie')
    $$,
    42501,
    null,
    'created_at cannot be spoofed'
);

----------------- Test 6: wallet_id is locked -----------------
select tests.authenticate_as_service_role();
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
    tests.to_id('transactions', 'lunch'),
    tests.to_id('wallets', 'home'),
    '2026-11-21',
    'Lunch',
    tests.to_id('categories', 'restaurant'),
    25000,
    tests.get_supabase_uid('partner')
);

select tests.authenticate_as('partner');
select throws_ok(
    $$
        update public.transactions
        set wallet_id= tests.to_id('wallets', 'other')
        where id = tests.to_id('transactions','lunch')
    $$,
    42501,
    null,
    'wallet_id cannot be updated to move a transaction to another wallet'
);

----------- Test 7: category_id must belong to wallet -----------
select tests.authenticate_as_service_role();
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
    tests.to_id('transactions', 'snacks'),
    tests.to_id('wallets', 'home'),
    '2026-11-21',
    'Snacks',
    tests.to_id('categories', 'food'),
    5000,
    tests.get_supabase_uid('partner')
);

select tests.authenticate_as('partner');
select throws_ok(
    $$
        update public.transactions
        set category_id= tests.to_id('categories', 'space_travel')
        where id = tests.to_id('transactions','snacks')
    $$,
    23503,
    null,
    'category_id must belong to wallet'
);

----------- Test 8: category_id can be changed -----------
select tests.authenticate_as_service_role();
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
    tests.to_id('transactions', 'pizza'),
    tests.to_id('wallets', 'home'),
    '2026-11-21',
    'Pizza',
    tests.to_id('categories', 'food'),
    35000,
    tests.get_supabase_uid('partner')
);

select tests.authenticate_as('partner');
select lives_ok(
    $$
        update public.transactions
        set category_id= tests.to_id('categories', 'restaurant')
        where id = tests.to_id('transactions','pizza')
    $$,
    'category_id can be updated if the new category also belongs to the wallet'
);

select is(
    (select category_id
    from public.transactions
    where id = tests.to_id('transactions','pizza')),
    tests.to_id('categories', 'restaurant')::uuid,
    'The transaction is now in the new category'
);

select * from finish();

rollback;
