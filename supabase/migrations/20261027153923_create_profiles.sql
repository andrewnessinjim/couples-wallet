create table public.profiles(
    id uuid primary key references auth.users(id) on delete cascade,
    name text_1_to_50
);

alter table public.profiles enable row level security;

create policy "Users can read their names and their partner names"
on public.profiles
for select
to authenticated
using (
    profiles.id = (select auth.uid())
    or exists (
        select 1
        from public.wallets w
        where ( w.owner_id = (select auth.uid()) and profiles.id = w.partner_id )
            or ( w.partner_id = (select auth.uid()) and w.owner_id = profiles.id )
    )
);

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


/*
 profiles - id, name
 invitations - id (same as the invitation code), wallet_id, partner_name, partner_email
 
 - **Auth**: register, login, logout.
 - **Onboarding**:
 create a wallet - entry in wallet, profile and invitation
 
 accept invitation - registration or login carries the code over partner email and partner name are part of the invitation, stored in invitations. Create a profile and link to wallets table.
 */