/**
 * Phase 5 — Redis-less AI assist quotas (Supabase pro_ai_quota).
 * Soft launch defaults: 3/day, 20/month. Unset key / agents off → local S2P never hits this.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AI_QUOTA_EXCEEDED_MESSAGE } from "@/lib/pro/ai-quota-shared";

export function getAiQuotaDailyLimit(): number {
  const n = Number.parseInt(process.env.PRO_AI_QUOTA_DAILY?.trim() ?? "", 10);
  if (!Number.isFinite(n) || n < 0) return 3;
  return Math.min(n, 1000);
}

export function getAiQuotaMonthlyLimit(): number {
  const n = Number.parseInt(process.env.PRO_AI_QUOTA_MONTHLY?.trim() ?? "", 10);
  if (!Number.isFinite(n) || n < 0) return 20;
  return Math.min(n, 10000);
}

type ConsumeResult = {
  ok: boolean;
  reason?: string;
  day?: number;
  month?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
};

function quotaExceededResponse(_reason?: string): NextResponse {
  return NextResponse.json(
    {
      error: AI_QUOTA_EXCEEDED_MESSAGE,
      code: "ai_quota_exceeded",
      reason: _reason === "monthly" ? "monthly" : "daily",
    },
    {
      status: 429,
      headers: {
        "Retry-After": "3600",
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * Atomically consume one AI run for this user.
 * Call only when about to invoke Anthropic (not for local prep).
 */
export async function consumeAiQuotaOrReject(
  userId: string,
  route: string,
  projectId?: string | null
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "AI quota is not configured (missing service role). Apply migration 20260720000007_pro_ai_quota.sql.",
        },
        { status: 503 }
      ),
    };
  }

  const daily = getAiQuotaDailyLimit();
  const monthly = getAiQuotaMonthlyLimit();

  const { data, error } = await admin.rpc("consume_pro_ai_run", {
    p_user_id: userId,
    p_daily_limit: daily,
    p_monthly_limit: monthly,
    p_route: route,
    p_project_id: projectId ?? null,
  });

  if (error) {
    console.error("[consumeAiQuotaOrReject]", error.message);
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "AI quota check failed. Apply migration 20260720000007_pro_ai_quota.sql, or use quick prep.",
        },
        { status: 503 }
      ),
    };
  }

  const result = data as ConsumeResult;
  if (!result?.ok) {
    return { ok: false, response: quotaExceededResponse(result?.reason) };
  }

  return { ok: true };
}

export type AiQuotaStatus = {
  day: number;
  month: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyRemaining: number;
  monthlyRemaining: number;
};

export async function getAiQuotaStatus(userId: string): Promise<AiQuotaStatus | null> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null;
  }

  const daily = getAiQuotaDailyLimit();
  const monthly = getAiQuotaMonthlyLimit();
  const { data, error } = await admin.rpc("get_pro_ai_quota", {
    p_user_id: userId,
    p_daily_limit: daily,
    p_monthly_limit: monthly,
  });

  if (error || !data) {
    console.error("[getAiQuotaStatus]", error?.message);
    return null;
  }

  const row = data as AiQuotaStatus;
  return {
    day: Number(row.day) || 0,
    month: Number(row.month) || 0,
    dailyLimit: Number(row.dailyLimit) || daily,
    monthlyLimit: Number(row.monthlyLimit) || monthly,
    dailyRemaining: Number(row.dailyRemaining) || 0,
    monthlyRemaining: Number(row.monthlyRemaining) || 0,
  };
}
