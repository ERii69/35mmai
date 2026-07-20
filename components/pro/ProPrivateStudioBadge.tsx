import {
  PRO_PRIVATE_STUDIO_TAGLINE,
} from "@/lib/pro/membership-policy";

type Props = {
  className?: string;
};

/** Private-account cue — legal links live in header nav. */
export function ProPrivateStudioBadge({ className }: Props) {
  return (
    <p
      className={`max-w-2xl text-sm font-medium leading-snug text-pro-text sm:text-[15px] ${className ?? ""}`}
    >
      {PRO_PRIVATE_STUDIO_TAGLINE}
    </p>
  );
}
