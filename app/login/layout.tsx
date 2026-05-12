import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — 35mmAI",
  description: "Sign in to your 35mmAI account",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>{children}</Suspense>
  );
}
