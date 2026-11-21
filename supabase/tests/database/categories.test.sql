begin;
create extension if not exists pgtap with schema extensions;


select plan(8);

select tests.create_supabase_user('owner');
select tests.create_supabase_user('partner');
select tests.create_supabase_user('outsider');

insert into public.wallets (id, name, owner_id)
values (tests.to_wallet_id('home'), 'Home', tests.get_supabase_uid('owner'));

insert into public.wallets (id, name, owner_id)
values (tests.to_wallet_id('other'), 'Other', tests.get_supabase_uid('outsider'));


update public.wallets
set partner_id=(select tests.get_supabase_uid('partner'))
where id = tests.to_wallet_id('home');

-- Outsider inserting a category for the home wallet that he is not a member of
select tests.authenticate_as('outsider');
select throws_ok(
    $$
        insert into public.categories(wallet_id, name, type)
        values (tests.to_wallet_id('home'), 'Salary','income')
    $$,
    42501,
    null,
    'Outsiders cannot insert categories for wallets they don''t belong to'
);

-- Outsider can only see categories linked to his wallet
select tests.authenticate_as_service_role();

insert into public.categories(wallet_id, name, type)
values (tests.to_wallet_id('home'), 'Food','expense');

insert into public.categories(wallet_id, name, type)
values (tests.to_wallet_id('home'), 'Restaurant','expense');

insert into public.categories(wallet_id, name, type)
values (tests.to_wallet_id('other'), 'Space Travel','expense');

select is(
    (select count(*)
    from public.categories
    where wallet_id in (tests.to_wallet_id('home'), tests.to_wallet_id('other'))),
    3::bigint,
    'Guard: the test wallets have 3 categories'
);


select tests.authenticate_as('outsider');
select bag_eq(
    $$
        select name::text
        from public.categories
        where wallet_id in (tests.to_wallet_id('home'), tests.to_wallet_id('other'))
    $$,
    $$ values ('Space Travel') $$,
    'The outsider sees only their own wallet''s categories'
);

-- Update and delete: blocked ones raise no error, they just affect 0 rows,
-- so each one is checked afterwards as service_role (which bypasses RLS).

-- Outsider tries to rename and delete Home's categories
update public.categories
set name = 'Hacked'
where wallet_id = tests.to_wallet_id('home') and name = 'Food';

delete from public.categories
where wallet_id = tests.to_wallet_id('home') and name = 'Restaurant';

select tests.authenticate_as_service_role();

select is(
    (select name::text from public.categories
     where wallet_id = tests.to_wallet_id('home') and name = 'Food'),
    'Food',
    'An outsider cannot rename a category of a wallet they don''t belong to'
);

select isnt_empty(
    $$ select 1 from public.categories
       where wallet_id = tests.to_wallet_id('home') and name = 'Restaurant' $$,
    'An outsider cannot delete a category of a wallet they don''t belong to'
);

-- Partner renames a Home category
select tests.authenticate_as('partner');

update public.categories
set name = 'Groceries'
where wallet_id = tests.to_wallet_id('home') and name = 'Food';

select tests.authenticate_as_service_role();

select isnt_empty(
    $$ select 1 from public.categories
       where wallet_id = tests.to_wallet_id('home') and name = 'Groceries' $$,
    'The partner can rename a category of their wallet'
);

-- Owner tries to move a Home category into a wallet they don't belong to
select tests.authenticate_as('owner');

select throws_ok(
    $$
        update public.categories
        set wallet_id = tests.to_wallet_id('other')
        where wallet_id = tests.to_wallet_id('home') and name = 'Groceries'
    $$,
    '42501',
    null,
    'A member cannot move a category into a wallet they don''t belong to'
);

-- Owner deletes a Home category
delete from public.categories
where wallet_id = tests.to_wallet_id('home') and name = 'Restaurant';

select tests.authenticate_as_service_role();

select is_empty(
    $$ select 1 from public.categories
       where wallet_id = tests.to_wallet_id('home') and name = 'Restaurant' $$,
    'The owner can delete a category of their wallet'
);

select * from finish();

rollback;