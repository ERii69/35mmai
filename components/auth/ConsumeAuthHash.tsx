"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthHash = {
  accessToken: string;
  refreshToken: string;
  type: string;
};

function readAuthHash(): AuthHash | null {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw || !raw.includes("access_token=")) return null;
  const params = new URLSearchParams(raw);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;
  return {
    accessToken,
    refreshToken,
    type: params.get("type") ?? "",
  };
}

/** Supabase email links land as #access_token on the site URL. Turn that into a session. */
export function ConsumeAuthHash() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const hash = readAuthHash();
    if (!hash) return;
    started.current = true;

    const supabase = createClient();
    void supabase.auth
      .setSession({
        access_token: hash.accessToken,
        refresh_token: hash.refreshToken,
      })
      .then(({ error }) => {
        const clean = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, "", clean);
        if (error) {
          router.replace("/auth/forgot-password?error=link");
          return;
        }
        if (hash.type === "recovery" || hash.type === "magiclink" || hash.type === "") {
          router.replace("/auth/update-password");
          return;
        }
        router.replace("/pro/app");
      });
  }, [router]);

  return null;
}
