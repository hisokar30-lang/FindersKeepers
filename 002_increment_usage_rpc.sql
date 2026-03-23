-- Increment usage counters for subscriptions
create or replace function public.increment_usage(
    p_subscription_id text,
    p_field text
)
returns void
language plpgsql
security definer
as $$
begin
    if p_field = 'items' then
        update public.subscriptions
        set items_used_this_period = coalesce(items_used_this_period, 0) + 1,
            updated_at = now()
        where id = p_subscription_id;
    elsif p_field = 'boosts' then
        update public.subscriptions
        set boosts_used_this_period = coalesce(boosts_used_this_period, 0) + 1,
            updated_at = now()
        where id = p_subscription_id;
    end if;
end;
$$;