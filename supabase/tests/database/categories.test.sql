begin;
create extension if not exists pgtap with schema extensions;

----------------- Test Data Setup -----------------
select tests.create_supabase_user('owner');
select tests.create_supabase_user('partner');
select tests.create_supabase_user('outsider');

select tests.insert_wallet('home', 'owner');
select tests.add_partner('home', 'partner');
select tests.insert_wallet('other', 'outsider');

-- Shared by the read-only tests (2 and 3). Tests that change data
-- insert their own category, so no test sees another test's changes.
select tests.insert_category('home', 'food', 'Food', 'expense');
select tests.insert_category('home', 'restaurant', 'Restaurant', 'expense');
select tests.insert_category('other', 'space_travel', 'Space Travel', 'expense');
---------------------------------------------------

select plan(8);

-- Blocked updates and deletes raise no error, they just affect 0 rows,
-- so each one is checked afterwards as service_role (which bypasses RLS).

----------------- Test 1: Outsider cannot insert -----------------
select tests.authenticate_as('outsider');
select throws_ok(
    $$
        insert into public.categories
        (
            wallet_id,
            name,
            type
        ) values
        (
            tests.to_id('wallets', 'home'),
            'Salary',
            'income'
        )
    $$,
    '42501',
    null,
    'Outsiders cannot insert categories for wallets they don''t belong to'
);

----------------- Test 2: Guard -----------------
select tests.authenticate_as_service_role();
select is(
    (
        select count(*)
        from public.categories
        where id in (
            tests.to_id('categories', 'food'),
            tests.to_id('categories', 'restaurant'),
            tests.to_id('categories', 'space_travel')
        )
    ),
    3::bigint,
    'Guard: the shared setup categories exist'
);

----------------- Test 3: Outsider sees only their own categories -----------------
select tests.authenticate_as('outsider');
select bag_eq(
    $$
        select name::text
        from public.categories
        where wallet_id in (tests.to_id('wallets', 'home'), tests.to_id('wallets', 'other'))
    $$,
    $$ values ('Space Travel') $$,
    'The outsider sees only their own wallet''s categories'
);

----------------- Test 4: Outsider cannot rename -----------------
select tests.authenticate_as_service_role();
select tests.insert_category('home', 'utilities', 'Utilities', 'expense');

select tests.authenticate_as('outsider');
update public.categories
set name = 'Hacked'
where id = tests.to_id('categories', 'utilities');

select tests.authenticate_as_service_role();
select is(
    (
        select name::text
        from public.categories
        where id = tests.to_id('categories', 'utilities')
    ),
    'Utilities',
    'An outsider cannot rename a category of a wallet they don''t belong to'
);

----------------- Test 5: Outsider cannot delete -----------------
select tests.authenticate_as_service_role();
select tests.insert_category('home', 'rent', 'Rent', 'expense');

select tests.authenticate_as('outsider');
delete from public.categories
where id = tests.to_id('categories', 'rent');

select tests.authenticate_as_service_role();
select isnt_empty(
    $$ select 1 from public.categories where id = tests.to_id('categories', 'rent') $$,
    'An outsider cannot delete a category of a wallet they don''t belong to'
);

----------------- Test 6: Partner renames a category -----------------
select tests.authenticate_as_service_role();
select tests.insert_category('home', 'fuel', 'Fuel', 'expense');

select tests.authenticate_as('partner');
update public.categories
set name = 'Gas'
where id = tests.to_id('categories', 'fuel');

select tests.authenticate_as_service_role();
select is(
    (
        select name::text
        from public.categories
        where id = tests.to_id('categories', 'fuel')
    ),
    'Gas',
    'The partner can rename a category of their wallet'
);

----------------- Test 7: Owner cannot move a category to another wallet -----------------
select tests.authenticate_as_service_role();
select tests.insert_category('home', 'gifts', 'Gifts', 'expense');

select tests.authenticate_as('owner');
select throws_ok(
    $$
        update public.categories
        set wallet_id = tests.to_id('wallets', 'other')
        where id = tests.to_id('categories', 'gifts')
    $$,
    '42501',
    null,
    'A member cannot move a category into a wallet they don''t belong to'
);

----------------- Test 8: Owner deletes a category -----------------
select tests.authenticate_as_service_role();
select tests.insert_category('home', 'travel', 'Travel', 'expense');

select tests.authenticate_as('owner');
delete from public.categories
where id = tests.to_id('categories', 'travel');

select tests.authenticate_as_service_role();
select is_empty(
    $$ select 1 from public.categories where id = tests.to_id('categories', 'travel') $$,
    'The owner can delete a category of their wallet'
);

select * from finish();

rollback;
