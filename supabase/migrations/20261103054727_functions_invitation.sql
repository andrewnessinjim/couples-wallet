create function public.find_invitation(p_code uuid)
returns table(wallet_name text, owner_name text, partner_name text, partner_email text, partner_has_account boolean)
language sql
stable
security definer set search_path =''
as
$$
select
     w.name as wallet_name,
     p.name as owner_name,
     i.partner_name,
     i.partner_email,
     exists(
            select 1
            from auth.users u
            where lower(u.email) = lower(i.partner_email)
            )
      as partner_has_account
from public.invitations i
     join public.wallets w on w.id = i.wallet_id
     join public.profiles p on p.id = w.owner_id
where i.id = p_code
      and w.partner_id is null;
$$;

grant execute on function public.find_invitation(uuid) to anon, authenticated;