import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bootstrapDefaultProject, listProjectsForUser } from "@/lib/pro/bootstrap-default-project";
import { pickWorkspaceRedirectProject } from "@/lib/pro/pick-continue-project";
import { getProAccess } from "@/lib/entitlements";

/** Open the user's default project workspace (or most recent if unset). */
export default async function WorkspaceIndexPage() {
  const access = await getProAccess();
  if (access.retention) {
    redirect("/pro/app");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/pro/app/workspace");
  }

  await bootstrapDefaultProject(supabase, user.id);
  const { projects } = await listProjectsForUser(supabase, user.id);

  const targetId = pickWorkspaceRedirectProject(projects);
  if (targetId) {
    redirect(`/pro/app/workspace/${targetId}`);
  }

  redirect("/pro/app");
}
