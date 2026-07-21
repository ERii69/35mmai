import type { ReactNode } from "react";
import { AuthNavBar } from "@/components/auth/AuthNavBar";
import { ProWebShell } from "@/components/pro/ProWebShell";
import { proAuth } from "@/components/pro/ux/pro-surfaces";

type Props = {
  mode: "login" | "signup";
  next?: string;
  /** Invite accept — logo + PRO only. */
  minimalChrome?: boolean;
  children: ReactNode;
};

export function AuthPageShell({ mode, next, minimalChrome = false, children }: Props) {
  return (
    <ProWebShell>
      <AuthNavBar next={next} minimal={minimalChrome} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 md:max-w-xl">
        <div className={proAuth.shellWide}>{children}</div>
      </main>
    </ProWebShell>
  );
}
