create function public.create_wallet(p_wallet_name text, p_owner_name text)
returns uuid
language plpgsql
security invoker
as
$$
declare
    v_wallet_id uuid;
begin
    insert into public.wallets(name)
    values (p_wallet_name)
    returning id into v_wallet_id;

    update public.profiles
    set name = p_owner_name
    where id = (select auth.uid());

    if not found then
        raise exception 'Profile not found for the user: %', auth.uid();
    end if;

    return v_wallet_id;
end;
$$;

grant execute on function public.create_wallet(text, text) to authenticated;