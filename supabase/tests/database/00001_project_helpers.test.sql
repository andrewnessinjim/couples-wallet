-- Project-specific test helpers. Runs right after the basejump helpers (00000).
-- Like those, these are created outside a transaction, so they stay in the local
-- database until the next `supabase db reset`. Never copy this into a migration.

-- Turns a table name and a readable label into a fixed uuid:
-- tests.to_id('wallets', 'home') returns the same uuid in every file and every run.
-- The table name keeps ids apart across tables, so a wallet and a category can
-- both be labelled 'home'. It computes the id instead of looking it up, so RLS
-- can't hide anything from it, even inside $$ strings after tests.authenticate_as(...).
create or replace function tests.to_id(p_table text, p_label text)
returns uuid
language sql
immutable
as $$
    select md5(p_table || ':' || p_label)::uuid;
$$;

-- The basejump file revokes execute on new functions in the tests schema by default.
-- Tests call this while acting as a user, so those roles need it.
grant execute on function tests.to_id(text, text) to anon, authenticated, service_role;

-- Factory helpers: each one creates a single row, with its id from tests.to_id.
-- They insert straight into the tables, so call them during setup, before
-- tests.authenticate_as(...). No grant: only postgres, their owner, runs them.

-- tests.insert_wallet('home', 'owner') creates the wallet "Home" owned by the
-- basejump user 'owner'.
create or replace function tests.insert_wallet(p_label text, p_owner text)
returns uuid
language sql
set search_path = ''
as $$
    insert into public.wallets (id, name, owner_id)
    values (tests.to_id('wallets', p_label), initcap(p_label), tests.get_supabase_uid(p_owner))
    returning id;
$$;

-- tests.add_partner('home', 'partner') makes the basejump user 'partner' the
-- partner of the wallet 'home'.
create or replace function tests.add_partner(p_wallet text, p_partner text)
returns void
language sql
set search_path = ''
as $$
    update public.wallets
    set partner_id = tests.get_supabase_uid(p_partner)
    where id = tests.to_id('wallets', p_wallet);
$$;

-- tests.insert_category('home', 'food', 'Food', 'expense') creates the category
-- 'Food' in the wallet 'home', with the id tests.to_id('categories', 'food').
create or replace function tests.insert_category(p_wallet text, p_label text, p_name text, p_type text)
returns uuid
language sql
set search_path = ''
as $$
    insert into public.categories (id, wallet_id, name, type)
    values (tests.to_id('categories', p_label), tests.to_id('wallets', p_wallet), p_name, p_type)
    returning id;
$$;

-- pgTAP needs at least one test in every file.
begin;
select plan(7);

select function_returns('tests', 'to_id', array['text', 'text'], 'uuid');

select is(
    tests.to_id('wallets', 'home'),
    tests.to_id('wallets', 'home'),
    'The same table and label always give the same id'
);

select isnt(
    tests.to_id('wallets', 'home'),
    tests.to_id('wallets', 'other'),
    'Different labels give different ids'
);

select isnt(
    tests.to_id('wallets', 'home'),
    tests.to_id('categories', 'home'),
    'The same label in different tables gives different ids'
);

select tests.create_supabase_user('helper_owner');
select tests.create_supabase_user('helper_partner');

select tests.insert_wallet('helper_home', 'helper_owner');
select tests.add_partner('helper_home', 'helper_partner');
select tests.insert_category('helper_home', 'helper_food', 'Food', 'expense');

select results_eq(
    $$
        select name::text, owner_id, partner_id from public.wallets
        where id = tests.to_id('wallets', 'helper_home')
    $$,
    $$
        values ('Helper_home',tests.get_supabase_uid('helper_owner'), tests.get_supabase_uid('helper_partner'))
    $$,
    'insert_wallet and add_partner create the wallet with its owner and partner'
);

select results_eq(
    $$
        select wallet_id, name::text, type::text from public.categories
        where id = tests.to_id('categories', 'helper_food')
    $$,
    $$
        values (tests.to_id('wallets', 'helper_home'), 'Food', 'expense')
    $$,
    'insert_category creates the category in the right wallet'
);

select is(
    tests.insert_wallet('helper_second', 'helper_owner'),
    tests.to_id('wallets', 'helper_second'),
    'insert_wallet returns the id from to_id'
);

select * from finish();
rollback;
