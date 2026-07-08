import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack breaks on the Google Drive symlink mount — dev/build use --webpack.
  reactStrictMode: true,
};

export default nextConfig;
