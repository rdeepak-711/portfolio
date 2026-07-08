// Project data. To add a project later: append an object here and (optionally) a
// terminal detail page at app/projects/<slug>/page.tsx. The index renders from this.

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  year: string;
  url?: string;
  liveLabel?: string;
  stack: string[];
  heroMetric: string;
  // Short blurb for the index grid.
  summary: string;
  // Whether a deep terminal detail page exists yet.
  hasDetail: boolean;
};

export const projects: Project[] = [
  {
    slug: "outbuiltit",
    name: "Outbuiltit",
    tagline: "Multi-tenant WhatsApp booking SaaS",
    year: "2025–2026",
    url: "https://outbuiltit.com",
    liveLabel: "outbuiltit.com",
    stack: ["Next.js 16", "TypeScript", "TiDB Cloud", "Twilio", "Razorpay", "Prisma"],
    heroMetric: "Launched commercially · ₹999/mo · 79 passing tests",
    summary:
      "Salons and spas take bookings, enquiries, and payments entirely over WhatsApp — no app install. Multi-tenant, FSM-driven bot, AI info layer, full ops dashboard. Built from scratch, solo.",
    hasDetail: true,
  },
  {
    slug: "crowdtracker",
    name: "CrowdTracker",
    tagline: "Crowd-aware travel planning",
    year: "2025",
    url: "https://crowd-tracker.com",
    liveLabel: "crowd-tracker.com",
    stack: ["Next.js", "MySQL", "GCP", "SSR + API routes"],
    heroMetric: "550–600+ daily active users · zero paid acquisition",
    summary:
      "Helps travelers pick when to visit attractions based on crowd density and wait-time signals. Migrated React + PHP → Next.js SSR, which grew daily organic users from ~70 to 550+. Designed the data model, built frontend + API, deployed on GCP — solo.",
    hasDetail: false,
  },
  {
    slug: "firestorm-pipeline",
    name: "Site Automation Pipeline",
    tagline: "Multi-agent content + deployment engine",
    year: "2025–present",
    liveLabel: "Firestorm Internet",
    stack: ["Python", "Celery", "Redis", "Claude", "OpenAI", "WP-CLI", "GCP"],
    heroMetric: "5 → 32 sites in 4 weeks · ₹1L+ in month 1",
    summary:
      "End-to-end pipeline that generates content, sources images, and deploys configured WordPress sites with only a final human image review. Multi-agent architecture (generation separated from HTML rendering) on a durable Celery + Redis queue with retries, backoff, and dead-letter queues.",
    hasDetail: false,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
