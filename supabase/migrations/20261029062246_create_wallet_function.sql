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

    insert into public.categories(wallet_id, name, type)
    values 
        (v_wallet_id, 'Groceries', 'expense'),
        (v_wallet_id, 'Dining Out', 'expense'),
        (v_wallet_id, 'Housing', 'expense'),
        (v_wallet_id, 'Utilities', 'expense'),
        (v_wallet_id, 'Transport', 'expense'),
        (v_wallet_id, 'Health', 'expense'),
        (v_wallet_id, 'Shopping', 'expense'),
        (v_wallet_id, 'Entertainment', 'expense'),
        (v_wallet_id, 'Subscriptions', 'expense'),
        (v_wallet_id, 'Travel', 'expense'),
        (v_wallet_id, 'Other', 'expense'),
        (v_wallet_id, 'Salary', 'income'),
        (v_wallet_id, 'Side income', 'income'),
        (v_wallet_id, 'Gifts', 'income'),
        (v_wallet_id, 'Refunds', 'income'),
        (v_wallet_id, 'Other', 'income');

    return v_wallet_id;
end;
$$;

grant execute on function public.create_wallet(text, text) to authenticated;