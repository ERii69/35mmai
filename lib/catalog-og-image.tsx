import { ImageResponse } from "next/og";

export const CATALOG_OG_SIZE = { width: 1200, height: 630 };

export function catalogOgImage(opts: { kicker?: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0f0f0f",
          backgroundImage:
            "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(225, 29, 72, 0.18), transparent 58%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#E11D48",
            marginBottom: 22,
          }}
        >
          {opts.kicker ?? "35mmAi"}
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: "#F5F5F5",
            lineHeight: 1.12,
            maxWidth: 980,
          }}
        >
          {opts.title}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 500,
            color: "#A3A3A3",
            lineHeight: 1.35,
            maxWidth: 920,
          }}
        >
          {opts.subtitle}
        </div>
      </div>
    ),
    { ...CATALOG_OG_SIZE }
  );
}
