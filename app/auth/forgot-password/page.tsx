import { Suspense } from "react";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password — 35mmAiPro",
  description: "Send a link to choose a new 35mmAiPro password",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 bg-pro-base" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
