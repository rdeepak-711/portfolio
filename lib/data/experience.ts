// Work history. Sourced from career-ops/cv.md. Add roles by appending here.

export type Role = {
  title: string;
  company: string;
  period: string;
  location: string;
  points: string[];
};

export const experience: Role[] = [
  {
    title: "Software Engineer II",
    company: "Firestorm Internet",
    period: "Jul 2025 — Present",
    location: "Chennai, IN",
    points: [
      "Led an end-to-end site automation pipeline that scaled WordPress production from 5 to 32 sites in 4 weeks — ₹1L+ in affiliate commissions in month one.",
      "Designed a multi-agent content architecture: separated content generation (Claude) from HTML/template rendering (Python + Claude). Quality jumped once each agent had one responsibility.",
      "Built a durable async job queue (Celery + Redis) — every long task runs as a worker with retry policies, exponential backoff, and dead-letter queues.",
      "Own containerization and CI/CD: Docker for FastAPI, Celery workers, and Next.js; automated delivery via Google Cloud Build on GCP.",
    ],
  },
  {
    title: "Associate RPA Developer",
    company: "UiPath",
    period: "Feb 2023 — Nov 2024",
    location: "Chennai, IN",
    points: [
      "Helped train and deploy an ML email-classification system routing 10K+ emails/month across 200+ client sources — 85–90% accuracy with an AI scientist.",
      "Integrated classification outputs with SAP and ServiceNow for downstream routing and validation — bridging ML to enterprise business logic.",
      "Redesigned exception handling and routing across integrations — improved workflow throughput by 70%.",
    ],
  },
];

export const skills = {
  Languages: ["Python", "TypeScript", "JavaScript", "Bash", "Java"],
  Backend: ["FastAPI", "Celery", "Redis", "REST", "Prisma"],
  Frontend: ["React", "Next.js (App Router)"],
  Data: ["MySQL", "TiDB Cloud", "PostgreSQL", "MongoDB"],
  "Cloud & DevOps": ["GCP", "Vercel", "Docker", "Cloud Build", "Git"],
  "AI / LLM": ["Claude", "OpenAI", "multi-agent", "structured output", "Claude Code"],
} as const;
