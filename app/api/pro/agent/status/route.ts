import { NextResponse } from "next/server";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";

export const runtime = "nodejs";

/** Client-safe probe — key presence only, never exposes the value. */
export async function GET() {
  return NextResponse.json({ configured: isClaudeAgentsConfigured() });
}
