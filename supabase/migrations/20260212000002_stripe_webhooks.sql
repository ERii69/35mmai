-- Stripe webhook idempotency + subscription fields (run in Supabase SQL Editor after 20260212000001_profiles.sql)

create table if not exists public.stripe_events_processed (
  event_id text not null primary key,
  processed_at timestamptz not null default now()
);

comment on table public.stripe_events_processed is 'Stripe webhook event ids; insert after successful handling. RLS blocks JWT; service_role bypasses.';

alter table public.stripe_events_processed enable row level security;

-- No policies: deny authenticated/anon; service_role bypasses RLS for webhook Route Handler.

alter table public.profiles
  add column if not exists subscription_current_period_end timestamptz;

alter table public.profiles
  add column if not exists stripe_price_id text;
