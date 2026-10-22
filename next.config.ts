import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this application. A second lockfile in the parent
  // Downloads directory otherwise makes Next infer the wrong workspace root.
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
