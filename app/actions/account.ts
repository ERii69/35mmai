"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccountActionResult =
  | { ok: true }
  | { ok: false; error: string };

const MAX_DISPLAY_NAME_LENGTH = 80;

export async function updateDisplayName(name: string): Promise<AccountActionResult> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, error: "Name is required." };
  }
  if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
    return { ok: false, error: `Name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in required." };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: trimmed,
      name: trimmed,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/pro/app");
  revalidatePath("/account");
  return { ok: true };
}
