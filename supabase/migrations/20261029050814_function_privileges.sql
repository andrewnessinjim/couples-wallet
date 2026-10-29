-- Because execute privileges are granted to public by postgres at the global level
alter default privileges revoke execute on functions from public;

-- Because execute privileges are granted to anon by Supabase at the schema level
alter default privileges in schema public revoke execute on functions from anon;
