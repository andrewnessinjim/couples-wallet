create domain text_1_to_50 as text
check (length(trim(value)) between 1 and 50);

create table public.profiles(
    id uuid primary key references auth.users(id) on delete cascade,
    name text_1_to_50
);

alter table public.profiles enable row level security;

create policy "Users can update their names"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()));

revoke update on public.profiles from authenticated;
grant update(name) on public.profiles to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();