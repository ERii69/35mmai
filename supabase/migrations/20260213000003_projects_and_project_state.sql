-- 35mmAiPro: projects + cloud project_state (run after 20260212000001_profiles.sql)
-- Apply in Supabase SQL Editor or via CLI.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  archived_at timestamptz,
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_not_empty check (char_length(trim(name)) > 0)
);

comment on table public.projects is '35mmAiPro production projects; one row per film/workspace per user.';

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_user_active_idx on public.projects (user_id, last_opened_at desc)
  where archived_at is null;

-- At most one default non-archived project per user
create unique index if not exists projects_one_default_per_user
  on public.projects (user_id)
  where is_default = true and archived_at is null;

create table if not exists public.project_state (
  project_id uuid primary key references public.projects (id) on delete cascade,
  schema_version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.project_state is 'JSON workspace snapshot: kit, workflow, budget, AI-native bible/shot sections.';

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

drop trigger if exists project_state_set_updated_at on public.project_state;
create trigger project_state_set_updated_at
  before update on public.project_state
  for each row
  execute function public.set_updated_at();

-- RLS
alter table public.projects enable row level security;
alter table public.project_state enable row level security;

create policy "projects_select_own"
  on public.projects
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "projects_insert_own"
  on public.projects
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "projects_update_own"
  on public.projects
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "project_state_select_own"
  on public.project_state
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_state.project_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "project_state_insert_own"
  on public.project_state
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_state.project_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "project_state_update_own"
  on public.project_state
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_state.project_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_state.project_id
        and p.user_id = (select auth.uid())
    )
  );
