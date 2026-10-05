import { ProPublicLanding } from "@/components/pro/ProPublicLanding";

export default function ProPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribe?: string; invite?: string }>;
}) {
  return <ProPublicLanding searchParams={searchParams} surface="pro" />;
}
