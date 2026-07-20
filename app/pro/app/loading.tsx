import { ProSkeleton } from "@/components/pro/ux/ProSkeleton";

export default function ProAppLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading projects">
      <div className="flex items-center justify-between gap-4">
        <ProSkeleton className="h-8 w-32" />
        <ProSkeleton className="hidden h-10 w-28 rounded-full md:block" />
      </div>
      <ProSkeleton className="h-12 w-full rounded-xl md:hidden" />
      <ul className="flex flex-col gap-2 md:hidden">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <ProSkeleton className="h-[4.25rem] w-full rounded-xl" />
          </li>
        ))}
      </ul>
      <ul className="hidden gap-5 md:grid md:grid-cols-2 md:max-w-3xl">
        {[0, 1].map((i) => (
          <li key={i}>
            <ProSkeleton className="h-52 w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}
