import { ProDashboardNewProjectFab } from "@/components/pro/ProDashboardNewProjectFab";
import { ProDashboardNewProjectSection } from "@/components/pro/ProDashboardNewProjectSection";
import { ProDashboardProjects } from "@/components/pro/ProDashboardProjects";
import { ProRetentionExportList } from "@/components/pro/ProRetentionExportList";
import { bootstrapDefaultProject, listProjectsForUser } from "@/lib/pro/bootstrap-default-project";
import { getProAccess } from "@/lib/entitlements";
import { enrichProjectsWithStats } from "@/lib/pro/load-dashboard-project-stats";
import { createClient } from "@/lib/supabase/server";

export default async function ProAppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = await getProAccess();

  let projects: Awaited<ReturnType<typeof enrichProjectsWithStats>> = [];
  let projectsError: string | null = null;

  if (user) {
    if (access.canWrite) {
      const boot = await bootstrapDefaultProject(supabase, user.id);
      if (!boot.ok) {
        projectsError = boot.error;
      }
    }
    const listed = await listProjectsForUser(supabase, user.id, {
      includeArchived: access.retention,
    });
    if (listed.error) projectsError = listed.error;
    projects = await enrichProjectsWithStats(supabase, listed.projects);
  }

  const hasProjects = projects.length > 0;
  const mapped = projects.map((p) => ({
    id: p.id,
    name: p.name,
    is_default: p.is_default,
    last_opened_at: p.last_opened_at,
    updated_at: p.updated_at,
    stats: p.stats,
  }));

  if (access.retention) {
    return (
      <div className="relative space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:space-y-8 md:pb-0">
        {projectsError ? (
          <p className="text-sm text-pro-warning" role="alert">
            Could not load projects: {projectsError}
          </p>
        ) : null}
        <h1 className="text-lg font-semibold text-pro-text">Export your projects</h1>
        <ProRetentionExportList projects={mapped} />
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:space-y-8 md:pb-0">
      {projectsError ? (
        <p className="text-sm text-pro-warning" role="alert">
          Could not load projects: {projectsError}
        </p>
      ) : null}

      <h1 className="sr-only">Dashboard</h1>

      {hasProjects ? (
        <>
          <div className="hidden md:block">
            <ProDashboardNewProjectSection compact />
          </div>
          <ProDashboardProjects projects={mapped} />
          <ProDashboardNewProjectFab variant="fab" />
        </>
      ) : (
        <ProDashboardNewProjectSection bordered={false} emptyHero />
      )}
    </div>
  );
}
