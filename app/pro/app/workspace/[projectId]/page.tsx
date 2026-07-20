import { notFound } from "next/navigation";
import { ProWorkspaceClientLoader } from "@/components/pro/ProWorkspaceClientLoader";
import { getWorkspacePageData } from "@/lib/pro/get-workspace-page-data";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ openWorkflow?: string }>;
};

export default async function ProWorkspacePage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const { openWorkflow } = await searchParams;
  const data = await getWorkspacePageData(projectId);
  if (!data) notFound();

  return (
    <ProWorkspaceClientLoader
      projectId={data.project.id}
      projectName={data.project.name}
      initialState={data.state}
      initialUpdatedAt={data.updatedAt}
      claudeAgentsEnabled={data.claudeAgentsEnabled}
      openWorkflowInitially={openWorkflow === "1"}
    />
  );
}
