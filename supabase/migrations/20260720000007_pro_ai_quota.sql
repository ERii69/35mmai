-- Phase 5 — Redis-less AI run quotas (service_role only; JWT denied via RLS).
-- Soft launch defaults: 3/day, 20/month (env overrides in app).

create table if not exists public.pro_ai_quota (
  user_id uuid not null references auth.users (id) on delete cascade,
  bucket text not null,
  run_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, bucket)
);

comment on table public.pro_ai_quota is
  'AI assist counters. bucket = d:YYYY-MM-DD (UTC day) or m:YYYY-MM (UTC month).';

create table if not exists public.pro_ai_run_log (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  route text not null,
  project_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists pro_ai_run_log_user_created_idx
  on public.pro_ai_run_log (user_id, created_at desc);

alter table public.pro_ai_quota enable row level security;
alter table public.pro_ai_run_log enable row level security;
-- No policies: deny authenticated/anon; service_role bypasses RLS.

create or replace function public.consume_pro_ai_run(
  p_user_id uuid,
  p_daily_limit integer,
  p_monthly_limit integer,
  p_route text default 'unknown',
  p_project_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  day_key text := 'd:' || to_char((timezone('utc', now())), 'YYYY-MM-DD');
  month_key text := 'm:' || to_char((timezone('utc', now())), 'YYYY-MM');
  day_count integer;
  month_count integer;
begin
  if p_daily_limit < 0 or p_monthly_limit < 0 then
    return jsonb_build_object('ok', false, 'reason', 'config');
  end if;

  insert into public.pro_ai_quota (user_id, bucket, run_count)
  values (p_user_id, day_key, 0)
  on conflict (user_id, bucket) do nothing;

  insert into public.pro_ai_quota (user_id, bucket, run_count)
  values (p_user_id, month_key, 0)
  on conflict (user_id, bucket) do nothing;

  select run_count into day_count
  from public.pro_ai_quota
  where user_id = p_user_id and bucket = day_key
  for update;

  select run_count into month_count
  from public.pro_ai_quota
  where user_id = p_user_id and bucket = month_key
  for update;

  if day_count >= p_daily_limit then
    return jsonb_build_object(
      'ok', false,
      'reason', 'daily',
      'day', day_count,
      'month', month_count,
      'dailyLimit', p_daily_limit,
      'monthlyLimit', p_monthly_limit
    );
  end if;

  if month_count >= p_monthly_limit then
    return jsonb_build_object(
      'ok', false,
      'reason', 'monthly',
      'day', day_count,
      'month', month_count,
      'dailyLimit', p_daily_limit,
      'monthlyLimit', p_monthly_limit
    );
  end if;

  update public.pro_ai_quota
  set run_count = run_count + 1, updated_at = now()
  where user_id = p_user_id and bucket = day_key;

  update public.pro_ai_quota
  set run_count = run_count + 1, updated_at = now()
  where user_id = p_user_id and bucket = month_key;

  insert into public.pro_ai_run_log (user_id, route, project_id)
  values (p_user_id, coalesce(nullif(trim(p_route), ''), 'unknown'), p_project_id);

  return jsonb_build_object(
    'ok', true,
    'day', day_count + 1,
    'month', month_count + 1,
    'dailyLimit', p_daily_limit,
    'monthlyLimit', p_monthly_limit
  );
end;
$$;

revoke all on function public.consume_pro_ai_run(uuid, integer, integer, text, uuid) from public;
grant execute on function public.consume_pro_ai_run(uuid, integer, integer, text, uuid) to service_role;

create or replace function public.get_pro_ai_quota(
  p_user_id uuid,
  p_daily_limit integer,
  p_monthly_limit integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  day_key text := 'd:' || to_char((timezone('utc', now())), 'YYYY-MM-DD');
  month_key text := 'm:' || to_char((timezone('utc', now())), 'YYYY-MM');
  day_count integer := 0;
  month_count integer := 0;
begin
  select coalesce((select run_count from public.pro_ai_quota where user_id = p_user_id and bucket = day_key), 0)
  into day_count;
  select coalesce((select run_count from public.pro_ai_quota where user_id = p_user_id and bucket = month_key), 0)
  into month_count;

  return jsonb_build_object(
    'day', day_count,
    'month', month_count,
    'dailyLimit', p_daily_limit,
    'monthlyLimit', p_monthly_limit,
    'dailyRemaining', greatest(p_daily_limit - day_count, 0),
    'monthlyRemaining', greatest(p_monthly_limit - month_count, 0)
  );
end;
$$;

revoke all on function public.get_pro_ai_quota(uuid, integer, integer) from public;
grant execute on function public.get_pro_ai_quota(uuid, integer, integer) to service_role;
