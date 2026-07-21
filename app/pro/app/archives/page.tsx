import { ProDashboardArchives } from "@/components/pro/ProDashboardArchives";
import { listArchivedProjects } from "@/app/actions/pro/projects";
import { enrichProjectsWithStats } from "@/lib/pro/load-dashboard-project-stats";
import { createClient } from "@/lib/supabase/server";

export default async function ProArchivesPage() {
  const result = await listArchivedProjects();
  const supabase = await createClient();

  const projects = result.ok
    ? await enrichProjectsWithStats(supabase, result.data)
    : [];

  return (
    <div className="relative space-y-8 pb-[calc(5rem+env(safe-area-inset-bottom))] md:space-y-10 md:pb-0 lg:space-y-12">
      {!result.ok ? (
        <p className="text-sm text-pro-warning" role="alert">
          Could not load archives: {result.error}
        </p>
      ) : null}
      <ProDashboardArchives
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          archived_at: p.archived_at,
          updated_at: p.updated_at,
          stats: p.stats,
        }))}
      />
    </div>
  );
}
