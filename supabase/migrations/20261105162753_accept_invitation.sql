create or replace function public.accept_invitation(p_code uuid)
returns uuid
language plpgsql
security definer set search_path=''
as
$$
declare
    v_invitation_row public.invitations%rowtype;
    v_wallet_id uuid;
    v_owner_id uuid;
    v_email varchar;
    v_email_confirmed_at timestamptz;
begin
    select * into v_invitation_row
    from public.invitations i
    where i.id = p_code;

    if not found then
        raise exception 'Invitation not found' using errcode  = 'CW001';
    end if;

    select email, email_confirmed_at into v_email, v_email_confirmed_at
    from auth.users u
    where u.id = auth.uid();

    select w.owner_id into v_owner_id
    from public.wallets w
    where w.id = v_invitation_row.wallet_id;

    if v_owner_id = auth.uid() then
      raise exception 'Owner cannot be the partner' using errcode = 'CW002';
    end if;
    
    if lower(v_email) <> lower(v_invitation_row.partner_email) then
      raise exception 'Email mismatch' using errcode = 'CW003';
    end if;

    if v_email_confirmed_at is null then
      raise exception 'Email not confirmed' using errcode = 'CW004';
    end if;

    if exists(
      select 1
      from public.wallets w
      where w.owner_id = auth.uid() or w.partner_id = auth.uid()
    ) then
      raise exception 'User already has a wallet' using errcode = 'CW005';
    end if;

    update public.wallets w
    set partner_id = auth.uid()
    where w.id = v_invitation_row.wallet_id
          and w.partner_id is null
    returning w.id into v_wallet_id;

    if not found then
      raise exception 'Race condition: partner already updated' using errcode='CW006';
    end if;

    update public.profiles
    set name = v_invitation_row.partner_name
    where id = auth.uid();

    delete from public.invitations
    where id = p_code;

    return v_wallet_id;
end;
$$;

grant execute on function public.accept_invitation(uuid) to authenticated;
