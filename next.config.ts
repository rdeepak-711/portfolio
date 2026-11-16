import type { NextConfig } from "next";
import { RETIRED_NOTE_SLUGS } from "./src/content/notes";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...RETIRED_NOTE_SLUGS.map((slug) => ({
        source: `/writing/${slug}`,
        destination: "/writing",
        permanent: true,
      })),
      // Old résumé link, already sent to recruiters; the duplicate PDF was deleted 16 Nov 2026.
      { source: "/deepak-ramesh-resume.pdf", destination: "/Deepak-R-Resume.pdf", permanent: true },
    ];
  },
};

export default nextConfig;
