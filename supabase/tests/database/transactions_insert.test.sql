begin;
create extension if not exists pgtap with schema extensions;

----------------- Test Data Setup -----------------
select tests.create_supabase_user('owner');
select tests.create_supabase_user('partner');
select tests.create_supabase_user('outsider');

select tests.insert_wallet('home', 'owner');
select tests.add_partner('home', 'partner');
select tests.insert_wallet('other', 'outsider');

select tests.insert_category('home', 'food', 'Food', 'expense');
select tests.insert_category('home', 'restaurant', 'Restaurant', 'expense');
select tests.insert_category('other', 'space_travel', 'Space Travel', 'expense');
---------------------------------------------------

select plan(6);

----------------- Test 1: Owner adds a transaction -----------------
select tests.authenticate_as('owner');
select lives_ok(
    $$
        insert into public.transactions
        (
            wallet_id,
            occurred_on,
            description,
            category_id,
            amount_minor
        ) values
        (
            tests.to_id('wallets', 'home'),
            '2026-11-21',
            'Rongkup''s Lee',
            tests.to_id('categories','restaurant'),
            50000
        )
    $$,
    'Owner can save a transaction in their wallet'
);

----------------- Test 2: created_by cannot be spoofed -----------------
select tests.authenticate_as('owner');
select throws_ok(
    $$
        insert into public.transactions
        (
            wallet_id,
            occurred_on,
            description,
            category_id,
            amount_minor,
            created_by
        ) values
        (
            tests.to_id('wallets', 'home'),
            '2026-11-21',
            'Rongkup''s Lee',
            tests.to_id('categories','restaurant'),
            50000,
            tests.get_supabase_uid('partner')
        )
    $$,
    '42501',
    null,
    'Owner cannot save a transaction under their partner''s name'
);


----------------- Test 3: Partner adds a transaction -----------------
select tests.authenticate_as('partner');
select lives_ok(
    $$
        insert into public.transactions
        (
            wallet_id,
            occurred_on,
            description,
            category_id,
            amount_minor
        ) values
        (
            tests.to_id('wallets', 'home'),
            '2026-11-21',
            'Rongkup''s Lee',
            tests.to_id('categories','restaurant'),
            50000
        )
    $$,
    'Partner can save a transaction in their wallet'
);

----------------- Test 4: Category must belong to the wallet -----------------
select tests.authenticate_as('partner');
select throws_ok(
    $$
        insert into public.transactions
        (
            wallet_id,
            occurred_on,
            description,
            category_id,
            amount_minor
        ) values
        (
            tests.to_id('wallets', 'home'),
            '2026-11-21',
            'Rongkup''s Lee',
            tests.to_id('categories','space_travel'),
            5000000
        )
    $$,
     '23503', --FK violation
     null,
    'Cannot use a category belonging to another wallet'
);


----------------- Test 5: Outsider cannot add a transaction -----------------
select tests.authenticate_as('outsider');
select throws_ok(
    $$ 
        insert into public.transactions
        (
            wallet_id,
            occurred_on,
            description,
            category_id,
            amount_minor
        ) values
        (
            tests.to_id('wallets', 'home'),
            '2026-11-21',
            'Rongkup''s Lee',
            tests.to_id('categories','restaurant'),
            50000
        )
    $$,
    '42501',
    null,
    'Non wallet-members cannot save transactions in that wallet'
);

----------------- Test 6: created_at cannot be spoofed -----------------
select tests.authenticate_as('outsider');
select throws_ok(
    $$ 
        insert into public.transactions
        (
            wallet_id,
            occurred_on,
            description,
            category_id,
            amount_minor,
            created_at
        ) values
        (
            tests.to_id('wallets', 'home'),
            '2026-11-21',
            'Rongkup''s Lee',
            tests.to_id('categories','restaurant'),
            50000,
            now()
        )
    $$,
    '42501',
    null,
    'created_at cannot be spoofed'
);

select * from finish();

rollback;