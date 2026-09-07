import type { SupabaseClient } from "@supabase/supabase-js";
import { shouldPurgeExpiredProjects } from "@/lib/pro/membership-policy";

export type PurgeExpiredResult = {
  usersScanned: number;
  usersPurged: number;
  projectsDeleted: number;
};

type ProfileRow = {
  id: string;
  subscription_status: string | null;
  subscription_current_period_end: string | null;
};

async function deleteProjectsForUser(
  admin: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await admin
    .from("projects")
    .delete()
    .eq("user_id", userId)
    .select("id");

  if (error) throw new Error(`purge projects: ${error.message}`);
  return data?.length ?? 0;
}

export async function purgeExpiredProjectsForUser(
  admin: SupabaseClient,
  profile: ProfileRow,
  now: Date = new Date()
): Promise<number> {
  if (!shouldPurgeExpiredProjects(profile, now)) return 0;
  return deleteProjectsForUser(admin, profile.id);
}

/** Service-role sweep — project_state rows cascade from projects. */
export async function purgeExpiredProjects(
  admin: SupabaseClient,
  now: Date = new Date()
): Promise<PurgeExpiredResult> {
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, subscription_status, subscription_current_period_end");

  if (error) throw new Error(`purge profiles: ${error.message}`);

  const rows = (profiles ?? []) as ProfileRow[];
  let usersPurged = 0;
  let projectsDeleted = 0;

  for (const profile of rows) {
    const deleted = await purgeExpiredProjectsForUser(admin, profile, now);
    if (deleted > 0) {
      usersPurged += 1;
      projectsDeleted += deleted;
    } else if (shouldPurgeExpiredProjects(profile, now)) {
      usersPurged += 1;
    }
  }

  return {
    usersScanned: rows.length,
    usersPurged,
    projectsDeleted,
  };
}
