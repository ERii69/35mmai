-- Run in Supabase → SQL Editor (or via Supabase CLI) before using Stripe Checkout / Account billing UI.
-- Links auth.users to Stripe customer + subscription snapshot (webhooks will refine in a later migration).

create table if not exists public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  updated_at timestamptz not null default now()
);

comment on table public.profiles is '35mmAiPro billing profile; RLS scoped to auth.uid() = id.';

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
