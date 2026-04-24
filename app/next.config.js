/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,

  experimental: {
    outputFileTracingRoot: __dirname,
  },

  // Aggressive silencing of the lockfile warning
  webpack: (config) => {
    config.infrastructureLogging = {
      level: "error",
    };
    return config;
  },

  // Disable unnecessary logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

module.exports = nextConfig;