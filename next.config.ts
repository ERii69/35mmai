import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
