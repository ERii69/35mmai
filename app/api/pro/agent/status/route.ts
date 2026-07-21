import { NextResponse } from "next/server";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";
import {
  getAiQuotaDailyLimit,
  getAiQuotaMonthlyLimit,
  getAiQuotaStatus,
} from "@/lib/pro/ai-quota";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Client-safe probe — key presence + remaining quota when signed in. Never exposes the key. */
export async function GET() {
  const configured = isClaudeAgentsConfigured();
  const base = {
    configured,
    dailyLimit: getAiQuotaDailyLimit(),
    monthlyLimit: getAiQuotaMonthlyLimit(),
  };

  if (!configured) {
    return NextResponse.json(base);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(base);
    }
    const quota = await getAiQuotaStatus(user.id);
    return NextResponse.json({
      ...base,
      quota,
    });
  } catch {
    return NextResponse.json(base);
  }
}
