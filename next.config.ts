import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev scripts and the live reload socket are blocked on 127.0.0.1 unless
  // this host is listed. Without them the catalog HTML paints and the search
  // box accepts typing, but the list never filters.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      // Must be >= PROJECT_STATE_MAX_BYTES in lib/pro/types.ts (see docs/project-state-size-limits.md)
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
