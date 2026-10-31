import type { NextConfig } from "next";
import { RETIRED_NOTE_SLUGS } from "./src/content/notes";

const nextConfig: NextConfig = {
  async redirects() {
    return RETIRED_NOTE_SLUGS.map((slug) => ({
      source: `/writing/${slug}`,
      destination: "/writing",
      permanent: true,
    }));
  },
};

export default nextConfig;
