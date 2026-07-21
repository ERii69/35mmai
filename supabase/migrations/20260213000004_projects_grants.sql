-- Run after 20260213000003_projects_and_project_state.sql if inserts from the app fail with permission errors.
-- Supabase Table Editor uses service role; the Next app uses the `authenticated` role.

grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update on table public.project_state to authenticated;
