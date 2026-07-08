// Single source of truth for personal + contact info.
// Sourced from career-ops/cv.md + config/profile.yml. Update here, the whole site follows.

export const profile = {
  name: "Deepak R",
  // The one-sentence positioning, FDE / AI-engineer tuned.
  tagline: "I build and ship real products fast — using AI as a force multiplier.",
  // Slightly longer hero support line.
  intro:
    "Software engineer who owns products end to end. I build automation pipelines, full-stack tools, and AI integrations — solo, in production, with real revenue and real users behind them.",
  location: "Chennai, India",
  timezone: "IST",
  availability: "Open to remote-first roles (IST-compatible)",
  email: "deepakrameshh@gmail.com",
  links: {
    github: "https://github.com/rdeepak-711",
    linkedin: "https://www.linkedin.com/in/rdeepak/",
  },
  // Headline metrics shown as a "proof bar" — the numbers that do the talking.
  stats: [
    { value: "32", label: "sites in 4 weeks", sub: "automation pipeline, from 5" },
    { value: "₹1L+", label: "affiliate revenue", sub: "first month of deployment" },
    { value: "550+", label: "daily active users", sub: "CrowdTracker, zero paid acquisition" },
    { value: "10K+", label: "emails/month classified", sub: "85–90% accuracy at UiPath" },
  ],
} as const;
