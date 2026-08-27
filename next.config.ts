import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2", "drizzle-orm"],
};

export default nextConfig;
