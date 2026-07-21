import { NextResponse } from "next/server";
import { isProEntitled } from "@/lib/entitlements";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import {
  buildExportCsv,
  proExportContentType,
  proExportFilename,
  type ProExportKind,
} from "@/lib/pro/export-csv";
import { loadExportSnapshot } from "@/lib/pro/load-export-snapshot";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const EXPORT_KINDS: ProExportKind[] = [
  "kit",
  "budget",
  "workflow",
  "visual",
  "shot-plan",
  "storyboard-md",
  "storyboard-html",
  "fountain",
  "fdx",
  "directors-prep",
  "directors-prep-md",
  "preproduction-report",
  "location-research-csv",
  "location-research-md",
  "prompt-pack-csv",
  "prompt-pack-md",
];

function isExportKind(value: string): value is ProExportKind {
  return EXPORT_KINDS.includes(value as ProExportKind);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string; kind: string }> }
) {
  const { projectId, kind: kindParam } = await context.params;
  const includeDrafts = new URL(request.url).searchParams.get("includeDrafts") === "1";

  if (!isExportKind(kindParam)) {
    return NextResponse.json({ error: "Invalid export type." }, { status: 400 });
  }

  if (!isProStackConfigured()) {
    return NextResponse.json({ error: "35mmAiPro is not configured on this server." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const entitled = await isProEntitled();
  if (!entitled) {
    return NextResponse.json({ error: "Active 35mmAiPro subscription required." }, { status: 403 });
  }

  const snapshot = await loadExportSnapshot(projectId, user.id);
  if (!snapshot) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const body = buildExportCsv(kindParam, snapshot.state, snapshot.projectName, {
    includeDrafts,
  });
  const filename = proExportFilename(snapshot.projectName, kindParam);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": proExportContentType(kindParam),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
