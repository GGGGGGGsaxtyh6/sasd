import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  typedRoutes: true,
  serverExternalPackages: ["better-sqlite3", "pino"],
};

export default nextConfig;
