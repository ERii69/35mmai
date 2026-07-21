-- Enable permanent project delete from the app (projects row + project_state row).
-- Run after 20260213000003 and 20260213000004.
-- Safe to re-run: drops policies before recreate.

grant delete on table public.project_state to authenticated;

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
  on public.projects
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "project_state_delete_own" on public.project_state;
create policy "project_state_delete_own"
  on public.project_state
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_state.project_id
        and p.user_id = (select auth.uid())
    )
  );
