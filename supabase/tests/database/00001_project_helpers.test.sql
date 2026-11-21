-- Project-specific test helpers. Runs right after the basejump helpers (00000).
-- Like those, these are created outside a transaction, so they stay in the local
-- database until the next `supabase db reset`. Never copy this into a migration.

-- Turns a readable label into a fixed uuid: tests.to_wallet_id('home') returns the
-- same uuid in every file and every run. It computes the id instead of looking it
-- up, so RLS can't hide anything from it, even inside $$ strings after
-- tests.authenticate_as(...).
create or replace function tests.to_wallet_id(label text)
returns uuid
language sql
immutable
as $$
    select md5('wallet:' || label)::uuid;
$$;

-- The basejump file revokes execute on new functions in the tests schema by default.
-- Tests call this while acting as a user, so those roles need it.
grant execute on function tests.to_wallet_id(text) to anon, authenticated, service_role;

-- pgTAP needs at least one test in every file.
begin;
select plan(3);

select function_returns('tests', 'to_wallet_id', array['text'], 'uuid');

select is(
    tests.to_wallet_id('home'),
    tests.to_wallet_id('home'),
    'The same label always gives the same id'
);

select isnt(
    tests.to_wallet_id('home'),
    tests.to_wallet_id('other'),
    'Different labels give different ids'
);

select * from finish();
rollback;
