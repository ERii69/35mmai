import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — 35mmAiPro",
  description: "Create a 35mmAiPro account for cloud projects and prompt packs",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex flex-1 bg-pro-base" />}>{children}</Suspense>
  );
}
