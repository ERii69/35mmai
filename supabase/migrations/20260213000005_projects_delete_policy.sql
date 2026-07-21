-- Allow users to permanently delete their own projects (cascades to project_state).

create policy "projects_delete_own"
  on public.projects
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
