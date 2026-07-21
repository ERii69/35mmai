import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — 35mmAiPro",
  description: "Sign in to your 35mmAiPro account",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex flex-1 bg-pro-base" />}>{children}</Suspense>
  );
}
